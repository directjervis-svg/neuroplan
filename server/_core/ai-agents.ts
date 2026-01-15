/**
 * AI Agents Module - Multi-Agent Architecture for NeuroExecução
 * 
 * This module implements 5 specialized AI agents for project planning:
 * 1. Charter Analysis Agent - Validates SMART goals
 * 2. WBS Agent - Decomposes projects into deliverables
 * 3. Task Generation Agent - Generates tasks adapted to user profile
 * 4. Cycle Validation Agent - Validates cycle viability
 * 5. Unblocking Agent - Diagnoses and solves task blockers
 */

import { callLLM } from './llm';

// ============================================================================
// TYPES
// ============================================================================

export interface CharterAnalysisResult {
  is_specific: boolean;
  is_measurable: boolean;
  suggested_reformulation: string | null;
  potential_scope_issues: string[];
  clarity_score: number; // 1-10
}

export interface Deliverable {
  name: string;
  description: string;
  estimated_effort: number; // 1-5
  depends_on: number[] | null; // indices of dependencies
}

export interface WBSResult {
  deliverables: Deliverable[];
  rationale: string;
}

export interface Task {
  title: string; // max 8 words
  description: string; // 1-2 sentences
  estimated_duration_minutes: number;
  first_action: string; // first physical action to start
  done_when: string; // completion criteria
}

export interface TaskGenerationResult {
  tasks: Task[];
}

export interface CycleValidationResult {
  is_viable: boolean;
  total_cognitive_load: number; // in minutes
  load_vs_capacity_ratio: number; // should be < 1.0
  context_switches_per_day: number[]; // [day1, day2, day3]
  potential_blockers: number[]; // task IDs
  suggested_adjustments: Array<{
    task_id: number;
    issue: string;
    suggestion: string;
  }>;
}

export interface UnblockingSolution {
  type: 'decompose' | 'clarify' | 'substitute' | 'skip';
  description: string;
  immediate_action: string; // 5-minute action
}

export interface UnblockingResult {
  diagnosis: string;
  root_cause: 'vague_task' | 'too_difficult' | 'missing_info' | 'emotional_block' | 'unclear_outcome';
  solutions: UnblockingSolution[];
}

export type GranularityLevel = 'macro' | 'meso' | 'micro';
export type StructuringStyle = 'top_down' | 'bottom_up';

export interface UserProfile {
  granularity_level: GranularityLevel;
  structuring_style: StructuringStyle;
  cognitive_capacity_minutes: number;
}

// ============================================================================
// AGENT 1: CHARTER ANALYSIS AGENT
// ============================================================================

export async function analyzeCharter(
  userInput: string
): Promise<CharterAnalysisResult> {
  const prompt = `Você é um especialista em definição de objetivos para pessoas com TDAH. Analise o seguinte resultado desejado:

"${userInput}"

Seu trabalho:
1. Identifique se o resultado é específico e mensurável
2. Se não for, sugira uma reformulação mais concreta
3. Identifique potenciais armadilhas de escopo (scope creep)
4. Retorne em formato JSON válido:

{
  "is_specific": boolean,
  "is_measurable": boolean,
  "suggested_reformulation": string ou null,
  "potential_scope_issues": array de strings,
  "clarity_score": 1-10
}

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional.`;

  const response = await callLLM({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 500,
  });

  try {
    const result = JSON.parse(response);
    return result as CharterAnalysisResult;
  } catch (error) {
    console.error('Error parsing Charter Analysis response:', error);
    // Fallback: return neutral result
    return {
      is_specific: true,
      is_measurable: true,
      suggested_reformulation: null,
      potential_scope_issues: [],
      clarity_score: 7,
    };
  }
}

// ============================================================================
// AGENT 2: WBS AGENT (Work Breakdown Structure)
// ============================================================================

export async function generateWBS(
  resultadoFinal: string,
  userProfile: UserProfile,
  historico?: string
): Promise<WBSResult> {
  const prompt = `Você é um especialista em decomposição de projetos para pessoas com TDAH.

Resultado final desejado: "${resultadoFinal}"
Perfil do usuário: Granularidade ${userProfile.granularity_level}, Capacidade ${userProfile.cognitive_capacity_minutes} minutos

${historico ? `Histórico do usuário:\n${historico}` : ''}

Com base no perfil do usuário, sugira 3-5 entregas principais que compõem este projeto.

Regras:
- Cada entrega deve ser um substantivo concreto (algo tangível)
- Evite verbos vagos como "planejar" ou "organizar"
- Adapte o nível de granularidade ao perfil do usuário
- Ordene por dependência lógica

Retorne em formato JSON válido:
{
  "deliverables": [
    {
      "name": string,
      "description": string,
      "estimated_effort": 1-5,
      "depends_on": array de índices ou null
    }
  ],
  "rationale": string explicando a lógica
}

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional.`;

  const response = await callLLM({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 1000,
  });

  try {
    const result = JSON.parse(response);
    return result as WBSResult;
  } catch (error) {
    console.error('Error parsing WBS response:', error);
    // Fallback: return simple breakdown
    return {
      deliverables: [
        {
          name: 'Entrega Principal',
          description: 'Resultado final do projeto',
          estimated_effort: 3,
          depends_on: null,
        },
      ],
      rationale: 'Decomposição simplificada devido a erro de parsing.',
    };
  }
}

