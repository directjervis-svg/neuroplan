import * as React from "react";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

/**
 * NeuroFlow Metric Card Component
 *
 * Card de métrica otimizado para dashboard TDAH:
 * - Valor grande e destacado
 * - Trend indicator visual (up/down/neutral)
 * - Cores semânticas para interpretação rápida
 * - Ícone opcional para contexto
 */

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Título da métrica */
  title: string;
  /** Valor principal (ex: "82%", "12", "3h 42m") */
  value: string | number;
  /** Subtítulo ou contexto (ex: "vs last week") */
  subtitle?: string;
  /** Direção da tendência */
  trend?: "up" | "down" | "neutral";
  /** Valor da mudança (ex: "+12%", "-5") */
  trendValue?: string;
  /** Ícone do card */
  icon?: LucideIcon;
  /** Cor semântica */
  color?: "orange" | "blue" | "green" | "yellow" | "red" | "neutral";
  /** Loading state */
  loading?: boolean;
}

const colorStyles = {
  orange: {
    icon: "text-[var(--neuro-orange-primary)] bg-[var(--neuro-orange-100)]",
    value: "text-[var(--neuro-orange-primary)]",
    trend: "text-[var(--neuro-orange-600)]",
  },
  blue: {
    icon: "text-[var(--neuro-blue-primary)] bg-[var(--neuro-blue-100)]",
    value: "text-[var(--neuro-blue-primary)]",
    trend: "text-[var(--neuro-blue-600)]",
  },
  green: {
    icon: "text-[var(--neuro-green-primary)] bg-[var(--neuro-green-100)]",
    value: "text-[var(--neuro-green-primary)]",
    trend: "text-[var(--neuro-green-600)]",
  },
  yellow: {
    icon: "text-[var(--neuro-yellow-primary)] bg-[var(--neuro-yellow-100)]",
    value: "text-[var(--neuro-yellow-primary)]",
    trend: "text-[var(--neuro-yellow-600)]",
  },
  red: {
    icon: "text-[var(--neuro-red-primary)] bg-[var(--neuro-red-100)]",
    value: "text-[var(--neuro-red-primary)]",
    trend: "text-[var(--neuro-red-500)]",
  },
  neutral: {
    icon: "text-[var(--neuro-gray-600)] bg-[var(--neuro-gray-200)]",
    value: "text-[var(--neuro-text-primary)]",
    trend: "text-[var(--neuro-text-secondary)]",
  },
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const trendColors = {
  up: "text-[var(--neuro-green-primary)]",
  down: "text-[var(--neuro-red-primary)]",
  neutral: "text-[var(--neuro-text-tertiary)]",
};

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  color = "neutral",
  loading = false,
  className,
  ...props
}: MetricCardProps) {
  const styles = colorStyles[color];
  const TrendIcon = trend ? trendIcons[trend] : null;

  if (loading) {
    return (
      <Card className={cn("p-6", className)} {...props}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[var(--neuro-gray-200)] rounded w-24" />
          <div className="h-8 bg-[var(--neuro-gray-200)] rounded w-16" />
          <div className="h-3 bg-[var(--neuro-gray-200)] rounded w-32" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)} {...props}>
      <div className="flex items-start justify-between">
        {/* Content */}
        <div className="space-y-1">
          {/* Title */}
          <p className="text-sm font-medium text-[var(--neuro-text-secondary)]">
            {title}
          </p>

          {/* Value */}
          <p className={cn(
            "text-3xl font-bold tracking-tight animate-count-up",
            styles.value
          )}>
            {value}
          </p>

          {/* Subtitle + Trend */}
          <div className="flex items-center gap-2 mt-1">
            {trend && TrendIcon && (
              <span className={cn("flex items-center gap-0.5 text-xs font-medium", trendColors[trend])}>
                <TrendIcon className="h-3 w-3" />
                {trendValue && <span>{trendValue}</span>}
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-[var(--neuro-text-tertiary)]">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Icon */}
        {Icon && (
          <div className={cn(
            "p-2.5 rounded-xl",
            styles.icon
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
