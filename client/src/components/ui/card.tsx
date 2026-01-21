import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * NeuroFlow Card Component
 *
 * Variantes otimizadas para TDAH:
 * - default: Card sólido padrão
 * - glass: Efeito glassmorphism sutil
 * - bordered: Borda destacada sem sombra
 *
 * Props especiais:
 * - interactive: Hover effects + cursor pointer
 * - elevated: Sombra mais pronunciada
 */

const cardVariants = cva(
  "flex flex-col rounded-xl transition-all duration-150 ease-out",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--neuro-bg-card)] border border-[var(--neuro-border-default)] shadow-[var(--neuro-shadow-sm)]",
        glass:
          "bg-[var(--neuro-bg-card)]/80 backdrop-blur-md border border-[var(--neuro-border-default)]/50",
        bordered:
          "bg-[var(--neuro-bg-card)] border-2 border-[var(--neuro-border-default)]",
      },
      interactive: {
        true: "cursor-pointer hover:border-[var(--neuro-border-hover)] hover:shadow-[var(--neuro-shadow-md)] active:scale-[0.99]",
        false: "",
      },
      elevated: {
        true: "shadow-[var(--neuro-shadow-lg)]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
      elevated: false,
    },
  }
);

export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

function Card({
  className,
  variant,
  interactive,
  elevated,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, interactive, elevated, className }))}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1.5 p-6 pb-0",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "text-lg font-semibold leading-tight text-[var(--neuro-text-primary)]",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn(
        "text-sm text-[var(--neuro-text-secondary)]",
        className
      )}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "absolute top-4 right-4",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center p-6 pt-0",
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
