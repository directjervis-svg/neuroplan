/**
 * Etapa 2: Definição do Charter do Projeto
 * Captura nome, resultado final e prazo
 */

import React, { useState } from 'react';
import type { CharterData } from '../../hooks/wizard/useProjectWizard';

interface Step2Props {
  initialData: CharterData;
  onNext: (data: CharterData) => void;
  onBack: () => void;
}

export function Step2_Charter({ initialData, onNext, onBack }: Step2Props) {
  const [charter, setCharter] = useState<CharterData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof CharterData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CharterData, string>> = {};

    if (charter.projectName.trim().length < 3) {
      newErrors.projectName = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (charter.resultadoFinal.trim().length < 10) {
      newErrors.resultadoFinal = 'Descreva o resultado desejado (mínimo 10 caracteres)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext(charter);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Defina o objetivo do seu projeto
          </h2>
          <p className="text-gray-600">
            Descreva o que você quer alcançar nos próximos 3 dias. Seja específico!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo 1: Nome do Projeto */}
          <div>
            <label htmlFor="projectName" className="block text-sm font-semibold text-gray-900 mb-2">
              1. Nome do Projeto
            </label>
            <input
              type="text"
              id="projectName"
              value={charter.projectName}
              onChange={e => setCharter(prev => ({ ...prev, projectName: e.target.value }))}
              placeholder="Ex: Lançar meu canal no YouTube"
              maxLength={255}
              className={`
                w-full px-4 py-3 border-2 rounded-lg text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
                ${errors.projectName ? 'border-red-500' : 'border-gray-300'}
              `}
            />
            {errors.projectName && (
              <p className="mt-2 text-sm text-red-600">{errors.projectName}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              {charter.projectName.length}/255 caracteres
            </p>
          </div>

          {/* Campo 2: Resultado Final Desejado */}
          <div>
            <label htmlFor="resultadoFinal" className="block text-sm font-semibold text-gray-900 mb-2">
              2. Resultado Final Desejado
            </label>
            <textarea
              id="resultadoFinal"
              value={charter.resultadoFinal}
              onChange={e => setCharter(prev => ({ ...prev, resultadoFinal: e.target.value }))}
              placeholder="Descreva o que você quer alcançar...&#10;&#10;Exemplo: Ter 10 vídeos publicados com edição profissional e thumbnail atraente, canal configurado com logo e descrição"
              maxLength={1000}
              rows={6}
              className={`
                w-full px-4 py-3 border-2 rounded-lg text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none
                ${errors.resultadoFinal ? 'border-red-500' : 'border-gray-300'}
              `}
            />
            {errors.resultadoFinal && (
              <p className="mt-2 text-sm text-red-600">{errors.resultadoFinal}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              {charter.resultadoFinal.length}/1000 caracteres
            </p>
          </div>

          {/* Campo 3: Prazo (Opcional) */}
          <div>
            <label htmlFor="prazo" className="block text-sm font-semibold text-gray-900 mb-2">
              3. Prazo (Opcional)
            </label>
            <input
              type="date"
              id="prazo"
              value={charter.prazo ? charter.prazo.toISOString().split('T')[0] : ''}
              onChange={e =>
                setCharter(prev => ({
                  ...prev,
                  prazo: e.target.value ? new Date(e.target.value) : null,
                }))
              }
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <p className="mt-2 text-xs text-gray-500">
              Quando você quer concluir este projeto?
            </p>
          </div>

          {/* Dica de Boas Práticas */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Dica: Seja SMART</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ <strong>Específico:</strong> "10 vídeos" em vez de "alguns vídeos"</li>
                  <li>✓ <strong>Mensurável:</strong> Defina critérios claros de conclusão</li>
                  <li>✓ <strong>Realista:</strong> Considere o tempo disponível (3 dias)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              ← Voltar
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Validar Charter →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
