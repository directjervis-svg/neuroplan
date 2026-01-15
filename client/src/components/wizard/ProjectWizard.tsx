/**
 * Componente Principal: Project Wizard
 * Orquestra as 7 etapas do planejamento adaptativo
 */

import React from 'react';
import { useProjectWizard } from '../../hooks/wizard/useProjectWizard';
import { useWizardAPI } from '../../hooks/wizard/useWizardAPI2';
import { WizardStepper } from './WizardStepper';
import { Step1_Calibration } from './Step1_Calibration';
import { Step2_Charter } from './Step2_Charter';
import { Step3_CharterValidation } from './Step3_CharterValidation';
import { Step4_Deliverables } from './Step4_Deliverables';
import { Step5_Tasks } from './Step5_Tasks';
import { Step6_Distribution } from './Step6_Distribution';
import { Step7_Review } from './Step7_Review';
import { useNavigate } from 'react-router-dom';

export function ProjectWizard() {
  const navigate = useNavigate();
  const wizard = useProjectWizard();
  const api = useWizardAPI();

  const {
    currentStep,
    calibration,
    charter,
    charterAnalysis,
    deliverables,
    tasks,
    distribution,
    setCurrentStep,
    setCalibration,
    setCharter,
    setCharterAnalysis,
    setDeliverables,
    setTasks,
    setDistribution,
  } = wizard;

  // Step 1: Calibration
  const handleCalibrationNext = (data: typeof calibration) => {
    setCalibration(data);
    setCurrentStep(2);
  };

  // Step 2: Charter
  const handleCharterNext = (data: typeof charter) => {
    setCharter(data);
    setCurrentStep(3);
  };

  // Step 3: Charter Validation
  const handleAnalyzeCharter = async () => {
    const result = await api.analyzeCharter(charter.resultadoFinal, calibration);
    setCharterAnalysis(result);
    return result;
  };

  const handleAcceptSuggestion = (newCharter: string) => {
    setCharter(prev => ({ ...prev, resultadoFinal: newCharter }));
    setCurrentStep(4);
  };

  const handleKeepOriginal = () => {
    setCurrentStep(4);
  };

  const handleEditCharter = () => {
    setCurrentStep(2);
  };

  // Step 4: Deliverables
  const handleGenerateDeliverables = async () => {
    const result = await api.generateWBS(charter.resultadoFinal, calibration);
    setDeliverables(result);
    return result;
  };

  const handleUpdateDeliverables = (data: typeof deliverables) => {
    setDeliverables(data);
  };

  const handleDeliverablesNext = () => {
    setCurrentStep(5);
  };

  // Step 5: Tasks
  const handleGenerateTasks = async () => {
    const result = await api.generateTasks(charter.resultadoFinal, deliverables, calibration);
    setTasks(result);
    return result;
  };

  const handleUpdateTasks = (data: typeof tasks) => {
    setTasks(data);
  };

  const handleTasksNext = () => {
    setCurrentStep(6);
  };

  // Step 6: Distribution
  const handleUpdateDistribution = (data: typeof distribution) => {
    setDistribution(data);
  };

  const handleDistributionNext = () => {
    setCurrentStep(7);
  };

  // Step 7: Review & Create
  const handleCreateCycle = async () => {
    try {
      // Save calibration first
      await api.saveCalibration(calibration);

      // Create cycle with all data
      await api.createCycle({
        charter,
        deliverables,
        tasks,
        distribution,
      });

      // Navigate to dashboard
      navigate('/dashboard/barkley');
    } catch (error) {
      console.error('Error creating cycle:', error);
      throw error;
    }
  };

  // Navigation
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">
            Planejamento Adaptativo de 3 Dias
          </h1>
          <WizardStepper currentStep={currentStep} onStepClick={setCurrentStep} />
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        {currentStep === 1 && (
          <Step1_Calibration
            initialData={calibration}
            onNext={handleCalibrationNext}
            onSkip={() => {
              setCalibration({
                granularity: 'medium',
                style: 'structured',
                capacity: 'moderate',
              });
              setCurrentStep(2);
            }}
          />
        )}

        {currentStep === 2 && (
          <Step2_Charter
            initialData={charter}
            onNext={handleCharterNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && (
          <Step3_CharterValidation
            charter={charter}
            analysis={charterAnalysis}
            onAnalyze={handleAnalyzeCharter}
            onAcceptSuggestion={handleAcceptSuggestion}
            onKeepOriginal={handleKeepOriginal}
            onEdit={handleEditCharter}
            isAnalyzing={api.isAnalyzing}
          />
        )}

        {currentStep === 4 && (
          <Step4_Deliverables
            charter={charter.resultadoFinal}
            deliverables={deliverables}
            onGenerate={handleGenerateDeliverables}
            onUpdate={handleUpdateDeliverables}
            onNext={handleDeliverablesNext}
            onBack={handleBack}
            isGenerating={api.isGeneratingWBS}
          />
        )}

        {currentStep === 5 && (
          <Step5_Tasks
            deliverables={deliverables}
            tasks={tasks}
            calibration={calibration}
            onGenerate={handleGenerateTasks}
            onUpdate={handleUpdateTasks}
            onNext={handleTasksNext}
            onBack={handleBack}
            isGenerating={api.isGeneratingTasks}
          />
        )}

        {currentStep === 6 && (
          <Step6_Distribution
            tasks={tasks}
            distribution={distribution}
            onUpdate={handleUpdateDistribution}
            onNext={handleDistributionNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 7 && (
          <Step7_Review
            charter={charter}
            deliverables={deliverables}
            tasks={tasks}
            distribution={distribution}
            calibration={calibration}
            onCreateCycle={handleCreateCycle}
            onBack={handleBack}
            isCreating={api.isCreatingCycle}
          />
        )}
      </div>
    </div>
  );
}
