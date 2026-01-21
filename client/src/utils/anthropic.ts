/**
 * Anthropic Claude Integration - Client-Side Utilities
 *
 * Utilitários para integração com a API Claude (Anthropic):
 * - Formatação de mensagens
 * - Estimativa de tokens
 * - Cache de respostas
 * - Rate limiting client-side
 * - Streaming helpers
 * - Prompt engineering utilities
 *
 * Nota: Chamadas reais à API devem ser feitas pelo backend.
 * Este módulo fornece utilitários de suporte para o frontend.
 */

import { aiCache, CACHE_TTLS } from './cache';

// ========================
// Tipos
// ========================

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeRequest {
  model: ClaudeModel;
  messages: ClaudeMessage[];
  system?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface ClaudeResponse {
  id: string;
  content: string;
  model: string;
  stopReason: 'end_turn' | 'max_tokens' | 'stop_sequence';
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface TokenEstimate {
  inputTokens: number;
  estimatedCost: number;
  isWithinLimit: boolean;
  warning?: string;
}

export type ClaudeModel =
  | 'claude-sonnet-4-5-20250514'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-opus-20240229'
  | 'claude-3-haiku-20240307';

// ========================
// Constantes
// ========================

export const CLAUDE_MODELS = {
  SONNET_4_5: 'claude-sonnet-4-5-20250514' as ClaudeModel,
  SONNET_3_5: 'claude-3-5-sonnet-20241022' as ClaudeModel,
  OPUS: 'claude-3-opus-20240229' as ClaudeModel,
  HAIKU: 'claude-3-haiku-20240307' as ClaudeModel,
} as const;

export const MODEL_LIMITS: Record<ClaudeModel, { maxTokens: number; contextWindow: number }> = {
  'claude-sonnet-4-5-20250514': { maxTokens: 8192, contextWindow: 200000 },
  'claude-3-5-sonnet-20241022': { maxTokens: 8192, contextWindow: 200000 },
  'claude-3-opus-20240229': { maxTokens: 4096, contextWindow: 200000 },
  'claude-3-haiku-20240307': { maxTokens: 4096, contextWindow: 200000 },
};

// Preços por 1M tokens (input/output) em USD
export const MODEL_PRICING: Record<ClaudeModel, { input: number; output: number }> = {
  'claude-sonnet-4-5-20250514': { input: 3.00, output: 15.00 },
  'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
  'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
};

// ========================
// Estimativa de Tokens
// ========================

/**
 * Estima número de tokens em um texto
 * Regra aproximada: 1 token ≈ 4 caracteres em inglês, 2-3 em português
 */
export function estimateTokens(text: string): number {
  // Aproximação mais precisa para português
  const charCount = text.length;
  const wordCount = text.split(/\s+/).length;

  // Média ponderada entre caracteres/3 e palavras*1.3
  return Math.ceil((charCount / 3 + wordCount * 1.3) / 2);
}

/**
 * Estima tokens de uma conversa completa
 */
export function estimateConversationTokens(
  messages: ClaudeMessage[],
  system?: string
): TokenEstimate {
  let totalTokens = 0;

  // Sistema prompt
  if (system) {
    totalTokens += estimateTokens(system);
  }

  // Mensagens
  messages.forEach(msg => {
    totalTokens += estimateTokens(msg.content);
    totalTokens += 4; // Overhead por mensagem (role, formatting)
  });

  // Custo estimado (usando Sonnet como padrão)
  const estimatedCost = (totalTokens / 1_000_000) * MODEL_PRICING['claude-sonnet-4-5-20250514'].input;

  return {
    inputTokens: totalTokens,
    estimatedCost: Math.round(estimatedCost * 10000) / 10000, // 4 casas decimais
    isWithinLimit: totalTokens < MODEL_LIMITS['claude-sonnet-4-5-20250514'].contextWindow,
    warning: totalTokens > 100000 ? 'Conversa muito longa, considere resumir.' : undefined,
  };
}

/**
 * Calcula custo estimado de uma requisição
 */
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: ClaudeModel = CLAUDE_MODELS.SONNET_4_5
): number {
  const pricing = MODEL_PRICING[model];
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return Math.round((inputCost + outputCost) * 10000) / 10000;
}

// ========================
// Formatação de Mensagens
// ========================

/**
 * Formata mensagens para o formato esperado pela API
 */
export function formatMessages(
  userMessage: string,
  history: ClaudeMessage[] = []
): ClaudeMessage[] {
  return [
    ...history,
    { role: 'user', content: userMessage },
  ];
}

/**
 * Trunca conversa para caber no limite de contexto
 */
export function truncateConversation(
  messages: ClaudeMessage[],
  maxTokens: number = 150000
): ClaudeMessage[] {
  const result: ClaudeMessage[] = [];
  let currentTokens = 0;

  // Mantém sempre a última mensagem
  const lastMessage = messages[messages.length - 1];
  if (lastMessage) {
    currentTokens = estimateTokens(lastMessage.content);
    result.unshift(lastMessage);
  }

  // Adiciona mensagens anteriores até o limite
  for (let i = messages.length - 2; i >= 0; i--) {
    const msg = messages[i];
    const msgTokens = estimateTokens(msg.content);

    if (currentTokens + msgTokens > maxTokens) {
      break;
    }

    currentTokens += msgTokens;
    result.unshift(msg);
  }

  return result;
}

/**
 * Adiciona contexto TDAH ao sistema prompt
 */
export function addTDAHContext(basePrompt: string): string {
  return `${basePrompt}

CONTEXTO IMPORTANTE - TDAH:
- Use linguagem direta e clara
- Quebre informações em chunks pequenos
- Priorize ação sobre explicação extensa
- Use bullet points e listas
- Destaque próximos passos imediatos
- Evite sobrecarga de informação
- Celebre pequenas vitórias`;
}

// ========================
// Cache Helpers
// ========================

/**
 * Gera chave de cache única para uma requisição
 */
export function generateCacheKey(
  prompt: string,
  model: ClaudeModel,
  systemPrompt?: string
): string {
  const content = `${model}:${systemPrompt || ''}:${prompt}`;
  return aiCache.generateKey(content);
}

/**
 * Tenta obter resposta do cache
 */
export async function getCachedResponse(
  prompt: string,
  model: ClaudeModel = CLAUDE_MODELS.SONNET_4_5
): Promise<ClaudeResponse | undefined> {
  return aiCache.get<ClaudeResponse>(prompt, model);
}

/**
 * Armazena resposta no cache
 */
export async function cacheResponse(
  prompt: string,
  response: ClaudeResponse,
  model: ClaudeModel = CLAUDE_MODELS.SONNET_4_5
): Promise<void> {
  return aiCache.set(prompt, response, model);
}

// ========================
// Rate Limiting Client-Side
// ========================

interface RateLimitState {
  requests: number;
  windowStart: number;
  isLimited: boolean;
}

const rateLimitState: RateLimitState = {
  requests: 0,
  windowStart: Date.now(),
  isLimited: false,
};

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 10; // 10 requisições por minuto (client-side)

/**
 * Verifica e atualiza rate limit
 */
export function checkRateLimit(): { allowed: boolean; waitTime?: number } {
  const now = Date.now();

  // Reset window se passou o tempo
  if (now - rateLimitState.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitState.requests = 0;
    rateLimitState.windowStart = now;
    rateLimitState.isLimited = false;
  }

  if (rateLimitState.requests >= RATE_LIMIT_MAX) {
    const waitTime = RATE_LIMIT_WINDOW - (now - rateLimitState.windowStart);
    return { allowed: false, waitTime };
  }

  rateLimitState.requests++;
  return { allowed: true };
}

/**
 * Reseta o rate limit (útil para testes)
 */
export function resetRateLimit(): void {
  rateLimitState.requests = 0;
  rateLimitState.windowStart = Date.now();
  rateLimitState.isLimited = false;
}

// ========================
// Streaming Helpers
// ========================

/**
 * Processa chunks de streaming
 */
export function parseStreamChunk(chunk: string): string | null {
  try {
    // Formato SSE: data: {...}
    if (chunk.startsWith('data: ')) {
      const jsonStr = chunk.slice(6);
      if (jsonStr === '[DONE]') return null;

      const data = JSON.parse(jsonStr);
      if (data.type === 'content_block_delta') {
        return data.delta?.text || '';
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Cria um handler para streaming responses
 */
export function createStreamHandler(
  onChunk: (text: string) => void,
  onComplete: (fullText: string) => void,
  onError?: (error: Error) => void
) {
  let fullText = '';

  return {
    handleChunk: (chunk: string) => {
      const text = parseStreamChunk(chunk);
      if (text) {
        fullText += text;
        onChunk(text);
      }
    },
    handleComplete: () => {
      onComplete(fullText);
    },
    handleError: (error: Error) => {
      if (onError) onError(error);
    },
  };
}

// ========================
// Prompt Engineering
// ========================

/**
 * Templates de sistema prompt para diferentes contextos
 */
export const SYSTEM_PROMPTS = {
  PLANNER: `Você é um planejador especializado em produtividade para pessoas com TDAH.
Siga a metodologia Barkley de ciclos de 3 dias.
Priorize tarefas como A (essencial), B (importante), C (bônus).
Seja conciso e orientado à ação.`,

  COACH: `Você é um coach de produtividade especializado em TDAH.
Use técnicas baseadas em evidências.
Seja encorajador mas realista.
Celebre progressos e normalize desafios.`,

  DECOMPOSER: `Você é um especialista em decomposição de tarefas.
Quebre tarefas complexas em ações de no máximo 25 minutos.
Defina critérios claros de "done" para cada subtarefa.
Identifique a primeira ação concreta para cada item.`,

  VALIDATOR: `Você é um validador de planos e objetivos.
Avalie viabilidade considerando capacidade cognitiva limitada.
Identifique riscos e sugira mitigações.
Use critérios SMART para validar objetivos.`,

  UNBLOCK: `Você é um especialista em desbloqueio mental.
Use perguntas socráticas para identificar barreiras.
Sugira técnicas práticas para superar bloqueios.
Foque em ações pequenas e imediatas.`,
};

/**
 * Enriquece prompt com contexto adicional
 */
export function enrichPrompt(
  prompt: string,
  context?: {
    currentTask?: string;
    energyLevel?: number;
    timeAvailable?: number;
    previousContext?: string;
  }
): string {
  let enriched = prompt;

  if (context?.currentTask) {
    enriched = `[Tarefa atual: ${context.currentTask}]\n\n${enriched}`;
  }

  if (context?.energyLevel !== undefined) {
    enriched = `[Nível de energia: ${context.energyLevel}/10]\n${enriched}`;
  }

  if (context?.timeAvailable) {
    enriched = `[Tempo disponível: ${context.timeAvailable} minutos]\n${enriched}`;
  }

  if (context?.previousContext) {
    enriched = `[Contexto anterior: ${context.previousContext}]\n\n${enriched}`;
  }

  return enriched;
}

// ========================
// Utilities de Resposta
// ========================

/**
 * Extrai tarefas de uma resposta da IA
 */
export function extractTasksFromResponse(response: string): Array<{
  title: string;
  priority?: 'A' | 'B' | 'C';
  estimatedMinutes?: number;
}> {
  const tasks: Array<{ title: string; priority?: 'A' | 'B' | 'C'; estimatedMinutes?: number }> = [];

  // Padrão: - [A/B/C] Tarefa (Xmin)
  const taskPattern = /[-•]\s*(?:\[([ABC])\])?\s*(.+?)(?:\((\d+)\s*min(?:utos?)?\))?$/gm;

  let match;
  while ((match = taskPattern.exec(response)) !== null) {
    tasks.push({
      priority: match[1] as 'A' | 'B' | 'C' | undefined,
      title: match[2].trim(),
      estimatedMinutes: match[3] ? parseInt(match[3], 10) : undefined,
    });
  }

  return tasks;
}

/**
 * Extrai score de viabilidade de uma resposta
 */
export function extractViabilityScore(response: string): number | null {
  const scorePattern = /(?:viabilidade|score|pontuação)[:\s]*(\d{1,3})(?:\s*%|\/100)?/i;
  const match = response.match(scorePattern);
  if (match) {
    const score = parseInt(match[1], 10);
    return score > 100 ? 100 : score;
  }
  return null;
}

/**
 * Formata resposta para exibição (markdown básico)
 */
export function formatResponseForDisplay(response: string): string {
  return response
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- /gm, '• ')
    .replace(/^(\d+)\. /gm, '$1. ')
    .replace(/\n/g, '<br>');
}

// ========================
// Export Default
// ========================

export default {
  // Modelos
  CLAUDE_MODELS,
  MODEL_LIMITS,
  MODEL_PRICING,

  // Tokens
  estimateTokens,
  estimateConversationTokens,
  calculateCost,

  // Mensagens
  formatMessages,
  truncateConversation,
  addTDAHContext,

  // Cache
  generateCacheKey,
  getCachedResponse,
  cacheResponse,

  // Rate Limit
  checkRateLimit,
  resetRateLimit,

  // Streaming
  parseStreamChunk,
  createStreamHandler,

  // Prompts
  SYSTEM_PROMPTS,
  enrichPrompt,

  // Utilidades
  extractTasksFromResponse,
  extractViabilityScore,
  formatResponseForDisplay,
};
