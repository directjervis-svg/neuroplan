/**
 * TASK TYPES
 * NeuroExecução (KNH4)
 *
 * Definições para tarefas (Sistema A-B-C)
 */

/**
 * Tipo de esforço cognitivo (Brown Cluster 3)
 */
export enum TaskEffortType {
  ACTION = 'action',             // Criar algo novo, exige foco alto
  RETENTION = 'retention',       // Manter algo existente, foco médio
  MAINTENANCE = 'maintenance',   // Rotina, baixo esforço
}

/**
 * Labels dos tipos de esforço
 */
export const TASK_EFFORT_LABELS: Record<TaskEffortType, string> = {
  [TaskEffortType.ACTION]: 'Ação',
  [TaskEffortType.RETENTION]: 'Retenção',
  [TaskEffortType.MAINTENANCE]: 'Manutenção',
};

/**
 * Cores dos tipos de esforço (matriz Crextio)
 */
export const TASK_EFFORT_COLORS: Record<TaskEffortType, string> = {
  [TaskEffortType.ACTION]: '#FFD400',      // Amarelo CTA
  [TaskEffortType.RETENTION]: '#FFC738',   // Amarelo médio
  [TaskEffortType.MAINTENANCE]: '#A8A8A8', // Cinza
};

/**
 * Nível de tarefa (Sistema A-B-C)
 */
export enum TaskLevel {
  A = 'a', // Mínimo (essencial)
  B = 'b', // Ideal (desejável)
  C = 'c', // Excepcional (bônus)
}

/**
 * Labels dos níveis
 */
export const TASK_LEVEL_LABELS: Record<TaskLevel, string> = {
  [TaskLevel.A]: 'Mínimo',
  [TaskLevel.B]: 'Ideal',
  [TaskLevel.C]: 'Excepcional',
};

/**
 * Cores dos níveis (matriz Crextio)
 */
export const TASK_LEVEL_COLORS: Record<TaskLevel, string> = {
  [TaskLevel.A]: '#7ED957',   // Verde (sucesso)
  [TaskLevel.B]: '#FFC738',   // Amarelo (atenção)
  [TaskLevel.C]: '#1A1A1A',   // Preto (opcional)
};

/**
 * Backgrounds dos níveis
 */
export const TASK_LEVEL_BACKGROUNDS: Record<TaskLevel, string> = {
  [TaskLevel.A]: '#E8F5E0',   // Verde claro
  [TaskLevel.B]: '#FFF9E6',   // Amarelo pastel
  [TaskLevel.C]: '#F5F5F5',   // Cinza claro
};

/**
 * Status da tarefa
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  DONE = 'done',
}

/**
 * Labels dos status
 */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'A Fazer',
  [TaskStatus.IN_PROGRESS]: 'Fazendo',
  [TaskStatus.ON_HOLD]: 'Pausado',
  [TaskStatus.DONE]: 'Concluído',
};

/**
 * Nível de energia requerida
 */
export type EnergyLevel = 'high' | 'medium' | 'low';

/**
 * Interface de tarefa
 */
export interface Task {
  /** ID único */
  id: string;

  /** ID do projeto pai */
  projectId: string;

  /** Título da tarefa */
  title: string;

  /** Descrição detalhada */
  description?: string;

  /** Tipo de esforço cognitivo */
  effortType: TaskEffortType;

  /** Nível A-B-C */
  level: TaskLevel;

  /** Status atual */
  status: TaskStatus;

  /** Tempo estimado (minutos) */
  estimatedMinutes: number;

  /** Tempo real trabalhado (minutos) */
  actualMinutes?: number;

  /** Nível de energia requerida */
  energyLevel: EnergyLevel;

  /** Dependências (IDs de outras tarefas) */
  dependencies: string[];

  /** Tags */
  tags: string[];

  /** Data de deadline */
  deadline?: Date;

  /** Data de conclusão */
  completedAt?: Date;

  /** Ordem na lista */
  order: number;

  /** Notas adicionais */
  notes?: string;

  /** ID do usuário */
  userId: string;

  /** Data de criação */
  createdAt: Date;

  /** Data de atualização */
  updatedAt: Date;
}

/**
 * Tarefa do dia (máximo 3)
 */
export interface DailyTask {
  /** Tarefa base */
  task: Task;

  /** Posição no dia (1, 2 ou 3) */
  position: 1 | 2 | 3;

  /** Data agendada */
  scheduledFor: Date;

  /** Horário sugerido */
  suggestedTime?: string;

  /** Contexto adicional */
  context?: string;
}

/**
 * Sessão de trabalho (Timer Progressivo)
 */
export interface WorkSession {
  /** ID único */
  id: string;

  /** ID da tarefa */
  taskId: string;

  /** Início da sessão */
  startedAt: Date;

  /** Fim da sessão */
  endedAt?: Date;

  /** Duração (segundos) */
  duration: number;

  /** Pausas durante a sessão */
  pauses: {
    startedAt: Date;
    endedAt: Date;
    duration: number;
  }[];

  /** Notas da sessão */
  notes?: string;

  /** ID do usuário */
  userId: string;
}

/**
 * Sugestão de tarefa (IA)
 */
export interface TaskSuggestion {
  /** Tarefa sugerida */
  task: Partial<Task>;

  /** Razão da sugestão */
  reasoning: string;

  /** Score de relevância (0-1) */
  relevanceScore: number;

  /** Hora sugerida do dia */
  suggestedTime: 'morning' | 'afternoon' | 'evening';

  /** Baseado em padrões do usuário? */
  basedOnPatterns: boolean;
}

/**
 * Filtros de tarefas
 */
export interface TaskFilters {
  /** Busca textual */
  search?: string;

  /** Filtro por status */
  status?: TaskStatus;

  /** Filtro por nível */
  level?: TaskLevel;

  /** Filtro por tipo de esforço */
  effortType?: TaskEffortType;

  /** Filtro por energia */
  energyLevel?: EnergyLevel;

  /** Apenas com deadline próximo */
  upcomingDeadline?: boolean;

  /** Ordenação */
  sortBy?: 'order' | 'deadline' | 'estimatedMinutes' | 'createdAt';

  /** Ordem */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Estatísticas de tarefas
 */
export interface TaskStats {
  /** Total de tarefas */
  total: number;

  /** Completadas */
  completed: number;

  /** Em progresso */
  inProgress: number;

  /** Taxa de conclusão */
  completionRate: number;

  /** Tempo total estimado */
  totalEstimatedMinutes: number;

  /** Tempo total real */
  totalActualMinutes: number;

  /** Precisão de estimativa */
  estimationAccuracy: number;

  /** Distribuição por nível */
  byLevel: {
    a: number;
    b: number;
    c: number;
  };

  /** Distribuição por esforço */
  byEffort: {
    action: number;
    retention: number;
    maintenance: number;
  };
}

/**
 * Checklist item (dentro de uma tarefa)
 */
export interface ChecklistItem {
  /** ID único */
  id: string;

  /** Texto do item */
  text: string;

  /** Completado? */
  checked: boolean;

  /** Ordem */
  order: number;
}

/**
 * Tarefa com checklist
 */
export interface TaskWithChecklist extends Task {
  /** Checklist items */
  checklist: ChecklistItem[];
}
