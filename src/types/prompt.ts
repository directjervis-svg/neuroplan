/**
 * PROMPT TYPES
 * NeuroExecução (KNH4)
 *
 * Definições para sistema de prompts estruturados
 */

/**
 * Categorias de prompts disponíveis
 */
export enum PromptCategory {
  VALIDATION = 'validation',
  PRODUCT = 'product',
  STRATEGY = 'strategy',
  WORKFLOW = 'workflow',
  CONTEXT = 'context',
}

/**
 * Labels legíveis das categorias
 */
export const PROMPT_CATEGORY_LABELS: Record<PromptCategory, string> = {
  [PromptCategory.VALIDATION]: 'Validação',
  [PromptCategory.PRODUCT]: 'Produto',
  [PromptCategory.STRATEGY]: 'Estratégia',
  [PromptCategory.WORKFLOW]: 'Fluxo de Trabalho',
  [PromptCategory.CONTEXT]: 'Contexto',
};

/**
 * Cores das categorias (matriz Crextio)
 */
export const PROMPT_CATEGORY_COLORS: Record<PromptCategory, string> = {
  [PromptCategory.VALIDATION]: '#7ED957', // Verde
  [PromptCategory.PRODUCT]: '#FFC738', // Amarelo
  [PromptCategory.STRATEGY]: '#5B9BFF', // Azul
  [PromptCategory.WORKFLOW]: '#9B7EDE', // Roxo
  [PromptCategory.CONTEXT]: '#FF6B6B', // Vermelho
};

/**
 * Interface de um prompt estruturado
 */
export interface Prompt {
  /** ID único (ex: "VAL-001", "PRO-002") */
  id: string;

  /** Nome do prompt */
  name: string;

  /** Descrição curta */
  description: string;

  /** Categoria do prompt */
  category: PromptCategory;

  /** Tags para busca */
  tags: string[];

  /** Conteúdo markdown completo */
  content: string;

  /** Variáveis esperadas (ex: ["featureName", "targetAudience"]) */
  variables: string[];

  /** Métrica de uso (contador de ativações) */
  usageCount: number;

  /** Estado de favorito (por usuário) */
  favorited: boolean;

  /** Autor do prompt */
  author?: string;

  /** Data de criação */
  createdAt: Date;

  /** Data de última atualização */
  updatedAt: Date;

  /** Tempo médio de execução (segundos) */
  avgExecutionTime?: number;

  /** Rating médio (0-5) */
  avgRating?: number;
}

/**
 * Filtros para busca de prompts
 */
export interface PromptFilters {
  /** Busca textual (nome, descrição, tags) */
  search?: string;

  /** Filtro por categoria */
  category?: PromptCategory;

  /** Apenas favoritos */
  favoritedOnly?: boolean;

  /** Ordenação */
  sortBy?: 'name' | 'usageCount' | 'avgRating' | 'createdAt' | 'updatedAt';

  /** Ordem */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Estado da execução de prompt
 */
export interface PromptExecutionState {
  /** Prompt sendo executado */
  prompt: Prompt | null;

  /** Variáveis preenchidas */
  variables: Record<string, string>;

  /** Status da execução */
  status: 'idle' | 'loading' | 'success' | 'error';

  /** Resultado da execução */
  result?: string;

  /** Erro, se houver */
  error?: string;

  /** Tempo de execução (ms) */
  executionTime?: number;
}

/**
 * Resultado de execução de prompt
 */
export interface PromptExecutionResult {
  /** Sucesso */
  success: boolean;

  /** Resultado */
  data?: string;

  /** Erro */
  error?: string;

  /** Uso de tokens */
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
  };

  /** Latência (ms) */
  latency?: number;

  /** Se veio do cache */
  cached?: boolean;
}

/**
 * Template de prompt com variáveis
 */
export interface PromptTemplate {
  /** Template string com {{variáveis}} */
  template: string;

  /** Variáveis obrigatórias */
  requiredVariables: string[];

  /** Variáveis opcionais */
  optionalVariables?: string[];

  /** Valores padrão para opcionais */
  defaultValues?: Record<string, string>;
}

/**
 * Histórico de execução
 */
export interface PromptExecutionHistory {
  /** ID único da execução */
  id: string;

  /** ID do prompt */
  promptId: string;

  /** Variáveis usadas */
  variables: Record<string, string>;

  /** Resultado */
  result: string;

  /** Timestamp */
  executedAt: Date;

  /** Rating dado pelo usuário */
  rating?: number;

  /** Comentário do usuário */
  comment?: string;
}

/**
 * Estatísticas de uso de prompt
 */
export interface PromptStats {
  /** Total de execuções */
  totalExecutions: number;

  /** Execuções nos últimos 7 dias */
  executionsLast7Days: number;

  /** Tempo médio de execução */
  avgExecutionTime: number;

  /** Rating médio */
  avgRating: number;

  /** Taxa de sucesso */
  successRate: number;

  /** Usuários únicos */
  uniqueUsers: number;
}

/**
 * Biblioteca de prompts padrão (preview)
 */
export const SAMPLE_PROMPTS: Partial<Prompt>[] = [
  {
    id: 'VAL-001',
    name: 'Coeficiente de Validação',
    description: 'Valida features usando 7 variáveis ponderadas',
    category: PromptCategory.VALIDATION,
    tags: ['feature', 'mvp', 'decisão', 'priorização'],
    variables: ['featureName', 'featureDescription', 'targetAudience'],
    usageCount: 0,
    favorited: false,
  },
  {
    id: 'PRO-001',
    name: 'Divisão de Tarefas A-B-C',
    description: 'Divide projeto em tarefas Mínimo, Ideal e Excepcional',
    category: PromptCategory.PRODUCT,
    tags: ['tarefas', 'abc', 'planejamento'],
    variables: ['projectName', 'projectGoal', 'deadline'],
    usageCount: 0,
    favorited: false,
  },
  {
    id: 'EST-001',
    name: 'Análise SWOT Neuroadaptativa',
    description: 'SWOT focado em contextos TDAH',
    category: PromptCategory.STRATEGY,
    tags: ['swot', 'análise', 'estratégia'],
    variables: ['businessContext', 'currentChallenges'],
    usageCount: 0,
    favorited: false,
  },
  {
    id: 'WRK-001',
    name: 'Ciclo 3-5-X Completo',
    description: 'Gera estrutura completa de um ciclo semanal',
    category: PromptCategory.WORKFLOW,
    tags: ['ciclo', '3-5-x', 'semanal'],
    variables: ['weekGoal', 'availableHours'],
    usageCount: 0,
    favorited: false,
  },
  {
    id: 'CTX-001',
    name: 'Briefing de Contexto',
    description: 'Captura contexto completo de um projeto',
    category: PromptCategory.CONTEXT,
    tags: ['briefing', 'contexto', 'início'],
    variables: ['projectName', 'stakeholders', 'constraints'],
    usageCount: 0,
    favorited: false,
  },
];
