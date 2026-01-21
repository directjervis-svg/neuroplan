/**
 * Barkley Planner Agent - Orchestrator for 3-Day Cycle Generation
 * 
 * This is the main orchestrator that combines all AI agents to generate
 * a complete 3-day execution cycle for ADHD-optimized project management.
 * 
 * Flow:
 * 1. Charter Analysis: Validate and refine the goal
 * 2. WBS Generation: Break down into deliverables
 * 3. Task Generation: Generate tasks for each deliverable
 * 4. Cycle Distribution: Distribute tasks across 3 days (A-B-C priority)
 * 5. Cycle Validation: Ensure viability
 */

import {
  analyzeCharter,
  generateWBS,
  generateTasks,
  validateCycle,
  type CharterAnalysisResult,
  type WBSResult,
  type TaskGenerationResult,
  type Task,
  type UserProfile,
} from './_core/ai-agents';

// ============================================================================
// TYPES
// ============================================================================

export interface BarkleyPlannerInput {
  projectDescription: string;
  userProfile: UserProfile;
  userHistory?: string;
}

export interface CycleTask {
  title: string;
  description: string;
  estimatedMinutes: number;
  priority: 'A' | 'B' | 'C'; // A = minimum viable, B = ideal, C = bonus
  dayNumber: 1 | 2 | 3;
  firstAction: string;
  doneWhen: string;
}

export interface ThreeDayCycle {
  projectTitle: string;
  projectDescription: string;
  charterAnalysis: CharterAnalysisResult;
  deliverables: Array<{
    name: string;
    description: string;
    estimatedEffort: number;
  }>;
  tasks: CycleTask[];
  dayBreakdown: {
    day1: CycleTask[];
    day2: CycleTask[];
    day3: CycleTask[];
  };
  totalEstimatedHours: number;
  viabilityScore: number; // 0-100
  warnings: string[];
  successCriteria: string[];
}

// ============================================================================
// BARKLEY PLANNER ORCHESTRATOR
// ============================================================================

