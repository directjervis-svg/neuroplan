/**
 * Etapa 4: Identificação de Entregas (WBS)
 * Agente 2 decompõe o charter em entregas principais
 */

import React, { useState, useEffect } from 'react';
import type { Deliverable } from '../../hooks/wizard/useProjectWizard';

interface Step4Props {
  charter: string;
  deliverables: Deliverable[];
  onGenerate: () => Promise<Deliverable[]>;
  onUpdate: (deliverables: Deliverable[]) => void;
  onNext: () => void;
  onBack: () => void;
  isGenerating: boolean;
}

export function Step4_Deliverables({
  charter,
  deliverables,
  onGenerate,
  onUpdate,
  onNext,
  onBack,
  isGenerating,
}: Step4Props) {
  const [localDeliverables, setLocalDeliverables] = useState<Deliverable[]>(deliverables);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (localDeliverables.length === 0 && !isGenerating) {
      onGenerate().then(setLocalDeliverables);
    }
  }, []);

  const handleEdit = (id: string, field: keyof Deliverable, value: string) => {
    setLocalDeliverables(prev =>
      prev.map(d => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleDelete = (id: string) => {
    if (localDeliverables.length <= 1) {
      setError('Você precisa ter pelo menos 1 entrega');
      return;
    }
    setLocalDeliverables(prev => prev.filter(d => d.id !== id));
    setError('');
  };

  const handleAdd = () => {
    if (localDeliverables.length >= 10) {
      setError('Máximo de 10 entregas permitidas');
      return;
    }
    const newDeliverable: Deliverable = {
      id: `del-${Date.now()}`,
      name: '',
      description: '',
    };
    setLocalDeliverables(prev => [...prev, newDeliverable]);
    setEditingId(newDeliverable.id);
    setError('');
  };

  const handleNext = () => {
    const invalid = localDeliverables.some(d => d.name.trim().length < 3);
    if (invalid) {
      setError('Todas as entregas devem ter pelo menos 3 caracteres no nome');
      return;
    }
    onUpdate(localDeliverables);
    onNext();
  };

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Identificando entregas principais...
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              Nossa IA está decompondo seu projeto em entregas gerenciáveis (WBS)
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
            Entregas principais do projeto
          </h2>
          <p className="text-gray-600">
            Revise e ajuste as entregas identificadas pela IA. Cada entrega deve ser um resultado concreto.
          </p>
        </div>

        {/* Charter Reference */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Seu objetivo:</h3>
          <p className="text-blue-800 text-sm">{charter}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Deliverables List */}
        <div className="space-y-4 mb-6">
          {localDeliverables.map((deliverable, index) => (
            <div
              key={deliverable.id}
              className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Number */}
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>

                {/* Content */}
                <div className="flex-1">
                  {editingId === deliverable.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={deliverable.name}
                        onChange={e => handleEdit(deliverable.id, 'name', e.target.value)}
                        placeholder="Nome da entrega"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <textarea
                        value={deliverable.description}
                        onChange={e => handleEdit(deliverable.id, 'description', e.target.value)}
                        placeholder="Descrição (opcional)"
                        rows={2}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Salvar
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{deliverable.name}</h4>
                      {deliverable.description && (
                        <p className="text-sm text-gray-600">{deliverable.description}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {editingId !== deliverable.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingId(deliverable.id)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(deliverable.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Button */}
        {localDeliverables.length < 10 && (
          <button
            onClick={handleAdd}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors font-medium"
          >
            + Adicionar Entrega
          </button>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Dica: Entregas vs Tarefas</h4>
              <p className="text-sm text-yellow-800">
                <strong>Entrega:</strong> Resultado concreto e mensurável (ex: "Vídeo editado")
                <br />
                <strong>Tarefa:</strong> Ação para alcançar a entrega (ex: "Gravar áudio", "Adicionar legendas")
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            ← Voltar
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {localDeliverables.length} {localDeliverables.length === 1 ? 'entrega' : 'entregas'}
            </span>
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Gerar Tarefas →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
