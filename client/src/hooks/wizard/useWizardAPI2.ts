/**
 * Hook para chamadas de API do Wizard (versão simplificada)
 * Encapsula todas as mutações tRPC relacionadas ao Wizard
 */

import { useState } from 'react';
import type {
  CalibrationData,
  CharterAnalysisResult,
  Deliverable,
  Task,
  CharterData,
  DayDistribution,
} from './useProjectWizard';

export function useWizardAPI() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingWBS, setIsGeneratingWBS] = useState(false);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [isCreatingCycle, setIsCreatingCycle] = useState(false);

  const analyzeCharter = async (
    charter: string,
    calibration: CalibrationData
  ): Promise<CharterAnalysisResult> => {
    setIsAnalyzing(true);
    try {
      // Mock implementation - replace with actual tRPC call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        is_smart: charter.length > 50,
        clarity_score: Math.floor(Math.random() * 3) + 7,
        scope_traps: charter.length < 50 ? ['Objetivo muito vago'] : [],
        suggested_reformulation: charter.length < 50 ? `${charter} com entregas claras e mensuráveis` : null,
      };
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateWBS = async (
    charter: string,
    calibration: CalibrationData
  ): Promise<Deliverable[]> => {
    setIsGeneratingWBS(true);
    try {
      // Mock implementation - replace with actual tRPC call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return [
        { id: 'del-1', name: 'Entrega 1', description: 'Descrição da entrega 1' },
        { id: 'del-2', name: 'Entrega 2', description: 'Descrição da entrega 2' },
        { id: 'del-3', name: 'Entrega 3', description: 'Descrição da entrega 3' },
      ];
    } finally {
      setIsGeneratingWBS(false);
    }
  };

  const generateTasks = async (
    charter: string,
    deliverables: Deliverable[],
    calibration: CalibrationData
  ): Promise<Task[]> => {
    setIsGeneratingTasks(true);
    try {
      // Mock implementation - replace with actual tRPC call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const tasks: Task[] = [];
      deliverables.forEach((del, delIndex) => {
        for (let i = 1; i <= 3; i++) {
          tasks.push({
            id: `task-${delIndex}-${i}`,
            deliverableId: del.id,
            name: `Tarefa ${i} de ${del.name}`,
            estimatedMinutes: 30,
            priority: 'B',
          });
        }
      });
      return tasks;
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  const saveCalibration = async (calibration: CalibrationData): Promise<void> => {
    // Mock implementation - replace with actual tRPC call
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const createCycle = async (data: {
    charter: CharterData;
    deliverables: Deliverable[];
    tasks: Task[];
    distribution: DayDistribution;
  }): Promise<void> => {
    setIsCreatingCycle(true);
    try {
      // Mock implementation - replace with actual tRPC call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Cycle created:', data);
    } finally {
      setIsCreatingCycle(false);
    }
  };

  return {
    analyzeCharter,
    generateWBS,
    generateTasks,
    saveCalibration,
    createCycle,
    isAnalyzing,
    isGeneratingWBS,
    isGeneratingTasks,
    isCreatingCycle,
  };
}
