import React, { useEffect } from 'react';
import { useABTest, trackABEvent } from '@/hooks/useABTest';
import DashboardBarkley from './DashboardBarkley';
import DashboardBarkley2Col from './DashboardBarkley2Col';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Columns2 } from 'lucide-react';

/**
 * Dashboard A/B Test Wrapper
 * 
 * Automatically assigns users to:
 * - Variant A: 3-column layout (original)
 * - Variant B: 2-column layout (optimized for TDAH)
 * 
 * Split: 50/50
 * Duration: 14 days
 * 
 * Metrics tracked:
 * - Task completion rate
 * - Time to complete tasks
 * - User retention D7, D30
 * - Subjective feedback (NPS)
 */

export default function DashboardABTest() {
  const { variant, isVariantA, isVariantB, setVariant } = useABTest('dashboard-layout', 0.5);

  // Track variant assignment on mount
  useEffect(() => {
    trackABEvent('dashboard-layout', variant, 'variant_assigned');
  }, []);

  // Allow manual override in development
  const showDebugControls = process.env.NODE_ENV === 'development';

  return (
    <div className="relative">
      {/* Debug Controls (Development Only) */}
      {showDebugControls && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={isVariantA ? 'default' : 'outline'}>
              Variante Atual: {variant}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isVariantA ? 'default' : 'outline'}
              onClick={() => {
                setVariant('A');
                trackABEvent('dashboard-layout', 'A', 'manual_override');
                window.location.reload();
              }}
            >
              <LayoutGrid className="w-4 h-4 mr-1" />
              3 Colunas (A)
            </Button>
            <Button
              size="sm"
              variant={isVariantB ? 'default' : 'outline'}
              onClick={() => {
                setVariant('B');
                trackABEvent('dashboard-layout', 'B', 'manual_override');
                window.location.reload();
              }}
            >
              <Columns2 className="w-4 h-4 mr-1" />
              2 Colunas (B)
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            A/B Test: Dashboard Layout
          </p>
        </div>
      )}

      {/* Render appropriate variant */}
      {isVariantA && <DashboardBarkley />}
      {isVariantB && <DashboardBarkley2Col />}
    </div>
  );
}
