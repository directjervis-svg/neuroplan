/**
 * DAILY TASKS COMPONENT
 * NeuroExecução (KNH4)
 *
 * Card de tarefas diárias (máximo 3)
 * Bullets amarelos + botão "START FOCUS"
 *
 * Baseado em: REF-004 (Referências de Design)
 * Princípio TDAH: Máximo 3 tarefas simultâneas (Barkley)
 */

import React from 'react';
import { DailyTask } from '@/types';
import { Card } from '@/components/shared';

interface DailyTasksProps {
  /** Data atual (para exibir dia da semana) */
  date: Date;
  /** Tarefas do dia (máximo 3) */
  tasks: DailyTask[];
  /** Callback quando iniciar foco */
  onStartFocus?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Classe CSS adicional */
  className?: string;
}

export const DailyTasks: React.FC<DailyTasksProps> = ({
  date,
  tasks,
  onStartFocus,
  loading = false,
  className = '',
}) => {
  // Validação: máximo 3 tarefas
  const displayTasks = tasks.slice(0, 3);

  // Formatar dia da semana em português
  const dayOfWeek = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
  }).format(date);

  const dayCapitalized = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  return (
    <Card padding="lg" className={className}>
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-2">
          Tarefas do dia
        </p>
        <h2 className="text-3xl font-bold text-[#1A1A1A]">{dayCapitalized}</h2>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-4 mb-6">
          {[1, 2, 3].map((i) => (
            <TaskSkeleton key={i} />
          ))}
        </div>
      ) : displayTasks.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4 mb-6">
          {displayTasks.map((dailyTask, index) => (
            <TaskItem key={dailyTask.task.id} dailyTask={dailyTask} position={index + 1} />
          ))}
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={onStartFocus}
        disabled={displayTasks.length === 0 || loading}
        className="
          w-full
          bg-[#FFD400]
          text-[#000000]
          font-semibold
          text-base
          uppercase
          tracking-wide
          py-4
          rounded-[12px]
          border-0
          cursor-pointer
          transition-all
          duration-200
          hover:bg-[#FFBE00]
          hover:shadow-accent
          hover:translate-y-[-2px]
          active:translate-y-0
          disabled:opacity-50
          disabled:cursor-not-allowed
          disabled:hover:bg-[#FFD400]
          disabled:hover:shadow-none
          disabled:hover:translate-y-0
        "
      >
        {loading ? 'Carregando...' : 'Start Focus'}
      </button>
    </Card>
  );
};

/* ============================================
   TASK ITEM
   ============================================ */

interface TaskItemProps {
  dailyTask: DailyTask;
  position: number;
}

const TaskItem: React.FC<TaskItemProps> = ({ dailyTask, position }) => {
  const { task, suggestedTime, context } = dailyTask;

  return (
    <div className="flex items-start gap-3">
      {/* Bullet amarelo */}
      <div className="flex-shrink-0 mt-1">
        <div className="w-2 h-2 rounded-full bg-[#FFC738]" />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium text-[#1A1A1A] leading-relaxed">
          {task.title}
        </p>

        {/* Metadata */}
        <div className="mt-1 flex items-center gap-3 text-xs text-[#6B6B6B]">
          {task.estimatedMinutes && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {task.estimatedMinutes} min
            </span>
          )}

          {task.level && (
            <span className="px-2 py-0.5 bg-[#F5F5F5] rounded text-[10px] font-semibold uppercase">
              Nível {task.level.toUpperCase()}
            </span>
          )}

          {suggestedTime && (
            <span className="text-[10px] text-[#A8A8A8]">
              Sugerido: {suggestedTime}
            </span>
          )}
        </div>

        {/* Context (opcional) */}
        {context && (
          <p className="mt-1 text-xs text-[#A8A8A8] italic line-clamp-1">
            {context}
          </p>
        )}
      </div>
    </div>
  );
};

/* ============================================
   EMPTY STATE
   ============================================ */

const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-8 mb-6">
      <div className="text-4xl mb-3">📋</div>
      <p className="text-[#6B6B6B] text-base mb-1">Nenhuma tarefa para hoje</p>
      <p className="text-[#A8A8A8] text-sm">
        Adicione até 3 tarefas para começar
      </p>
    </div>
  );
};

/* ============================================
   TASK SKELETON (Loading)
   ============================================ */

const TaskSkeleton: React.FC = () => {
  return (
    <div className="flex items-start gap-3 animate-pulse">
      <div className="flex-shrink-0 mt-1">
        <div className="w-2 h-2 rounded-full bg-[#E8E5DD]" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-[#E8E5DD] rounded w-3/4" />
        <div className="h-3 bg-[#E8E5DD] rounded w-1/2" />
      </div>
    </div>
  );
};

DailyTasks.displayName = 'DailyTasks';
