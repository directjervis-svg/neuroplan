/**
 * Google Analytics 4 Integration
 * 
 * This module provides functions to track events in Google Analytics 4.
 * It uses the gtag.js library which is loaded in index.html.
 * 
 * Events tracked:
 * - page_view: All page navigations
 * - sign_up: User registration
 * - login: User login
 * - project_created: New project creation
 * - task_completed: Task completion
 * - subscription_started: Upgrade to PRO/TEAM
 * - focus_session_started: Timer started
 * - focus_session_completed: Timer completed
 * - idea_captured: Quick idea saved
 */

// Declare gtag function type
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

// Get the GA Measurement ID from environment
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

/**
 * Check if Google Analytics is available
 */
export function isAnalyticsEnabled(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.gtag === 'function' && 
         GA_MEASUREMENT_ID.length > 0;
}

/**
 * Track a page view
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  if (!isAnalyticsEnabled()) return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: pagePath,
    page_title: pageTitle,
  });
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, unknown>
): void {
  if (!isAnalyticsEnabled()) return;
  
  window.gtag('event', eventName, eventParams);
}

// ============================================
// SPECIFIC EVENT TRACKING FUNCTIONS
// ============================================

/**
 * Track user sign up
 */
export function trackSignUp(method: string = 'oauth'): void {
  trackEvent('sign_up', {
    method,
  });
}

/**
 * Track user login
 */
export function trackLogin(method: string = 'oauth'): void {
  trackEvent('login', {
    method,
  });
}

/**
 * Track project creation
 */
export function trackProjectCreated(
  projectId: number,
  category: string,
  cycleDuration: string
): void {
  trackEvent('project_created', {
    project_id: projectId,
    category,
    cycle_duration: cycleDuration,
  });
}

/**
 * Track task completion
 */
export function trackTaskCompleted(
  taskId: number,
  projectId: number,
  taskType: string,
  focusMinutes?: number
): void {
  trackEvent('task_completed', {
    task_id: taskId,
    project_id: projectId,
    task_type: taskType,
    focus_minutes: focusMinutes,
  });
}

/**
 * Track subscription started (upgrade to PRO/TEAM)
 */
export function trackSubscriptionStarted(
  plan: 'PRO' | 'TEAM',
  priceAmount: number
): void {
  trackEvent('subscription_started', {
    plan,
    value: priceAmount / 100, // Convert cents to currency
    currency: 'BRL',
  });
  
  // Also track as a purchase event for e-commerce tracking
  trackEvent('purchase', {
    transaction_id: `sub_${Date.now()}`,
    value: priceAmount / 100,
    currency: 'BRL',
    items: [{
      item_id: plan.toLowerCase(),
      item_name: `NeuroExecução ${plan}`,
      category: 'subscription',
      price: priceAmount / 100,
      quantity: 1,
    }],
  });
}

/**
 * Track focus session started
 */
export function trackFocusSessionStarted(
  taskId?: number,
  timerType: 'PROGRESSIVE' | 'COUNTDOWN' = 'PROGRESSIVE'
): void {
  trackEvent('focus_session_started', {
    task_id: taskId,
    timer_type: timerType,
  });
}

/**
 * Track focus session completed
 */
export function trackFocusSessionCompleted(
  taskId: number | undefined,
  durationSeconds: number,
  pauseCount: number
): void {
  trackEvent('focus_session_completed', {
    task_id: taskId,
    duration_seconds: durationSeconds,
    duration_minutes: Math.round(durationSeconds / 60),
    pause_count: pauseCount,
  });
}

/**
 * Track quick idea captured
 */
export function trackIdeaCaptured(projectId?: number): void {
  trackEvent('idea_captured', {
    project_id: projectId,
    has_project: !!projectId,
  });
}

/**
 * Track onboarding step completed
 */
export function trackOnboardingStep(
  stepId: string,
  stepNumber: number,
  totalSteps: number
): void {
  trackEvent('onboarding_step', {
    step_id: stepId,
    step_number: stepNumber,
    total_steps: totalSteps,
    progress_percent: Math.round((stepNumber / totalSteps) * 100),
  });
}

/**
 * Track onboarding completed
 */
export function trackOnboardingCompleted(skipped: boolean = false): void {
  trackEvent('onboarding_completed', {
    skipped,
  });
}

/**
 * Track consent given (LGPD)
 */
export function trackConsentGiven(consentVersion: string): void {
  trackEvent('consent_given', {
    consent_version: consentVersion,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsed(
  featureName: string,
  context?: Record<string, unknown>
): void {
  trackEvent('feature_used', {
    feature_name: featureName,
    ...context,
  });
}

/**
 * Track error occurred
 */
export function trackError(
  errorType: string,
  errorMessage: string,
  context?: Record<string, unknown>
): void {
  trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    ...context,
  });
}
