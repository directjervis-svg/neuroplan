/**
 * Validation Utility - Sistema de Validação com Coeficiente CV
 *
 * Implementa validações específicas para TDAH/neuroexecução:
 * - Coeficiente de Variação (CV) para análise de consistência
 * - Validação de objetivos SMART
 * - Validação de carga cognitiva
 * - Validação de ciclos de 3 dias
 */

// ========================
// Tipos de Validação
// ========================

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface CVAnalysis {
  mean: number;
  standardDeviation: number;
  cv: number; // Coeficiente de Variação (%)
  consistency: 'alta' | 'média' | 'baixa' | 'muito_baixa';
  interpretation: string;
}

export interface SMARTValidation {
  specific: { valid: boolean; feedback: string };
  measurable: { valid: boolean; feedback: string };
  achievable: { valid: boolean; feedback: string };
  relevant: { valid: boolean; feedback: string };
  timeBound: { valid: boolean; feedback: string };
  overallScore: number;
}

export interface CognitiveLoadValidation {
  totalMinutes: number;
  recommendedMinutes: number;
  loadRatio: number;
  isOverloaded: boolean;
  contextSwitches: number;
  feedback: string;
}

// ========================
// Funções Estatísticas
// ========================

/**
 * Calcula a média de um array de números
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calcula o desvio padrão
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = calculateMean(values);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const avgSquaredDiff = calculateMean(squaredDiffs);
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Calcula o Coeficiente de Variação (CV)
 * CV = (Desvio Padrão / Média) × 100
 *
 * Interpretação para TDAH:
 * - CV < 15%: Alta consistência (excelente)
 * - CV 15-30%: Consistência média (bom)
 * - CV 30-50%: Baixa consistência (atenção)
 * - CV > 50%: Muito baixa (intervenção necessária)
 */
export function calculateCV(values: number[]): CVAnalysis {
  const mean = calculateMean(values);
  const stdDev = calculateStandardDeviation(values);

  // Evita divisão por zero
  const cv = mean > 0 ? (stdDev / mean) * 100 : 0;

  let consistency: CVAnalysis['consistency'];
  let interpretation: string;

  if (cv < 15) {
    consistency = 'alta';
    interpretation = 'Excelente consistência! Seu padrão de execução é muito estável.';
  } else if (cv < 30) {
    consistency = 'média';
    interpretation = 'Boa consistência. Algumas variações são normais.';
  } else if (cv < 50) {
    consistency = 'baixa';
    interpretation = 'Consistência irregular. Considere identificar padrões de distração.';
  } else {
    consistency = 'muito_baixa';
    interpretation = 'Alta variabilidade detectada. Recomendamos revisar sua rotina de foco.';
  }

  return {
    mean,
    standardDeviation: stdDev,
    cv: Math.round(cv * 100) / 100,
    consistency,
    interpretation,
  };
}

// ========================
// Validação SMART
// ========================

/**
 * Valida se um objetivo segue os critérios SMART
 */
export function validateSMART(objective: string): SMARTValidation {
  const lowerObjective = objective.toLowerCase();
  const wordCount = objective.split(/\s+/).length;

  // Specific (Específico)
  const hasSpecificVerbs = /criar|desenvolver|implementar|construir|lançar|entregar|completar|finalizar/i.test(objective);
  const hasConcreteNouns = wordCount >= 3 && !/algo|coisa|isso|aquilo/i.test(objective);
  const specific = {
    valid: hasSpecificVerbs && hasConcreteNouns,
    feedback: hasSpecificVerbs && hasConcreteNouns
      ? 'Objetivo bem específico!'
      : 'Tente usar verbos de ação e ser mais específico sobre o resultado.',
  };

  // Measurable (Mensurável)
  const hasNumbers = /\d+/.test(objective);
  const hasMeasurableTerms = /página|tarefa|item|módulo|funcionalidade|tela|componente|%|porcento/i.test(objective);
  const measurable = {
    valid: hasNumbers || hasMeasurableTerms,
    feedback: hasNumbers || hasMeasurableTerms
      ? 'Critérios de medição identificados.'
      : 'Adicione métricas ou quantidades para medir o progresso.',
  };

  // Achievable (Alcançável)
  const hasReasonableScope = wordCount >= 5 && wordCount <= 50;
  const noExtremeWords = !/todos|todas|tudo|nunca|sempre|perfeito|impossível/i.test(objective);
  const achievable = {
    valid: hasReasonableScope && noExtremeWords,
    feedback: hasReasonableScope && noExtremeWords
      ? 'Escopo parece realista.'
      : 'Evite termos absolutos e considere reduzir o escopo se muito amplo.',
  };

  // Relevant (Relevante)
  const hasContext = wordCount >= 5;
  const relevant = {
    valid: hasContext,
    feedback: hasContext
      ? 'Contexto adequado presente.'
      : 'Adicione mais contexto sobre por que isso é importante.',
  };

  // Time-bound (Temporal)
  const hasTimeReference = /dia|dias|semana|mês|hora|horas|até|prazo|deadline|ciclo|sprint/i.test(objective);
  const timeBound = {
    valid: hasTimeReference,
    feedback: hasTimeReference
      ? 'Referência temporal identificada.'
      : 'Inclua um prazo ou período específico.',
  };

  // Score geral (0-100)
  const validCount = [specific, measurable, achievable, relevant, timeBound]
    .filter(v => v.valid).length;
  const overallScore = (validCount / 5) * 100;

  return {
    specific,
    measurable,
    achievable,
    relevant,
    timeBound,
    overallScore,
  };
}

