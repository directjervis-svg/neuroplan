import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { trackPageView, trackEvent, isAnalyticsEnabled } from '@/lib/analytics';

/**
 * Hook to automatically track page views on route changes
 */
export function usePageTracking(): void {
  const [location] = useLocation();
  
  useEffect(() => {
    if (!isAnalyticsEnabled()) return;
    
    // Get page title from document
    const pageTitle = document.title;
    
    // Track the page view
    trackPageView(location, pageTitle);
  }, [location]);
}

/**
 * Hook to provide analytics functions with automatic context
 */
export function useAnalytics() {
  const [location] = useLocation();
  
  return {
    trackEvent: (eventName: string, params?: Record<string, unknown>) => {
      trackEvent(eventName, {
        ...params,
        page_path: location,
      });
    },
    trackPageView: (customPath?: string, customTitle?: string) => {
      trackPageView(customPath || location, customTitle || document.title);
    },
    isEnabled: isAnalyticsEnabled(),
  };
}
