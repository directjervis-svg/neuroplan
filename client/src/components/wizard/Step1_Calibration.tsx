/**
 * Etapa 1: Calibração do Perfil do Usuário
 * Coleta preferências para IA adaptativa
 */

import React, { useState } from 'react';
import type { CalibrationData } from '../../hooks/wizard/useProjectWizard';

interface Step1Props {
  initialData: CalibrationData | null;
  onNext: (data: CalibrationData) => void;
  onSkip: () => void;
}

export function Step1_Calibration({ initialData, onNext, onSkip }: Step1Props) {
  const [calibration, setCalibration] = useState<CalibrationData>(
    initialData || {
      granularityLevel: 'meso',
      structuringStyle: 'top_down',
      cognitiveCapacityMinutes: 90,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(calibration);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Vamos calibrar o planejamento para você
          </h2>
          <p className="text-gray-600">
            Responda 3 perguntas rápidas para adaptar as sugestões de tarefas ao seu perfil.
            Você pode pular esta etapa e usar configurações padrão.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Pergunta 1: Granularidade */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              1. Qual tamanho de tarefa você prefere?
            </label>
            <div className="space-y-3">
              <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  name="granularity"
                  value="macro"
                  checked={calibration.granularityLevel === 'macro'}
                  onChange={() =>
                    setCalibration(prev => ({ ...prev, granularityLevel: 'macro' }))
                  }
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Macro - Tarefas grandes (2-4 horas cada)</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Prefiro ter poucas tarefas grandes e focar profundamente
                  </div>
                </div>
              </label>

              <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  name="granularity"
                  value="meso"
                  checked={calibration.granularityLevel === 'meso'}
                  onChange={() =>
                    setCalibration(prev => ({ ...prev, granularityLevel: 'meso' }))
                  }
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    Meso - Tarefas médias (30-90 minutos cada) <span className="text-blue-600 text-sm">[PADRÃO]</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Prefiro equilíbrio entre foco e variedade
                  </div>
                </div>
              </label>

              <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  name="granularity"
                  value="micro"
                  checked={calibration.granularityLevel === 'micro'}
                  onChange={() =>
                    setCalibration(prev => ({ ...prev, granularityLevel: 'micro' }))
                  }
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Micro - Tarefas pequenas (10-30 minutos cada)</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Prefiro muitas tarefas curtas para manter momentum
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Pergunta 2: Estilo de Estruturação */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              2. Como você prefere planejar?
            </label>
            <div className="space-y-3">
              <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  name="structuring"
                  value="top_down"
                  checked={calibration.structuringStyle === 'top_down'}
                  onChange={() =>
                    setCalibration(prev => ({ ...prev, structuringStyle: 'top_down' }))
                  }
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    Top-down - Planejar tudo antes de começar <span className="text-blue-600 text-sm">[PADRÃO]</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Gosto de ter clareza total antes de agir
                  </div>
                </div>
              </label>

              <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  name="structuring"
                  value="bottom_up"
                  checked={calibration.structuringStyle === 'bottom_up'}
                  onChange={() =>
                    setCalibration(prev => ({ ...prev, structuringStyle: 'bottom_up' }))
                  }
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Bottom-up - Começar e ajustar no caminho</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Prefiro descobrir conforme avanço
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Pergunta 3: Capacidade Cognitiva */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              3. Quanto tempo você consegue focar sem pausa?
            </label>
            <div className="space-y-3">
              <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  name="capacity"
                  value="45"
                  checked={calibration.cognitiveCapacityMinutes === 45}
                  onChange={() =>
                    setCalibration(prev => ({ ...prev, cognitiveCapacityMinutes: 45 }))
                  }
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">30-60 minutos</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Preciso de pausas frequentes
                  </div>
                </div>
              </label>

              <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  name="capacity"
                  value="90"
                  checked={calibration.cognitiveCapacityMinutes === 90}
                  onChange={() =>
                    setCalibration(prev => ({ ...prev, cognitiveCapacityMinutes: 90 }))
                  }
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    1-2 horas <span className="text-blue-600 text-sm">[PADRÃO]</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Consigo focar moderadamente
                  </div>
                </div>
              </label>

              <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  name="capacity"
                  value="150"
                  checked={calibration.cognitiveCapacityMinutes === 150}
                  onChange={() =>
                    setCalibration(prev => ({ ...prev, cognitiveCapacityMinutes: 150 }))
                  }
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">2-3 horas</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Consigo focar profundamente
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onSkip}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Pular (usar padrão)
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Próximo →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
