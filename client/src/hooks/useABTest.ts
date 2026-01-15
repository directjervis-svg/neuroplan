import { useState, useEffect } from 'react';

/**
 * A/B Test Hook for Dashboard Layout
 * 
 * Randomly assigns users to variant A (3 columns) or B (2 columns)
 * Persists choice in localStorage for consistency
 * 
 * Usage:
 * const { variant, isVariantB } = useABTest('dashboard-layout');
 */

export type ABVariant = 'A' | 'B';

interface ABTestConfig {
  testName: string;
  splitRatio?: number; // 0.5 = 50/50 split, 0.3 = 30% B / 70% A
}

export function useABTest(
  testName: string,
  splitRatio: number = 0.5
): {
  variant: ABVariant;
  isVariantA: boolean;
  isVariantB: boolean;
  setVariant: (variant: ABVariant) => void;
} {
  const storageKey = `ab-test-${testName}`;

  const [variant, setVariantState] = useState<ABVariant>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'A' || stored === 'B') {
        return stored as ABVariant;
      }
    }

    // Randomly assign based on split ratio
    return Math.random() < splitRatio ? 'B' : 'A';
  });

  // Persist to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, variant);
    }
  }, [variant, storageKey]);

  const setVariant = (newVariant: ABVariant) => {
    setVariantState(newVariant);
  };

  return {
    variant,
    isVariantA: variant === 'A',
    isVariantB: variant === 'B',
    setVariant,
  };
}

/**
 * Track A/B test event (for analytics)
 * 
 * Usage:
 * trackABEvent('dashboard-layout', 'B', 'task_completed', { taskId: 123 });
 */
export function trackABEvent(
  testName: string,
  variant: ABVariant,
  eventName: string,
  metadata?: Record<string, any>
) {
  // Send to analytics (Google Analytics, Mixpanel, etc.)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, {
      event_category: 'ab_test',
      event_label: `${testName}_${variant}`,
      ...metadata,
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[A/B Test] ${testName} (${variant}): ${eventName}`, metadata);
  }
}