// ============================================================================
// AGENT 3: TASK GENERATION AGENT
// ============================================================================

export async function generateTasks(
  deliverable: Deliverable,
  userProfile: UserProfile
): Promise<TaskGenerationResult> {
  const granularityRules = {
    macro: 'Tarefas de 2-4 horas cada, máximo 5 tarefas',
    meso: 'Tarefas de 30-90 minutos cada, 5-7 tarefas',
    micro: 'Tarefas de 10-30 minutos cada, 7-10 tarefas',
  };

  const prompt = `Você é um especialista em decomposição de tarefas para pessoas com TDAH.

Entrega alvo: "${deliverable.name}"
Descrição: "${deliverable.description}"
Perfil do usuário: ${userProfile.granularity_level}

Seu trabalho é sugerir 3-7 tarefas que, quando completadas, resultam na entrega acima.

Regras baseadas no perfil:
- ${granularityRules[userProfile.granularity_level]}

Cada tarefa deve:
1. Começar com um verbo de ação específico (não "pensar sobre" ou "planejar")
2. Ser verificável (tem critério claro de completude)
3. Ter um único ponto de início claro

Retorne em formato JSON válido:
{
  "tasks": [
    {
      "title": string (máximo 8 palavras),
      "description": string (1-2 frases),
      "estimated_duration_minutes": number,
      "first_action": string (a primeira ação física para começar),
      "done_when": string (critério de completude)
    }
  ]
}

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional.`;

  const response = await callLLM({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
    max_tokens: 1500,
  });

  try {
    const result = JSON.parse(response);
    return result as TaskGenerationResult;
  } catch (error) {
    console.error('Error parsing Task Generation response:', error);
    // Fallback: return simple task
    return {
      tasks: [
        {
          title: `Completar ${deliverable.name}`,
          description: deliverable.description,
          estimated_duration_minutes: 60,
          first_action: 'Abrir documento ou ferramenta necessária',
          done_when: 'Entrega concluída e revisada',
        },
      ],
    };
  }
}

// ============================================================================
// AGENT 4: CYCLE VALIDATION AGENT (P1 - Not implemented yet)
// ============================================================================

export async function validateCycle(
  tasks: Task[],
  userProfile: UserProfile
): Promise<CycleValidationResult> {
  // TODO: Implement in P1
  // For now, return a simple validation
  const totalLoad = tasks.reduce((sum, task) => sum + task.estimated_duration_minutes, 0);
  const dailyCapacity = userProfile.cognitive_capacity_minutes;
  const threeDayCapacity = dailyCapacity * 3;

  return {
    is_viable: totalLoad <= threeDayCapacity,
    total_cognitive_load: totalLoad,
    load_vs_capacity_ratio: totalLoad / threeDayCapacity,
    context_switches_per_day: [0, 0, 0], // TODO: Calculate
    potential_blockers: [],
    suggested_adjustments: [],
  };
}

// ============================================================================
// AGENT 5: UNBLOCKING AGENT (P1 - Not implemented yet)
// ============================================================================

export async function diagnoseBlocker(
  task: Task,
  userReportedReason: string | null
): Promise<UnblockingResult> {
  // TODO: Implement in P1
  // For now, return generic unblocking advice
  return {
    diagnosis: 'Tarefa pode estar muito vaga ou ampla.',
    root_cause: 'vague_task',
    solutions: [
      {
        type: 'decompose',
        description: 'Quebrar a tarefa em passos menores de 5-10 minutos',
        immediate_action: 'Escrever os 3 primeiros micro-passos em um papel',
      },
      {
        type: 'clarify',
        description: 'Definir critério de "pronto" mais específico',
        immediate_action: 'Completar a frase: "Esta tarefa está pronta quando..."',
      },
      {
        type: 'skip',
        description: 'Pular temporariamente e voltar depois',
        immediate_action: 'Marcar como "bloqueada" e começar próxima tarefa',
      },
    ],
  };
}
