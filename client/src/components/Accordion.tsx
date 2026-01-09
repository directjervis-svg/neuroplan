import { useState, ReactNode } from "react";
import { ChevronDown, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  id: string;
  title: string;
  subtitle?: string;
  duration?: string;
  status?: "pending" | "in-progress" | "completed";
  children: ReactNode;
  defaultOpen?: boolean;
  phaseNumber?: number;
}

interface AccordionProps {
  items: AccordionItemProps[];
  allowMultiple?: boolean;
  className?: string;
}

/**
 * Componente de Accordion dinâmico seguindo o padrão de design neuroadaptado
 * - Headers com fundo escuro e texto claro
 * - Estado ativo com cor de destaque (laranja)
 * - Animações suaves de expansão/colapso
 * - Indicadores de fase e status
 */
export function Accordion({ items, allowMultiple = false, className }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(items.filter(item => item.defaultOpen).map(item => item.id))
  );

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.id}
          {...item}
          isOpen={openItems.has(item.id)}
          onToggle={() => toggleItem(item.id)}
          index={index}
        />
      ))}
    </div>
  );
}

interface AccordionItemInternalProps extends AccordionItemProps {
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function AccordionItem({
  id,
  title,
  subtitle,
  duration,
  status = "pending",
  children,
  isOpen,
  onToggle,
  phaseNumber,
  index,
}: AccordionItemInternalProps) {
  const statusColors = {
    pending: "bg-muted",
    "in-progress": "bg-amber-500",
    completed: "bg-green-500",
  };

  const statusIcons = {
    pending: null,
    "in-progress": <Clock className="h-4 w-4" />,
    completed: <CheckCircle2 className="h-4 w-4" />,
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full px-5 py-4 flex items-center justify-between transition-all duration-300",
          isOpen
            ? "bg-primary text-primary-foreground"
            : "bg-card hover:bg-muted text-card-foreground"
        )}
      >
        <div className="flex items-center gap-4">
          {/* Phase Indicator */}
          {phaseNumber !== undefined && (
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                status === "completed"
                  ? "bg-green-500 text-white"
                  : isOpen
                  ? "bg-white/20 text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {status === "completed" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                phaseNumber
              )}
            </div>
          )}

          <div className="text-left">
            <h3 className="font-semibold text-base">{title}</h3>
            {subtitle && (
              <p className={cn(
                "text-sm mt-0.5",
                isOpen ? "text-white/70" : "text-muted-foreground"
              )}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Duration */}
          {duration && (
            <span className={cn(
              "text-sm flex items-center gap-1.5",
              isOpen ? "text-white/80" : "text-muted-foreground"
            )}>
              <Clock className="h-4 w-4" />
              {duration}
            </span>
          )}

          {/* Status Badge */}
          {status !== "pending" && (
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                status === "completed" && "bg-green-500/20 text-green-500",
                status === "in-progress" && "bg-amber-500/20 text-amber-500"
              )}
            >
              {statusIcons[status]}
              {status === "completed" ? "Concluído" : "Em Progresso"}
            </span>
          )}

          {/* Chevron */}
          <ChevronDown
            className={cn(
              "h-5 w-5 transition-transform duration-300",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-5 bg-card border-t border-border">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Componente de indicadores de fase para navegação rápida
 */
interface PhaseIndicatorsProps {
  phases: Array<{
    id: string;
    label: string;
    status: "pending" | "in-progress" | "completed";
  }>;
  onPhaseClick?: (id: string) => void;
  currentPhase?: string;
}

export function PhaseIndicators({ phases, onPhaseClick, currentPhase }: PhaseIndicatorsProps) {
  return (
    <div className="flex justify-center gap-2 flex-wrap mb-6">
      {phases.map((phase, index) => (
        <button
          key={phase.id}
          onClick={() => onPhaseClick?.(phase.id)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
            "hover:scale-110 cursor-pointer",
            phase.status === "completed" && "bg-green-500 text-white",
            phase.status === "in-progress" && "bg-primary text-primary-foreground",
            phase.status === "pending" && "bg-muted text-muted-foreground",
            currentPhase === phase.id && "ring-2 ring-primary ring-offset-2"
          )}
          title={phase.label}
        >
          {phase.status === "completed" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            index + 1
          )}
        </button>
      ))}
    </div>
  );
}

export default Accordion;
