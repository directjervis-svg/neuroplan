import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Brain, HelpCircle, Info, Lightbulb } from "lucide-react";

/**
 * NeuroTooltip - Tooltips explicativos para elementos neuroadaptativos
 * 
 * Explica ao usuário POR QUE cada funcionalidade foi desenhada de determinada forma,
 * baseado nos princípios de Russell Barkley.
 */

interface NeuroTooltipProps {
  children: React.ReactNode;
  type: "externalization" | "temporal" | "friction" | "abc" | "timer" | "whereILeftOff" | "custom";
  customTitle?: string;
  customDescription?: string;
  side?: "top" | "right" | "bottom" | "left";
}

const TOOLTIP_CONTENT: Record<string, { title: string; description: string; icon: React.ElementType }> = {
  externalization: {
    title: "Externalização",
    description: "TDAH afeta a memória de trabalho. Por isso, externalizamos tudo visualmente para você não precisar lembrar.",
    icon: Brain,
  },
  temporal: {
    title: "Proximidade Temporal",
    description: "Ciclos curtos de 3 dias garantem resultados visíveis rapidamente, mantendo a motivação alta.",
    icon: Lightbulb,
  },
  friction: {
    title: "Redução de Atrito",
    description: "Menos cliques = menos barreiras. Cada elemento foi otimizado para ação imediata.",
    icon: Info,
  },
  abc: {
    title: "Sistema A-B-C",
    description: "A = Mínimo aceitável (~30min), B = Ideal (~45min), C = Excepcional (~30min). Reduz paralisia de decisão.",
    icon: HelpCircle,
  },
  timer: {
    title: "Timer Progressivo",
    description: "Mostra tempo investido ao invés de countdown. Reduz ansiedade e foca no progresso, não na pressão.",
    icon: Lightbulb,
  },
  whereILeftOff: {
    title: "Onde Parei",
    description: "Registro automático do contexto. Compensa déficits de memória de trabalho ao retornar a uma tarefa.",
    icon: Brain,
  },
  custom: {
    title: "",
    description: "",
    icon: Info,
  },
};

export function NeuroTooltip({ 
  children, 
  type, 
  customTitle, 
  customDescription,
  side = "top" 
}: NeuroTooltipProps) {
  const content = TOOLTIP_CONTENT[type];
  const title = customTitle || content.title;
  const description = customDescription || content.description;
  const Icon = content.icon;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="max-w-xs p-4 bg-gray-900 border-gray-700"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div>
              <p className="font-medium text-white text-sm mb-1">{title}</p>
              <p className="text-gray-400 text-xs leading-relaxed">{description}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * NeuroInfoBadge - Badge pequeno com "?" que mostra tooltip ao hover
 */
interface NeuroInfoBadgeProps {
  type: NeuroTooltipProps["type"];
  customTitle?: string;
  customDescription?: string;
  className?: string;
}

export function NeuroInfoBadge({ type, customTitle, customDescription, className = "" }: NeuroInfoBadgeProps) {
  return (
    <NeuroTooltip type={type} customTitle={customTitle} customDescription={customDescription}>
      <button 
        className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors ${className}`}
        type="button"
      >
        <HelpCircle className="w-3 h-3 text-white/50" />
      </button>
    </NeuroTooltip>
  );
}

export default NeuroTooltip;
