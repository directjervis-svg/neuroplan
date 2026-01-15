/**
 * Etapa 5: Decomposição em Tarefas
 * Agente 3 gera tarefas adaptadas ao perfil do usuário
 */

import React, { useState, useEffect } from 'react';
import type { Deliverable, Task, CalibrationData } from '../../hooks/wizard/useProjectWizard';

interface Step5Props {
  deliverables: Deliverable[];
  tasks: Task[];
  calibration: CalibrationData;
  onGenerate: () => Promise<Task[]>;
  onUpdate: (tasks: Task[]) => void;
  onNext: () => void;
  onBack: () => void;
  isGenerating: boolean;
}

export function Step5_Tasks({
  deliverables,
  tasks,
  calibration,
  onGenerate,
  onUpdate,
  onNext,
  onBack,
  isGenerating,
}: Step5Props) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [expandedDeliverable, setExpandedDeliverable] = useState<string | null>(
    deliverables[0]?.id || null
  );
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (localTasks.length === 0 && !isGenerating) {
      onGenerate().then(setLocalTasks);
    }
  }, []);

  const getTasksByDeliverable = (deliverableId: string) =>
    localTasks.filter(t => t.deliverableId === deliverableId);

  const handleEditTask = (taskId: string, field: keyof Task, value: any) => {
    setLocalTasks(prev => prev.map(t => (t.id === taskId ? { ...t, [field]: value } : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    setLocalTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleAddTask = (deliverableId: string) => {
    if (localTasks.length >= 30) {
      setError('Máximo de 30 tarefas permitidas');
      return;
    }
    const newTask: Task = {
      id: `task-${Date.now()}`,
      deliverableId,
      name: '',
      estimatedMinutes: 30,
      priority: 'B',
    };
    setLocalTasks(prev => [...prev, newTask]);
    setEditingTaskId(newTask.id);
    setError('');
  };

  const handleNext = () => {
    const invalid = localTasks.some(t => t.name.trim().length < 3);
    if (invalid) {
      setError('Todas as tarefas devem ter pelo menos 3 caracteres no nome');
      return;
    }
    onUpdate(localTasks);
    onNext();
  };

  if (isGenerating) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Gerando tarefas adaptadas ao seu perfil...
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              Nossa IA está criando tarefas personalizadas com base no seu estilo de trabalho
            </p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Granularidade: <strong>{calibration.granularity}</strong></p>
              <p>Estilo: <strong>{calibration.style}</strong></p>
              <p>Capacidade: <strong>{calibration.capacity}</strong></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Tarefas do projeto
          </h2>
          <p className="text-gray-600">
            Revise e ajuste as tarefas geradas pela IA. Elas foram adaptadas ao seu perfil.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Deliverables Accordion */}
        <div className="space-y-4 mb-6">
          {deliverables.map((deliverable, delIndex) => {
            const deliverableTasks = getTasksByDeliverable(deliverable.id);
            const isExpanded = expandedDeliverable === deliverable.id;

            return (
              <div
                key={deliverable.id}
                className="border-2 border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Deliverable Header */}
                <button
                  onClick={() =>
                    setExpandedDeliverable(isExpanded ? null : deliverable.id)
                  }
                  className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {delIndex + 1}
                    </span>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{deliverable.name}</h3>
                      <p className="text-sm text-gray-600">
                        {deliverableTasks.length} {deliverableTasks.length === 1 ? 'tarefa' : 'tarefas'}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl text-gray-400">
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </button>

                {/* Tasks List */}
                {isExpanded && (
                  <div className="p-6 space-y-3">
                    {deliverableTasks.map((task, taskIndex) => (
                      <div
                        key={task.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                      >
                        {editingTaskId === task.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={task.name}
                              onChange={e => handleEditTask(task.id, 'name', e.target.value)}
                              placeholder="Nome da tarefa"
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Tempo estimado (min)
                                </label>
                                <input
                                  type="number"
                                  value={task.estimatedMinutes}
                                  onChange={e =>
                                    handleEditTask(task.id, 'estimatedMinutes', parseInt(e.target.value) || 0)
                                  }
                                  min={5}
                                  max={240}
                                  step={5}
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Prioridade
                                </label>
                                <select
                                  value={task.priority}
                                  onChange={e =>
                                    handleEditTask(task.id, 'priority', e.target.value as 'A' | 'B' | 'C')
                                  }
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="A">A - Alta</option>
                                  <option value="B">B - Média</option>
                                  <option value="C">C - Baixa</option>
                                </select>
                              </div>
                            </div>
                            <button
                              onClick={() => setEditingTaskId(null)}
                              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Salvar
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-medium text-gray-500">
                                  {delIndex + 1}.{taskIndex + 1}
                                </span>
                                <h4 className="font-medium text-gray-900">{task.name}</h4>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>⏱️ {task.estimatedMinutes} min</span>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold ${
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
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingTaskId(task.id)}
                                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                                title="Excluir"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add Task Button */}
                    <button
                      onClick={() => handleAddTask(deliverable.id)}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors font-medium text-sm"
                    >
                      + Adicionar Tarefa
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="font-semibold text-blue-900">Total de tarefas:</span>
              <span className="ml-2 text-blue-800">{localTasks.length}/30</span>
            </div>
            <div>
              <span className="font-semibold text-blue-900">Tempo total estimado:</span>
              <span className="ml-2 text-blue-800">
                {Math.floor(localTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0) / 60)}h{' '}
                {localTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0) % 60}min
              </span>
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
            Distribuir em 3 Dias →
          </button>
        </div>
      </div>
    </div>
  );
}
