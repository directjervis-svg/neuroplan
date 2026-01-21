/**
 * PROJECT TYPES
 * NeuroExecução (KNH4)
 *
 * Definições para projetos e ciclos
 */

import { Task } from './task';

/**
 * Fases do projeto (Sistema 3-5-X)
 */
export enum ProjectPhase {
  BRIEFING = 'briefing',         // Captura de contexto
  PLANNING = 'planning',         // Planejamento 3-5-X
  EXECUTION = 'execution',       // Execução de ciclos
  REVIEW = 'review',             // Revisão e ajustes
  DELIVERY = 'delivery',         // Entrega final
  ARCHIVED = 'archived',         // Arquivado
}

/**
 * Labels das fases
 */
export const PROJECT_PHASE_LABELS: Record<ProjectPhase, string> = {
  [ProjectPhase.BRIEFING]: 'Briefing',
  [ProjectPhase.PLANNING]: 'Planejamento',
  [ProjectPhase.EXECUTION]: 'Execução',
  [ProjectPhase.REVIEW]: 'Revisão',
  [ProjectPhase.DELIVERY]: 'Entrega',
  [ProjectPhase.ARCHIVED]: 'Arquivado',
};

/**
 * Cores das fases (matriz Crextio)
 */
export const PROJECT_PHASE_COLORS: Record<ProjectPhase, string> = {
  [ProjectPhase.BRIEFING]: '#FFE89A',     // Amarelo claro
  [ProjectPhase.PLANNING]: '#FFC738',     // Amarelo médio
  [ProjectPhase.EXECUTION]: '#FFD400',    // Amarelo CTA
  [ProjectPhase.REVIEW]: '#E5B32D',       // Amarelo escuro
  [ProjectPhase.DELIVERY]: '#7ED957',     // Verde sucesso
  [ProjectPhase.ARCHIVED]: '#6B6B6B',     // Cinza
};

/**
 * Prioridade do projeto
 */
export enum ProjectPriority {
  P0 = 'p0', // Crítico
  P1 = 'p1', // Alto
  P2 = 'p2', // Médio
  P3 = 'p3', // Baixo
}

/**
 * Interface de projeto
 */
export interface Project {
  /** ID único */
  id: string;

  /** Nome do projeto */
  name: string;

  /** Descrição/objetivo */
  description: string;

  /** Fase atual */
  phase: ProjectPhase;

  /** Prioridade */
  priority: ProjectPriority;

  /** Data de início */
  startDate: Date;

  /** Data de deadline */
  deadline: Date;

  /** Progresso geral (0-100) */
  progress: number;

  /** Tarefas do projeto */
  tasks: Task[];

  /** Último checkpoint (descrição) */
  lastCheckpoint: string;

  /** Data do último checkpoint */
  lastCheckpointAt?: Date;

  /** Tags */
  tags: string[];

  /** Cor personalizada (opcional) */
  color?: string;

  /** Arquivado? */
  archived: boolean;

  /** ID do usuário dono */
  userId: string;

  /** Data de criação */
  createdAt: Date;

  /** Data de atualização */
  updatedAt: Date;

  /** Metadata adicional */
  metadata?: Record<string, any>;
}

/**
 * Contexto do projeto (para IA)
 */
export interface ProjectContext {
  /** Nome do projeto */
  name: string;

  /** Fase atual */
  phase: string;

  /** Número de tarefas ativas */
  activeTasks: number;

  /** Último checkpoint */
  lastCheckpoint: string;

  /** Progresso */
  progress: number;

  /** Deadline próximo? */
  deadlineApproaching?: boolean;

  /** Dias restantes */
  daysRemaining?: number;
}

/**
 * Estatísticas do projeto
 */
export interface ProjectStats {
  /** Total de tarefas */
  totalTasks: number;

  /** Tarefas completadas */
  completedTasks: number;

  /** Taxa de conclusão */
  completionRate: number;

  /** Tarefas Nível A (Mínimo) */
  tasksLevelA: number;

  /** Tarefas Nível B (Ideal) */
  tasksLevelB: number;

  /** Tarefas Nível C (Excepcional) */
  tasksLevelC: number;

  /** Tempo total trabalhado (minutos) */
  totalTimeWorked: number;

  /** Tempo estimado restante */
  estimatedTimeRemaining: number;