// ========================
// Validação de Carga Cognitiva
// ========================

interface Task {
  estimatedMinutes: number;
  category?: string;
  priority?: 'A' | 'B' | 'C';
}

/**
 * Valida a carga cognitiva de um conjunto de tarefas
 * Baseado na capacidade cognitiva de pessoas com TDAH
 */
export function validateCognitiveLoad(
  tasks: Task[],
  cognitiveCapacityMinutes: number = 90
): CognitiveLoadValidation {
  const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const loadRatio = totalMinutes / cognitiveCapacityMinutes;

  // Conta trocas de contexto (mudanças de categoria)
  let contextSwitches = 0;
  let lastCategory: string | undefined;
  tasks.forEach(task => {
    if (task.category && task.category !== lastCategory) {
      contextSwitches++;
      lastCategory = task.category;
    }
  });

  const isOverloaded = loadRatio > 1.2 || contextSwitches > 5;

  let feedback: string;
  if (loadRatio <= 0.7) {
    feedback = 'Carga leve - você pode adicionar mais tarefas se desejar.';
  } else if (loadRatio <= 1.0) {
    feedback = 'Carga ideal para foco sustentado.';
  } else if (loadRatio <= 1.2) {
    feedback = 'Carga moderadamente alta - priorize as tarefas A.';
  } else {
    feedback = 'Carga excessiva! Reduza tarefas para evitar sobrecarga cognitiva.';
  }

  if (contextSwitches > 5) {
    feedback += ' Muitas trocas de contexto detectadas - agrupe tarefas similares.';
  }

  return {
    totalMinutes,
    recommendedMinutes: cognitiveCapacityMinutes,
    loadRatio: Math.round(loadRatio * 100) / 100,
    isOverloaded,
    contextSwitches,
    feedback,
  };
}

// ========================
// Validação de Ciclo de 3 Dias
// ========================

interface CycleDay {
  tasks: Task[];
  date?: string;
}

interface CycleValidation extends ValidationResult {
  dayAnalysis: {
    day: number;
    load: CognitiveLoadValidation;
    hasATask: boolean;
  }[];
  balanceScore: number;
  cvScore: CVAnalysis;
}

/**
 * Valida um ciclo completo de 3 dias
 */
