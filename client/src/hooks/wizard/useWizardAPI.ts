/**
 * Hook para chamadas tRPC do Wizard
 * Encapsula todas as mutações de IA e calibração
 */

import { trpc } from '../../lib/trpc';

export function useWizardAPI() {
  // AI Agents
  const analyzeCharter = trpc.ai.analyzeCharter.useMutation();
  const generateWBS = trpc.ai.generateWBS.useMutation();
  const generateTasks = trpc.ai.generateTasksAdaptive.useMutation();
  
  // User Calibration
  const getCalibration = trpc.user.getCalibration.useQuery();
  const saveCalibration = trpc.user.saveCalibration.useMutation();
  
  // Projects & Tasks
  const createProject = trpc.projects.create.useMutation();
  const createTask = trpc.tasks.create.useMutation();
  
  return {
    // AI
    analyzeCharter,
    generateWBS,
    generateTasks,
    
    // Calibration
    getCalibration,
    saveCalibration,
    
    // Project Creation
    createProject,
    createTask,
  };
}
