/**
 * Barra de progresso do Wizard com 7 etapas
 */

import React from 'react';

interface WizardStepperProps {
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
}

const steps = [
  { id: 1, label: 'Calibração', icon: '⚙️' },
  { id: 2, label: 'Charter', icon: '🎯' },
  { id: 3, label: 'Validação', icon: '✅' },
  { id: 4, label: 'Entregas', icon: '📦' },
  { id: 5, label: 'Tarefas', icon: '✏️' },
  { id: 6, label: 'Distribuição', icon: '📅' },
  { id: 7, label: 'Revisão', icon: '👁️' },
];

export function WizardStepper({ currentStep, completedSteps, onStepClick }: WizardStepperProps) {
  return (
    <div className="w-full py-6 px-4 bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = completedSteps.has(step.id);
            const isClickable = isCompleted || step.id <= currentStep;

            return (
              <React.Fragment key={step.id}>
                {/* Step Circle */}
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={`
                    flex flex-col items-center gap-2 transition-all
                    ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-50'}
                  `}
                >
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-xl
                      transition-all duration-300
                      ${isActive ? 'bg-blue-600 text-white shadow-lg scale-110' : ''}
                      ${isCompleted && !isActive ? 'bg-green-500 text-white' : ''}
                      ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-500' : ''}
                    `}
                  >
                    {isCompleted && !isActive ? '✓' : step.icon}
                  </div>
                  <span
                    className={`
                      text-xs font-medium hidden sm:block
                      ${isActive ? 'text-blue-600' : ''}
                      ${isCompleted && !isActive ? 'text-green-600' : ''}
                      ${!isActive && !isCompleted ? 'text-gray-500' : ''}
                    `}
                  >
                    {step.label}
                  </span>
                </button>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`
                      flex-1 h-1 mx-2 transition-all duration-300
                      ${completedSteps.has(step.id) ? 'bg-green-500' : 'bg-gray-200'}
                    `}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
