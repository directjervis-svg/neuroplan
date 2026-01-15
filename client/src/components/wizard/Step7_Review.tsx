/**
 * Etapa 7: Revisão Final e Criação do Ciclo
 * Usuário revisa todo o plano e confirma criação
 */

import React, { useState } from 'react';
import type {
  CharterData,
  Deliverable,
  Task,
  DayDistribution,
  CalibrationData,
} from '../../hooks/wizard/useProjectWizard';

interface Step7Props {
  charter: CharterData;
  deliverables: Deliverable[];
  tasks: Task[];
  distribution: DayDistribution;
  calibration: CalibrationData;
  onCreateCycle: () => Promise<void>;
  onBack: () => void;
  isCreating: boolean;
}

export function Step7_Review({
  charter,
  deliverables,
  tasks,
  distribution,
  calibration,
  onCreateCycle,
  onBack,
  isCreating,
}: Step7Props) {
  const [error, setError] = useState<string>('');

  const handleCreate = async () => {
    try {
      setError('');
      await onCreateCycle();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar ciclo');
    }
  };

  const getTaskById = (id: string) => tasks.find(t => t.id === id)!;

  const getTotalTime = (day: 'day1' | 'day2' | 'day3') => {
    return distribution[day].reduce((sum, id) => {
      const task = getTaskById(id);
      return sum + (task?.estimatedMinutes || 0);
    }, 0);
  };

  const renderDaySummary = (day: 'day1' | 'day2' | 'day3', dayNumber: number) => {
    const taskIds = distribution[day];
    const totalTime = getTotalTime(day);

    return (
      <div key={day} className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">Dia {dayNumber}</h4>
          <span className="text-sm text-gray-600">
            {taskIds.length} tarefas • {Math.floor(totalTime / 60)}h {totalTime % 60}min
          </span>
        </div>
        <ul className="space-y-2">
          {taskIds.map(taskId => {
            const task = getTaskById(taskId);
            if (!task) return null;

            return (
              <li key={taskId} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span className="flex-1">{task.name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    task.priority === 'A'
                      ? 'bg-red-100 text-red-800'
                      : task.priority === 'B'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {task.priority}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  if (isCreating) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Criando seu ciclo de 3 dias...
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              Estamos salvando seu plano e preparando tudo para você começar!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Revise seu plano de 3 dias
          </h2>
          <p className="text-gray-600">
            Confira todos os detalhes antes de criar o ciclo. Você poderá ajustar durante a execução.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Section 1: Charter */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Objetivo do Projeto</h3>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-medium text-gray-900 mb-2">{charter.projectName}</p>
            <p className="text-sm text-gray-700">{charter.resultadoFinal}</p>
            {charter.prazo && (
              <p className="text-sm text-gray-600 mt-2">
                Prazo: {new Date(charter.prazo).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        </div>

        {/* Section 2: Deliverables */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            2. Entregas Principais ({deliverables.length})
          </h3>
          <ul className="space-y-2">
            {deliverables.map((deliverable, index) => (
              <li key={deliverable.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{deliverable.name}</p>
                  {deliverable.description && (
                    <p className="text-sm text-gray-600">{deliverable.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 3: Distribution */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            3. Distribuição de Tarefas ({tasks.length} tarefas)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderDaySummary('day1', 1)}
            {renderDaySummary('day2', 2)}
            {renderDaySummary('day3', 3)}
          </div>
        </div>

        {/* Section 4: Profile */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Seu Perfil</h3>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-blue-900 mb-1">Granularidade</p>
                <p className="text-blue-800">{calibration.granularity}</p>
              </div>
              <div>
                <p className="font-medium text-blue-900 mb-1">Estilo</p>
                <p className="text-blue-800">{calibration.style}</p>
              </div>
              <div>
                <p className="font-medium text-blue-900 mb-1">Capacidade</p>
                <p className="text-blue-800">{calibration.capacity}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-green-900 mb-2">Resumo do Ciclo</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-green-700">Entregas</p>
              <p className="text-2xl font-bold text-green-900">{deliverables.length}</p>
            </div>
            <div>
              <p className="text-green-700">Tarefas</p>
              <p className="text-2xl font-bold text-green-900">{tasks.length}</p>
            </div>
            <div>
              <p className="text-green-700">Tempo Total</p>
              <p className="text-2xl font-bold text-green-900">
                {Math.floor(tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0) / 60)}h
              </p>
            </div>
            <div>
              <p className="text-green-700">Duração</p>
              <p className="text-2xl font-bold text-green-900">3 dias</p>
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
            onClick={handleCreate}
            disabled={isCreating}
            className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✓ Criar Ciclo e Começar!
          </button>
        </div>
      </div>
    </div>
  );
}