export function validateCycle(
  days: CycleDay[],
  cognitiveCapacity: number = 90
): CycleValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Valida cada dia
  const dayAnalysis = days.map((day, index) => {
    const load = validateCognitiveLoad(day.tasks, cognitiveCapacity);
    const hasATask = day.tasks.some(t => t.priority === 'A');

    if (!hasATask) {
      warnings.push(`Dia ${index + 1} não tem tarefas de prioridade A (mínimo viável).`);
    }

    if (load.isOverloaded) {
      errors.push(`Dia ${index + 1} está com carga cognitiva excessiva.`);
    }

    return { day: index + 1, load, hasATask };
  });

  // Calcula CV da carga entre dias (para verificar balanceamento)
  const dailyLoads = dayAnalysis.map(d => d.load.totalMinutes);
  const cvScore = calculateCV(dailyLoads);

  // Score de balanceamento (inverso do CV)
  const balanceScore = Math.max(0, 100 - cvScore.cv);

  if (cvScore.cv > 30) {
    warnings.push('Distribuição de carga entre dias está desbalanceada.');
    suggestions.push('Redistribua tarefas para equilibrar a carga cognitiva.');
  }

  // Verifica se tem pelo menos uma tarefa A por dia
  const allDaysHaveA = dayAnalysis.every(d => d.hasATask);
  if (!allDaysHaveA) {
    suggestions.push('Garanta que cada dia tenha pelo menos uma tarefa de prioridade A.');
  }

  // Score final
  let score = 100;
  score -= errors.length * 15;
  score -= warnings.length * 5;
  score -= Math.max(0, cvScore.cv - 20); // Penaliza desbalanceamento

  return {
    isValid: errors.length === 0,
    score: Math.max(0, Math.min(100, score)),
    errors,
    warnings,
    suggestions,
    dayAnalysis,
    balanceScore,
    cvScore,
  };
}

// ========================
// Validações de Input
// ========================

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida string não vazia
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Valida comprimento de string
 */
export function isValidLength(value: string, min: number, max: number): boolean {
  const len = value.trim().length;
  return len >= min && len <= max;
}

/**
 * Valida número em range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Valida tempo estimado de tarefa (entre 5 e 90 minutos)
 */
export function isValidTaskDuration(minutes: number): boolean {
  return isInRange(minutes, 5, 90);
}

/**
 * Sanitiza input de texto (remove caracteres perigosos)
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"]/g, '') // Remove caracteres perigosos
    .trim();
}

// ========================
// Helpers de Validação Compostos
// ========================

/**
 * Valida formulário de tarefa
 */
export function validateTaskForm(data: {
  title: string;
  description?: string;
  estimatedMinutes?: number;
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (!isNotEmpty(data.title)) {
    errors.push('Título é obrigatório.');
  } else if (!isValidLength(data.title, 3, 100)) {
    errors.push('Título deve ter entre 3 e 100 caracteres.');
  }

  if (data.description && !isValidLength(data.description, 0, 500)) {
    warnings.push('Descrição muito longa (máximo 500 caracteres).');
  }

  if (data.estimatedMinutes !== undefined) {
    if (!isValidTaskDuration(data.estimatedMinutes)) {
      errors.push('Tempo estimado deve ser entre 5 e 90 minutos.');
    }
    if (data.estimatedMinutes > 45) {
      suggestions.push('Considere dividir tarefas maiores que 45 minutos.');
    }
  }

  return {
    isValid: errors.length === 0,
    score: Math.max(0, 100 - errors.length * 25 - warnings.length * 10),
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Valida formulário de projeto
 */
export function validateProjectForm(data: {
  title: string;
  briefing?: string;
  cycleDays?: number;
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (!isNotEmpty(data.title)) {
    errors.push('Título do projeto é obrigatório.');
  } else if (!isValidLength(data.title, 3, 150)) {
    errors.push('Título deve ter entre 3 e 150 caracteres.');
  }

  if (data.briefing) {
    const smartValidation = validateSMART(data.briefing);
    if (smartValidation.overallScore < 60) {
      warnings.push('Briefing pode ser mais específico (critérios SMART).');
      suggestions.push(...[
        smartValidation.specific.feedback,
        smartValidation.measurable.feedback,
        smartValidation.timeBound.feedback,
      ].filter(f => f.includes('Adicione') || f.includes('Inclua') || f.includes('Tente')));
    }
  } else {
    suggestions.push('Adicione um briefing para melhor planejamento.');
  }

  if (data.cycleDays && !isInRange(data.cycleDays, 1, 7)) {
    errors.push('Ciclo deve ter entre 1 e 7 dias.');
  }

  return {
    isValid: errors.length === 0,
    score: Math.max(0, 100 - errors.length * 25 - warnings.length * 10),
    errors,
    warnings,
    suggestions,
  };
}

export default {
  calculateCV,
  calculateMean,
  calculateStandardDeviation,
  validateSMART,
  validateCognitiveLoad,
  validateCycle,
  validateTaskForm,
  validateProjectForm,
  isValidEmail,
  isNotEmpty,
  isValidLength,
  isInRange,
  isValidTaskDuration,
  sanitizeText,
};