  /** Velocidade (tarefas/dia) */
  velocity: number;
}

/**
 * Filtros de projetos
 */
export interface ProjectFilters {
  /** Busca textual */
  search?: string;

  /** Filtro por fase */
  phase?: ProjectPhase;

  /** Filtro por prioridade */
  priority?: ProjectPriority;

  /** Apenas arquivados */
  archivedOnly?: boolean;

  /** Ordenação */
  sortBy?: 'name' | 'deadline' | 'progress' | 'createdAt' | 'updatedAt';

  /** Ordem */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Template de projeto
 */
export interface ProjectTemplate {
  /** ID do template */
  id: string;

  /** Nome do template */
  name: string;

  /** Descrição */
  description: string;

  /** Ícone */
  icon: string;

  /** Tarefas padrão */
  defaultTasks: Partial<Task>[];

  /** Duração estimada (dias) */
  estimatedDuration: number;

  /** Tags padrão */
  defaultTags: string[];

  /** Categoria */
  category: 'pessoal' | 'profissional' | 'acadêmico' | 'criativo';
}

/**
 * Ação de log de atividade
 */
export interface ActivityLog {
  /** ID único */
  id: string;

  /** ID do projeto */
  projectId: string;

  /** Ação realizada */
  action: string;

  /** Contexto da ação */
  context: string;

  /** Timestamp */
  timestamp: Date;

  /** ID do usuário */
  userId: string;

  /** Metadata adicional */
  metadata?: Record<string, any>;
}

/**
 * Templates padrão de projeto
 */
export const DEFAULT_PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'template-personal-goal',
    name: 'Meta Pessoal',
    description: 'Para objetivos pessoais de curto prazo',
    icon: '🎯',
    estimatedDuration: 7,
    defaultTags: ['pessoal'],
    category: 'pessoal',
    defaultTasks: [
      {
        title: 'Definir objetivo claro e mensurável',
        effortType: 'action' as any,
        estimatedMinutes: 30,
      },
      {
        title: 'Listar recursos necessários',
        effortType: 'retention' as any,
        estimatedMinutes: 20,
      },
      {
        title: 'Executar primeira ação',
        effortType: 'action' as any,
        estimatedMinutes: 60,
      },
    ],
  },
  {
    id: 'template-work-project',
    name: 'Projeto Profissional',
    description: 'Para demandas do trabalho',
    icon: '💼',
    estimatedDuration: 14,
    defaultTags: ['trabalho', 'profissional'],
    category: 'profissional',
    defaultTasks: [
      {
        title: 'Briefing com stakeholders',
        effortType: 'action' as any,
        estimatedMinutes: 60,
      },
      {
        title: 'Planejamento de entregas',
        effortType: 'action' as any,
        estimatedMinutes: 90,
      },
      {
        title: 'Executar MVP',
        effortType: 'action' as any,
        estimatedMinutes: 240,
      },
    ],
  },
  {
    id: 'template-study',
    name: 'Estudo/Curso',
    description: 'Para aprendizado estruturado',
    icon: '📚',
    estimatedDuration: 30,
    defaultTags: ['estudo', 'aprendizado'],
    category: 'acadêmico',
    defaultTasks: [
      {
        title: 'Fazer resumo do capítulo 1',
        effortType: 'retention' as any,
        estimatedMinutes: 45,
      },
      {
        title: 'Resolver exercícios',
        effortType: 'action' as any,
        estimatedMinutes: 60,
      },
      {
        title: 'Revisar anotações',
        effortType: 'maintenance' as any,
        estimatedMinutes: 30,
      },
    ],
  },
  {
    id: 'template-creative',
    name: 'Projeto Criativo',
    description: 'Para projetos artísticos e criativos',
    icon: '🎨',
    estimatedDuration: 21,
    defaultTags: ['criativo', 'arte'],
    category: 'criativo',
    defaultTasks: [
      {
        title: 'Brainstorming de ideias',
        effortType: 'action' as any,
        estimatedMinutes: 60,
      },
      {
        title: 'Criar primeiro protótipo',
        effortType: 'action' as any,
        estimatedMinutes: 120,
      },
      {
        title: 'Refinar e iterar',
        effortType: 'retention' as any,
        estimatedMinutes: 90,
      },
    ],
  },
];
