/**
 * Hook principal do Wizard de Criação de Projetos
 * Gerencia estado global e navegação entre etapas
 */

import { useState, useCallback } from 'react';

export interface CalibrationData {
  granularityLevel: 'macro' | 'meso' | 'micro';
  structuringStyle: 'top_down' | 'bottom_up';
  cognitiveCapacityMinutes: number;
}

export interface CharterData {
  projectName: string;
  resultadoFinal: string;
  prazo: Date | null;
}

export interface CharterAnalysisResult {
  is_smart: boolean;
  clarity_score: number;
  scope_traps: string[];
  suggested_reformulation: string | null;
}

export interface Deliverable {
  id: number;
  name: string;
  description: string;
  estimated_effort: number; // 1-5
  depends_on: number[] | null;
}

export interface Task {
  id: number;
  deliverableId: number;
  title: string;
  description: string;
  estimated_minutes: number;
  first_action: string;
  done_when: string;
}

export interface CycleDistribution {
  day1: Task[];
  day2: Task[];
  day3: Task[];
}

export interface WizardState {
  // Step 1: Calibration (apenas primeira vez)
  calibration: CalibrationData | null;
  
  // Step 2: Charter
  charter: CharterData;
  
  // Step 3: Charter Validation
  charterAnalysis: CharterAnalysisResult | null;
  
  // Step 4: Deliverables
  deliverables: Deliverable[];
  
  // Step 5: Tasks
  tasksByDeliverable: Map<number, Task[]>;
  
  // Step 6: Cycle Distribution
  cycleDistribution: CycleDistribution;
  
  // Navigation
  currentStep: number;
  completedSteps: Set<number>;
}

const initialState: WizardState = {
  calibration: null,
  charter: {
    projectName: '',
    resultadoFinal: '',
    prazo: null,
  },
  charterAnalysis: null,
  deliverables: [],
  tasksByDeliverable: new Map(),
  cycleDistribution: {
    day1: [],
    day2: [],
    day3: [],
  },
  currentStep: 1,
  completedSteps: new Set(),
};

export function useProjectWizard() {
  const [state, setState] = useState<WizardState>(initialState);

  const goToStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const markStepComplete = useCallback((step: number) => {
    setState(prev => ({
      ...prev,
      completedSteps: new Set([...prev.completedSteps, step]),
    }));
  }, []);

  const updateCalibration = useCallback((data: CalibrationData) => {
    setState(prev => ({ ...prev, calibration: data }));
  }, []);

  const updateCharter = useCallback((data: Partial<CharterData>) => {
    setState(prev => ({
      ...prev,
      charter: { ...prev.charter, ...data },
    }));
  }, []);

  const setCharterAnalysis = useCallback((analysis: CharterAnalysisResult) => {
    setState(prev => ({ ...prev, charterAnalysis: analysis }));
  }, []);

  const addDeliverable = useCallback((deliverable: Deliverable) => {
    setState(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, deliverable],
    }));
  }, []);

  const updateDeliverable = useCallback((id: number, data: Partial<Deliverable>) => {
    setState(prev => ({
      ...prev,
      deliverables: prev.deliverables.map(d =>
        d.id === id ? { ...d, ...data } : d
      ),
    }));
  }, []);

  const removeDeliverable = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter(d => d.id !== id),
      tasksByDeliverable: new Map(
        Array.from(prev.tasksByDeliverable.entries()).filter(
          ([deliverableId]) => deliverableId !== id
        )
      ),
    }));
  }, []);

  const setTasksForDeliverable = useCallback((deliverableId: number, tasks: Task[]) => {
    setState(prev => {
      const newMap = new Map(prev.tasksByDeliverable);
      newMap.set(deliverableId, tasks);
      return { ...prev, tasksByDeliverable: newMap };
    });
  }, []);

  const updateTask = useCallback((deliverableId: number, taskId: number, data: Partial<Task>) => {
    setState(prev => {
      const tasks = prev.tasksByDeliverable.get(deliverableId) || [];
      const newTasks = tasks.map(t => (t.id === taskId ? { ...t, ...data } : t));
      const newMap = new Map(prev.tasksByDeliverable);
      newMap.set(deliverableId, newTasks);
      return { ...prev, tasksByDeliverable: newMap };
    });
  }, []);

  const removeTask = useCallback((deliverableId: number, taskId: number) => {
    setState(prev => {
      const tasks = prev.tasksByDeliverable.get(deliverableId) || [];
      const newTasks = tasks.filter(t => t.id !== taskId);
      const newMap = new Map(prev.tasksByDeliverable);
      newMap.set(deliverableId, newTasks);
      return { ...prev, tasksByDeliverable: newMap };
    });
  }, []);

  const distributeTasks = useCallback((distribution: CycleDistribution) => {
    setState(prev => ({ ...prev, cycleDistribution: distribution }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    goToStep,
    markStepComplete,
    updateCalibration,
    updateCharter,
    setCharterAnalysis,
    addDeliverable,
    updateDeliverable,
    removeDeliverable,
    setTasksForDeliverable,
    updateTask,
    removeTask,
    distributeTasks,
    reset,
  };
}
