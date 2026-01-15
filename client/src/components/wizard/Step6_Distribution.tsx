/**
 * Etapa 6: Distribuição de Tarefas em 3 Dias
 * Usuário distribui tarefas manualmente ou aceita sugestão da IA
 */

import React, { useState } from 'react';
import type { Task, DayDistribution } from '../../hooks/wizard/useProjectWizard';

interface Step6Props {
  tasks: Task[];
  distribution: DayDistribution;
  onUpdate: (distribution: DayDistribution) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step6_Distribution({
  tasks,
  distribution,
  onUpdate,
  onNext,
  onBack,
}: Step6Props) {
  const [localDistribution, setLocalDistribution] = useState<DayDistribution>(
    distribution.day1.length === 0 ? autoDistribute(tasks) : distribution
  );
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  function autoDistribute(taskList: Task[]): DayDistribution {
    // Algoritmo simples: distribuir por prioridade e tempo
    const sorted = [...taskList].sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority.localeCompare(b.priority);
      }
      return a.estimatedMinutes - b.estimatedMinutes;
    });

    const day1: string[] = [];
    const day2: string[] = [];
    const day3: string[] = [];
    let time1 = 0,
      time2 = 0,
      time3 = 0;

    sorted.forEach(task => {
      if (time1 <= time2 && time1 <= time3) {
        day1.push(task.id);
        time1 += task.estimatedMinutes;
      } else if (time2 <= time3) {
        day2.push(task.id);
        time2 += task.estimatedMinutes;
      } else {
        day3.push(task.id);
        time3 += task.estimatedMinutes;
      }
    });

    return { day1, day2, day3 };
  }

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDrop = (day: 'day1' | 'day2' | 'day3') => {
    if (!draggedTaskId) return;

    // Remove from all days
    const newDist = {
      day1: localDistribution.day1.filter(id => id !== draggedTaskId),
      day2: localDistribution.day2.filter(id => id !== draggedTaskId),
      day3: localDistribution.day3.filter(id => id !== draggedTaskId),
    };

    // Add to target day
    newDist[day].push(draggedTaskId);

    setLocalDistribution(newDist);
    setDraggedTaskId(null);
  };

  const handleNext = () => {
    onUpdate(localDistribution);
    onNext();
  };

  const getTaskById = (id: string) => tasks.find(t => t.id === id)!;

  const getTotalTime = (day: 'day1' | 'day2' | 'day3') => {
    return localDistribution[day].reduce((sum, id) => {
      const task = getTaskById(id);
      return sum + (task?.estimatedMinutes || 0);
    }, 0);
  };

  const renderDay = (day: 'day1' | 'day2' | 'day3', dayNumber: number) => {
    const taskIds = localDistribution[day];
    const totalTime = getTotalTime(day);

    return (
      <div
        key={day}
        className="flex-1 border-2 border-gray-200 rounded-lg p-4 min-h-[400px]"
        onDragOver={e => e.preventDefault()}
        onDrop={() => handleDrop(day)}
      >
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Dia {dayNumber}</h3>
          <p className="text-sm text-gray-600">
            {taskIds.length} {taskIds.length === 1 ? 'tarefa' : 'tarefas'} •{' '}
            {Math.floor(totalTime / 60)}h {totalTime % 60}min
          </p>
        </div>

        <div className="space-y-2">
          {taskIds.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">Arraste tarefas para cá</p>
            </div>
          ) : (
            taskIds.map(taskId => {
              const task = getTaskById(taskId);
              if (!task) return null;

              return (
                <div
                  key={taskId}
                  draggable
                  onDragStart={() => handleDragStart(taskId)}
                  className="p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:border-blue-400 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm mb-1">{task.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>⏱️ {task.estimatedMinutes} min</span>
                        <span
                          className={`px-2 py-0.5 rounded font-semibold ${
                            task.priority === 'A'
                              ? 'bg-red-100 text-red-800'
                              : task.priority === 'B'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <span className="text-gray-400 text-lg cursor-grab">⋮⋮</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Distribua as tarefas em 3 dias
          </h2>
          <p className="text-gray-600">
            Arraste e solte as tarefas para distribuí-las ao longo dos 3 dias do ciclo.
          </p>
        </div>

        {/* Distribution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {renderDay('day1', 1)}
          {renderDay('day2', 2)}
          {renderDay('day3', 3)}
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="font-semibold text-blue-900">Total de tarefas:</span>
              <span className="ml-2 text-blue-800">{tasks.length}</span>
            </div>
            <div>
              <span className="font-semibold text-blue-900">Tempo total:</span>
              <span className="ml-2 text-blue-800">
                {Math.floor(tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0) / 60)}h{' '}
                {tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0) % 60}min
              </span>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Dica: Distribuição Equilibrada</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>✓ Priorize tarefas A no Dia 1</li>
                <li>✓ Distribua tempo de forma equilibrada (evite sobrecarregar um dia)</li>
                <li>✓ Agrupe tarefas relacionadas no mesmo dia</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            ← Voltar
          </button>
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Revisar Plano →
          </button>
        </div>
      </div>
    </div>
  );
}
