import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * NeuroFlow Task Checkbox Component
 *
 * Checkbox TDAH-friendly otimizado para:
 * - Animação de celebração ao completar (dopamine trigger)
 * - Efeito ripple no clique
 * - Strikethrough no label
 * - Cores laranja de alta visibilidade
 *
 * Usado principalmente para listas de tarefas.
 */

export interface CheckboxTaskProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /** Label da tarefa */
  label?: string;
  /** Descrição secundária */
  description?: string;
  /** Mostrar animação de celebração */
  celebrateOnCheck?: boolean;
}

const CheckboxTask = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxTaskProps
>(({ className, label, description, celebrateOnCheck = true, checked, onCheckedChange, ...props }, ref) => {
  const [showRipple, setShowRipple] = React.useState(false);
  const [justChecked, setJustChecked] = React.useState(false);

  const handleCheckedChange = (value: boolean | "indeterminate") => {
    if (value === true && celebrateOnCheck) {
      setShowRipple(true);
      setJustChecked(true);
      setTimeout(() => setShowRipple(false), 600);
      setTimeout(() => setJustChecked(false), 300);
    }
    onCheckedChange?.(value);
  };

  return (
    <label className={cn(
      "group flex items-start gap-3 cursor-pointer select-none",
      className
    )}>
      {/* Checkbox Container */}
      <div className="relative mt-0.5">
        {/* Ripple Effect */}
        {showRipple && (
          <span
            className="absolute inset-0 rounded-full bg-[var(--neuro-orange-primary)] animate-ripple"
            style={{ transform: "scale(0)" }}
          />
        )}

        {/* Checkbox */}
        <CheckboxPrimitive.Root
          ref={ref}
          checked={checked}
          onCheckedChange={handleCheckedChange}
          className={cn(
            "peer relative h-5 w-5 shrink-0 rounded-md border-2 transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neuro-orange-primary)]/40",
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Unchecked state
            "border-[var(--neuro-gray-400)] bg-transparent",
            // Checked state
            "data-[state=checked]:border-[var(--neuro-orange-primary)] data-[state=checked]:bg-[var(--neuro-orange-primary)]",
            // Hover
            "hover:border-[var(--neuro-orange-primary)]"
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator
            className={cn(
              "flex items-center justify-center text-white",
              justChecked && "animate-checkmark-pop"
            )}
          >
            <Check className="h-3.5 w-3.5 stroke-[3]" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
      </div>

      {/* Label & Description */}
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <span className={cn(
              "block text-sm font-medium text-[var(--neuro-text-primary)] transition-all duration-200",
              checked && "line-through text-[var(--neuro-text-tertiary)]"
            )}>
              {label}
            </span>
          )}
          {description && (
            <span className={cn(
              "block text-xs text-[var(--neuro-text-secondary)] mt-0.5 transition-all duration-200",
              checked && "line-through text-[var(--neuro-text-disabled)]"
            )}>
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
});

CheckboxTask.displayName = "CheckboxTask";

export { CheckboxTask };
