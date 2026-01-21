import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * NeuroFlow Button Component
 *
 * Variantes otimizadas para TDAH:
 * - primary: Laranja ativação (#FF8C42) - CTAs principais
 * - gradient: Gradiente laranja→azul - Destaque máximo
 * - secondary: Neutro - Ações secundárias
 * - success: Verde - Confirmações
 * - ghost: Transparente - Ações terciárias
 * - destructive: Vermelho - Ações perigosas
 *
 * Estados cognitivos:
 * - loading: Spinner + disabled
 * - success: Checkmark + verde temporário
 * - error: Shake + vermelho temporário
 */

const buttonVariants = cva(
  // Base styles - ADHD-friendly with clear focus states
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--neuro-orange-primary)]/40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primary - Orange activation for dopamine trigger
        primary:
          "bg-[var(--neuro-orange-primary)] text-white hover:bg-[var(--neuro-orange-600)] shadow-sm hover:shadow-md",

        // Gradient - Maximum visual impact for main CTAs
        gradient:
          "bg-[linear-gradient(135deg,var(--neuro-orange-primary)_0%,var(--neuro-blue-primary)_100%)] text-white hover:opacity-90 shadow-md hover:shadow-lg animate-pulse-glow",

        // Secondary - Neutral for secondary actions
        secondary:
          "bg-[var(--neuro-gray-200)] text-[var(--neuro-text-primary)] hover:bg-[var(--neuro-gray-300)] dark:bg-[var(--neuro-gray-700)] dark:text-[var(--neuro-text-primary)] dark:hover:bg-[var(--neuro-gray-600)]",

        // Success - Green for confirmations
        success:
          "bg-[var(--neuro-green-primary)] text-white hover:bg-[var(--neuro-green-600)] shadow-sm",

        // Ghost - Transparent for tertiary actions
        ghost:
          "bg-transparent hover:bg-[var(--neuro-gray-200)] dark:hover:bg-[var(--neuro-gray-700)]",

        // Outline - Bordered variant
        outline:
          "border-2 border-[var(--neuro-border-default)] bg-transparent hover:bg-[var(--neuro-gray-100)] hover:border-[var(--neuro-border-hover)] dark:hover:bg-[var(--neuro-gray-800)]",

        // Destructive - Red for dangerous actions
        destructive:
          "bg-[var(--neuro-red-primary)] text-white hover:bg-[var(--neuro-red-500)] shadow-sm",

        // Link - Text only
        link:
          "text-[var(--neuro-blue-primary)] underline-offset-4 hover:underline p-0 h-auto",

        // Default (legacy support)
        default:
          "bg-[var(--neuro-orange-primary)] text-white hover:bg-[var(--neuro-orange-600)] shadow-sm hover:shadow-md",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  success?: boolean;
  error?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  success = false,
  error = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  // Determine current state
  const isDisabled = disabled || loading;
  const currentVariant = success ? "success" : error ? "destructive" : variant;

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant: currentVariant, size, className }),
        loading && "cursor-wait",
        error && "animate-shake"
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-neuro-spin" />
          <span>Carregando...</span>
        </>
      ) : success ? (
        <>
          <Check className="size-4 animate-checkmark-pop" />
          <span>Sucesso!</span>
        </>
      ) : error ? (
        <>
          <AlertCircle className="size-4" />
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
