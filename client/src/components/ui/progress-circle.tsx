import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * NeuroFlow Progress Circle Component
 *
 * Círculo de progresso SVG com animação de preenchimento.
 * Otimizado para TDAH com:
 * - Glow effect para destaque visual
 * - Animação suave de preenchimento
 * - Cores de alta visibilidade
 *
 * Tamanhos: sm (60px), md (90px), lg (120px), xl (160px)
 * Cores: orange (ativação), blue (orientação), green (sucesso), gradient
 */

export interface ProgressCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Valor de 0 a 100 */
  value: number;
  /** Tamanho do círculo */
  size?: "sm" | "md" | "lg" | "xl";
  /** Cor do progresso */
  color?: "orange" | "blue" | "green" | "gradient";
  /** Label principal (ex: "82%") */
  label?: string;
  /** Sublabel (ex: "Focus Score") */
  sublabel?: string;
  /** Largura do traço */
  strokeWidth?: number;
  /** Mostrar animação de preenchimento */
  animated?: boolean;
}

const sizes = {
  sm: { size: 60, textSize: "text-lg", sublabelSize: "text-[10px]" },
  md: { size: 90, textSize: "text-2xl", sublabelSize: "text-xs" },
  lg: { size: 120, textSize: "text-3xl", sublabelSize: "text-sm" },
  xl: { size: 160, textSize: "text-4xl", sublabelSize: "text-base" },
};

const colors = {
  orange: {
    stroke: "var(--neuro-orange-primary)",
    glow: "drop-shadow(0 0 8px rgba(255, 140, 66, 0.4))",
  },
  blue: {
    stroke: "var(--neuro-blue-primary)",
    glow: "drop-shadow(0 0 8px rgba(37, 99, 235, 0.4))",
  },
  green: {
    stroke: "var(--neuro-green-primary)",
    glow: "drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))",
  },
  gradient: {
    stroke: "url(#progressGradient)",
    glow: "drop-shadow(0 0 8px rgba(255, 140, 66, 0.4))",
  },
};

export function ProgressCircle({
  value,
  size = "md",
  color = "orange",
  label,
  sublabel,
  strokeWidth = 6,
  animated = true,
  className,
  ...props
}: ProgressCircleProps) {
  const { size: svgSize, textSize, sublabelSize } = sizes[size];
  const { stroke, glow } = colors[color];

  // SVG circle calculations
  const center = svgSize / 2;
  const radius = center - strokeWidth - 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  // Display value
  const displayLabel = label ?? `${Math.round(value)}%`;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} {...props}>
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="transform -rotate-90"
      >
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--neuro-orange-primary)" />
            <stop offset="100%" stopColor="var(--neuro-blue-primary)" />
          </linearGradient>
        </defs>

        {/* Background Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="var(--neuro-gray-200)"
          strokeWidth={strokeWidth}
          fill="none"
          className="dark:stroke-[var(--neuro-gray-700)]"
        />

        {/* Progress Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            filter: glow,
            transition: animated ? "stroke-dashoffset 0.5s ease-out" : "none",
          }}
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(
          "font-bold text-[var(--neuro-text-primary)]",
          textSize
        )}>
          {displayLabel}
        </span>
        {sublabel && (
          <span className={cn(
            "text-[var(--neuro-text-secondary)] font-medium",
            sublabelSize
          )}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
