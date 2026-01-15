/**
 * Hook principal do Wizard de Criação de Projetos
 * Gerencia estado global e navegação entre etapas
 */

import { useState } from 'react';

export interface CalibrationData {
  granularity: 'macro' | 'medium' | 'micro';
  style: 'structured' | 'flexible';
  capacity: 'low' | 'moderate' | 'high';
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
  id: string;
  name: string;
  description: string;
}

export interface Task {
  id: string;
  deliverableId: string;
  name: string;
  estimatedMinutes: number;
  priority: 'A' | 'B' | 'C';
}

export interface DayDistribution {
  day1: string[]; // Task IDs
  day2: string[];
  day3: string[];
}

export function useProjectWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  
  const [calibration, setCalibration] = useState<CalibrationData>({
    granularity: 'medium',
    style: 'structured',
    capacity: 'moderate',
  });

  const [charter, setCharter] = useState<CharterData>({
    projectName: '',
    resultadoFinal: '',
    prazo: null,
  });

  const [charterAnalysis, setCharterAnalysis] = useState<CharterAnalysisResult | null>(null);

  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [distribution, setDistribution] = useState<DayDistribution>({
    day1: [],
    day2: [],
    day3: [],
  });

  return {
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
  };
}
