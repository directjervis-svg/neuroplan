/**
 * WEEKLY OVERVIEW COMPONENT
 * NeuroExecução (KNH4)
 *
 * Vista semanal estilo iPhone (fundo preto)
 * Checkboxes amarelos quando ativos
 *
 * Baseado em: REF-004 (Referências de Design)
 */

import React, { useState } from 'react';
import { Task, TaskStatus } from '@/types';

interface WeeklyOverviewProps {
  /** Semana atual (domingo = início) */
  currentWeek: Date;
  /** Tarefas organizadas por dia */
  tasksByDay: Record<string, Task[]>;
  /** Callback quando marcar tarefa */
  onToggleTask?: (taskId: string, completed: boolean) => void;
  /** Classe CSS adicional */
  className?: string;
}

export const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({
  currentWeek,
  tasksByDay,
  onToggleTask,
  className = '',
}) => {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay()); // 0 = Domingo

  // Gerar dias da semana a partir da currentWeek
  const weekDays = getWeekDays(currentWeek);

  // Tarefas do dia selecionado
  const selectedDayKey = formatDateKey(weekDays[selectedDay]);
  const tasksForSelectedDay = tasksByDay[selectedDayKey] || [];

  return (
    <div
      className={`
        bg-[#000000]
        rounded-[32px]
        p-8
        text-white
        min-h-[600px]
        ${className}
      `}
    >
      {/* Header - Dia Ativo */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-1">
          {getDayName(selectedDay)}
        </h2>
        <p className="text-sm text-white/60">
          {formatDate(weekDays[selectedDay])}
        </p>
      </div>

      {/* Tasks Checklist */}
      <div className="mb-10 space-y-3">
        {tasksForSelectedDay.length === 0 ? (
          <p className="text-white/40 text-sm italic">Nenhuma tarefa para este dia</p>
        ) : (
          tasksForSelectedDay.map((task) => (
            <TaskCheckbox
              key={task.id}
              task={task}
              onToggle={(completed) => onToggleTask?.(task.id, completed)}
            />
          ))
        )}
      </div>

      {/* Days Stack */}
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-wider text-white/40 font-semibold mb-4">
          Todos os dias
        </p>
        {weekDays.map((day, index) => (
          <DayItem
            key={index}
            dayIndex={index}
            date={day}
            active={selectedDay === index}
            taskCount={tasksByDay[formatDateKey(day)]?.length || 0}
            onClick={() => setSelectedDay(index)}
          />
        ))}
      </div>
    </div>
  );
};

/* ============================================
   TASK CHECKBOX
   ============================================ */

interface TaskCheckboxProps {
  task: Task;
  onToggle: (completed: boolean) => void;
}

const TaskCheckbox: React.FC<TaskCheckboxProps> = ({ task, onToggle }) => {
  const completed = task.status === TaskStatus.DONE;

  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      {/* Custom Checkbox */}
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={completed}
          onChange={(e) => onToggle(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`
            w-5 h-5
            rounded
            border-2
            transition-all
            ${
              completed
                ? 'bg-[#FFC738] border-[#FFC738]'
                : 'border-white/30 bg-transparent group-hover:border-white/50'
            }
          `}
        >
          {completed && (
            <svg
              className="w-full h-full text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Task Text */}
      <span
        className={`
          flex-1
          text-base
          leading-relaxed
          transition-all
          ${
            completed
              ? 'line-through opacity-50'
              : 'opacity-100'
          }
        `}
      >
        {task.title}
      </span>

      {/* Time estimate */}
      {task.estimatedMinutes && (
        <span className="text-xs text-white/40">
          {task.estimatedMinutes}min
        </span>
      )}
    </label>
  );
};

/* ============================================
   DAY ITEM
   ============================================ */

interface DayItemProps {
  dayIndex: number;
  date: Date;
  active: boolean;
  taskCount: number;
  onClick: () => void;
}

const DayItem: React.FC<DayItemProps> = ({
  dayIndex,
  date,
  active,
  taskCount,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full
        text-left
        py-4
        border-b
        border-white/10
        transition-all
        ${
          active
            ? 'text-white'
            : 'text-white/40 hover:text-white/60'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">
          {getDayName(dayIndex)}
        </span>
        {taskCount > 0 && (
          <span className="text-xs text-white/40">
            {taskCount} {taskCount === 1 ? 'tarefa' : 'tarefas'}
          </span>
        )}
      </div>
    </button>
  );
};

/* ============================================
   HELPER FUNCTIONS
   ============================================ */

/**
 * Retorna array com os 7 dias da semana a partir de uma data
 */
function getWeekDays(startDate: Date): Date[] {
  const days: Date[] = [];
  const start = new Date(startDate);

  // Ajustar para domingo (início da semana)
  const dayOfWeek = start.getDay();
  start.setDate(start.getDate() - dayOfWeek);

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }

  return days;
}

/**
 * Retorna nome do dia da semana em português
 */
function getDayName(dayIndex: number): string {
  const days = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];
  return days[dayIndex];
}

/**
 * Formata data como "14 Abril, 8:40am"
 */
function formatDate(date: Date): string {
  const day = date.getDate();
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
  const time = new Intl.DateTimeFormat('pt-BR', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  return `${day} ${month}, ${time}`;
}

/**
 * Formata data como chave para tasksByDay (YYYY-MM-DD)
 */
function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

WeeklyOverview.displayName = 'WeeklyOverview';
