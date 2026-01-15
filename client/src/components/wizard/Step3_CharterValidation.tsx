/**
 * Etapa 3: Validação do Charter com IA (Agente 1)
 * Exibe análise SMART e sugestões de reformulação
 */

import React, { useState, useEffect } from 'react';
import type { CharterAnalysisResult, CharterData } from '../../hooks/wizard/useProjectWizard';

interface Step3Props {
  charter: CharterData;
  analysis: CharterAnalysisResult | null;
  onAnalyze: () => Promise<CharterAnalysisResult>;
  onAcceptSuggestion: (newCharter: string) => void;
  onKeepOriginal: () => void;
  onEdit: () => void;
  isAnalyzing: boolean;
}

export function Step3_CharterValidation({
  charter,
  analysis,
  onAnalyze,
  onAcceptSuggestion,
  onKeepOriginal,
  onEdit,
  isAnalyzing,
}: Step3Props) {
  const [localAnalysis, setLocalAnalysis] = useState<CharterAnalysisResult | null>(analysis);

  useEffect(() => {
    if (!localAnalysis && !isAnalyzing) {
      onAnalyze().then(setLocalAnalysis);
    }
  }, []);

  if (isAnalyzing || !localAnalysis) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Analisando seu objetivo...
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              Nossa IA está validando se seu objetivo é SMART (Específico, Mensurável, Atingível, Relevante, Temporal)
            </p>
          </div>
        </div>
      </div>
    );
  }

  const clarityColor =
    localAnalysis.clarity_score >= 8
      ? 'text-green-600'
      : localAnalysis.clarity_score >= 6
      ? 'text-yellow-600'
      : 'text-red-600';

  const clarityBg =
    localAnalysis.clarity_score >= 8
      ? 'bg-green-50 border-green-200'
      : localAnalysis.clarity_score >= 6
      ? 'bg-yellow-50 border-yellow-200'
      : 'bg-red-50 border-red-200';

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Análise do seu objetivo
          </h2>
          <p className="text-gray-600">
            Nossa IA analisou seu objetivo e identificou pontos de melhoria
          </p>
        </div>

        {/* Original Charter */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Seu objetivo original:</h3>
          <p className="text-gray-900">{charter.resultadoFinal}</p>
        </div>

        {/* Analysis Card */}
        <div className={`border-2 rounded-lg p-6 mb-6 ${clarityBg}`}>
          <div className="flex items-start gap-4 mb-4">
            <span className="text-4xl">
              {localAnalysis.is_smart ? '✅' : '⚠️'}
            </span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {localAnalysis.is_smart ? 'Objetivo SMART' : 'Objetivo precisa de ajustes'}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Clareza:</span>
                <span className={`text-2xl font-bold ${clarityColor}`}>
                  {localAnalysis.clarity_score}/10
                </span>
              </div>
            </div>
          </div>

          {/* Scope Traps */}
          {localAnalysis.scope_traps && localAnalysis.scope_traps.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 mb-2">⚠️ Armadilhas de escopo identificadas:</h4>
              <ul className="space-y-2">
                {localAnalysis.scope_traps.map((trap, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-800">
                    <span className="text-red-500 font-bold">•</span>
                    <span>{trap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Suggested Reformulation */}
        {localAnalysis.suggested_reformulation && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">💡</span>
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  Sugestão de reformulação
                </h3>
                <p className="text-blue-800 leading-relaxed">
                  {localAnalysis.suggested_reformulation}
                </p>
              </div>
            </div>
            <button
              onClick={() => onAcceptSuggestion(localAnalysis.suggested_reformulation!)}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Aceitar Sugestão
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={onEdit}
            className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            ← Editar
          </button>
          <button
            onClick={onKeepOriginal}
            className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            {localAnalysis.is_smart ? 'Continuar →' : 'Manter Original →'}
          </button>
        </div>
      </div>
    </div>
  );
}