export async function generateBarkleyCycle(
  input: BarkleyPlannerInput
): Promise<ThreeDayCycle> {
  console.log('[Barkley Planner] Starting cycle generation for:', input.projectDescription);

  // Step 1: Analyze Charter
  console.log('[Barkley Planner] Step 1: Analyzing charter...');
  const charterAnalysis = await analyzeCharter(input.projectDescription);
  
  if (charterAnalysis.clarity_score < 4) {
    console.warn('[Barkley Planner] Warning: Low clarity score. Proceeding with caution.');
  }

  // Step 2: Generate WBS (Work Breakdown Structure)
  console.log('[Barkley Planner] Step 2: Generating WBS...');
  const wbs = await generateWBS(
    input.projectDescription,
    input.userProfile,
    input.userHistory
  );

  // Step 3: Generate Tasks for each Deliverable
  console.log('[Barkley Planner] Step 3: Generating tasks for each deliverable...');
  const allTasks: Task[] = [];
  
  for (const deliverable of wbs.deliverables) {
    const taskResult = await generateTasks(deliverable, input.userProfile);
    allTasks.push(...taskResult.tasks);
  }

  // Step 4: Distribute tasks across 3 days with A-B-C priority
  console.log('[Barkley Planner] Step 4: Distributing tasks across 3 days...');
  const cycleTasksWithPriority = distributeTasks(allTasks, input.userProfile);

  // Step 5: Validate Cycle Viability
  console.log('[Barkley Planner] Step 5: Validating cycle viability...');
  const validation = await validateCycle(allTasks, input.userProfile);

  // Calculate total estimated hours
  const totalMinutes = allTasks.reduce((sum, task) => sum + task.estimated_duration_minutes, 0);
  const totalHours = totalMinutes / 60;

  // Calculate viability score
  const viabilityScore = calculateViabilityScore(validation, charterAnalysis);

  // Generate success criteria
  const successCriteria = generateSuccessCriteria(wbs.deliverables);

  // Generate warnings
  const warnings = generateWarnings(charterAnalysis, validation, totalHours);

  // Organize tasks by day
  const dayBreakdown = {
    day1: cycleTasksWithPriority.filter(t => t.dayNumber === 1),
    day2: cycleTasksWithPriority.filter(t => t.dayNumber === 2),
    day3: cycleTasksWithPriority.filter(t => t.dayNumber === 3),
  };

  const cycle: ThreeDayCycle = {
    projectTitle: extractProjectTitle(input.projectDescription),
    projectDescription: input.projectDescription,
    charterAnalysis,
    deliverables: wbs.deliverables.map(d => ({
      name: d.name,
      description: d.description,
      estimatedEffort: d.estimated_effort,
    })),
    tasks: cycleTasksWithPriority,
    dayBreakdown,
    totalEstimatedHours: totalHours,
    viabilityScore,
    warnings,
    successCriteria,
  };

  console.log('[Barkley Planner] Cycle generation complete!');
  console.log(`[Barkley Planner] Total tasks: ${cycle.tasks.length}`);
  console.log(`[Barkley Planner] Estimated hours: ${cycle.totalEstimatedHours.toFixed(1)}`);
  console.log(`[Barkley Planner] Viability score: ${cycle.viabilityScore}%`);

  return cycle;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Distribute tasks across 3 days with A-B-C priority system
 * A = minimum viable (must do)
 * B = ideal (should do)
 * C = bonus (nice to have)
 */
function distributeTasks(tasks: Task[], userProfile: UserProfile): CycleTask[] {
  // Sort tasks by estimated duration (shorter first for better distribution)
  const sortedTasks = [...tasks].sort(
    (a, b) => a.estimated_duration_minutes - b.estimated_duration_minutes
  );

  const cycleCapacityPerDay = userProfile.cognitive_capacity_minutes;
  const cycleTasks: CycleTask[] = [];

  // Distribute tasks across 3 days
  let currentDay = 1;
  let currentDayLoad = 0;
  let taskIndex = 0;

  // First pass: Assign A-priority tasks (minimum viable)
  const aTasks: Task[] = [];
  const bTasks: Task[] = [];
  const cTasks: Task[] = [];

  // Heuristic: First 40% of tasks are A-priority, next 40% are B, last 20% are C
  const aThreshold = Math.ceil(sortedTasks.length * 0.4);
  const bThreshold = Math.ceil(sortedTasks.length * 0.8);

  sortedTasks.forEach((task, index) => {
    if (index < aThreshold) {
      aTasks.push(task);
    } else if (index < bThreshold) {
      bTasks.push(task);
    } else {
      cTasks.push(task);
    }
  });

  // Distribute A-tasks (must do)
  for (const task of aTasks) {
    if (currentDayLoad + task.estimated_duration_minutes > cycleCapacityPerDay) {
      currentDay++;
      currentDayLoad = 0;
    }

    if (currentDay > 3) {
      console.warn('[Barkley Planner] Warning: Too many A-priority tasks for 3 days');
      break;
    }

    cycleTasks.push({
      title: task.title,
      description: task.description,
      estimatedMinutes: task.estimated_duration_minutes,
      priority: 'A',
      dayNumber: currentDay as 1 | 2 | 3,
      firstAction: task.first_action,
      doneWhen: task.done_when,
    });

    currentDayLoad += task.estimated_duration_minutes;
  }

  // Distribute B-tasks (should do)
  currentDay = 1;
  currentDayLoad = 0;

  for (const task of bTasks) {
    // Find the day with least load
    let minDay = 1;
    let minLoad = Infinity;

    for (let day = 1; day <= 3; day++) {
      const dayLoad = cycleTasks
        .filter(t => t.dayNumber === day)
        .reduce((sum, t) => sum + t.estimatedMinutes, 0);

      if (dayLoad < minLoad && dayLoad + task.estimated_duration_minutes <= cycleCapacityPerDay) {
        minDay = day;
        minLoad = dayLoad;
      }
    }

    cycleTasks.push({
      title: task.title,
      description: task.description,
      estimatedMinutes: task.estimated_duration_minutes,
      priority: 'B',
      dayNumber: minDay as 1 | 2 | 3,
      firstAction: task.first_action,
      doneWhen: task.done_when,
    });
  }

  // Distribute C-tasks (nice to have)
  for (const task of cTasks) {
    // Find the day with least load
    let minDay = 1;
    let minLoad = Infinity;

    for (let day = 1; day <= 3; day++) {
      const dayLoad = cycleTasks
        .filter(t => t.dayNumber === day)
        .reduce((sum, t) => sum + t.estimatedMinutes, 0);

      if (dayLoad < minLoad) {
        minDay = day;
        minLoad = dayLoad;
      }
    }

    cycleTasks.push({
      title: task.title,
      description: task.description,
      estimatedMinutes: task.estimated_duration_minutes,
      priority: 'C',
      dayNumber: minDay as 1 | 2 | 3,
      firstAction: task.first_action,
      doneWhen: task.done_when,
    });
  }

  return cycleTasks;
}

/**
 * Calculate viability score (0-100)
 * Based on clarity, cognitive load, and potential blockers
 */
function calculateViabilityScore(
  validation: Awaited<ReturnType<typeof validateCycle>>,
  charterAnalysis: CharterAnalysisResult
): number {
  let score = 100;

  // Reduce score if load is too high
  if (validation.load_vs_capacity_ratio > 1.0) {
    score -= (validation.load_vs_capacity_ratio - 1.0) * 30;
  }

  // Reduce score if clarity is low
  score -= (10 - charterAnalysis.clarity_score) * 3;

  // Reduce score for each potential blocker
  score -= validation.potential_blockers.length * 5;

  // Reduce score for high context switches
  const avgContextSwitches =
    validation.context_switches_per_day.reduce((a, b) => a + b, 0) / 3;
  if (avgContextSwitches > 3) {
    score -= (avgContextSwitches - 3) * 5;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Generate success criteria based on deliverables
 */
function generateSuccessCriteria(deliverables: Array<{ name: string }>): string[] {
  return deliverables.map(d => `Completar: ${d.name}`);
}

/**
 * Generate warnings based on analysis
 */
function generateWarnings(
  charterAnalysis: CharterAnalysisResult,
  validation: Awaited<ReturnType<typeof validateCycle>>,
  totalHours: number
): string[] {
  const warnings: string[] = [];

  if (charterAnalysis.clarity_score < 5) {
    warnings.push('⚠️ Objetivo tem baixa clareza. Considere reformulá-lo antes de começar.');
  }

  if (charterAnalysis.potential_scope_issues.length > 0) {
    warnings.push(
      `⚠️ Possíveis problemas de escopo: ${charterAnalysis.potential_scope_issues.join(', ')}`
    );
  }

  if (validation.load_vs_capacity_ratio > 1.2) {
    warnings.push(
      `⚠️ Carga cognitiva ${(validation.load_vs_capacity_ratio * 100).toFixed(0)}% acima da capacidade. Considere estender para 4 dias.`
    );
  }

  if (totalHours > 20) {
    warnings.push(
      `⚠️ Ciclo muito longo (${totalHours.toFixed(1)} horas). Considere reduzir escopo.`
    );
  }

  if (validation.potential_blockers.length > 0) {
    warnings.push(
      `⚠️ ${validation.potential_blockers.length} tarefa(s) com potencial bloqueio identificada(s).`
    );
  }

  return warnings;
}

/**
 * Extract a short project title from the description
 */
function extractProjectTitle(description: string): string {
  // Take first sentence or first 50 characters
  const firstSentence = description.split('.')[0];
  return firstSentence.substring(0, 50).trim() + (firstSentence.length > 50 ? '...' : '');
}
