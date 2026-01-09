import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Map,
  Rocket,
  BarChart3,
  Flag,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  BookOpen,
  Target,
  Users,
  Calendar,
  Shield,
  DollarSign,
  MessageSquare,
  TrendingUp,
  FileCheck,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 5 Fases de Gestão de Projetos (PMBOK adaptado para TDAH)
export const PROJECT_PHASES = [
  {
    id: "initiation",
    number: 1,
    title: "Iniciação",
    subtitle: "Definir o porquê e o quê",
    icon: Lightbulb,
    color: "#22C55E", // Green
    bgColor: "#ECFDF5",
    description: "Defina claramente o propósito do projeto, identifique stakeholders e valide a viabilidade inicial.",
    deliverables: [
      { id: "vision", label: "Visão do Projeto", description: "O que você quer alcançar?" },
      { id: "stakeholders", label: "Stakeholders", description: "Quem está envolvido ou impactado?" },
      { id: "viability", label: "Viabilidade", description: "É possível fazer isso agora?" },
    ],
    insights: [
      {
        icon: Target,
        title: "Foco no Resultado",
        content: "Projetos com visão clara têm 2.5x mais chances de sucesso. Defina o 'porquê' antes do 'como'.",
      },
      {
        icon: Users,
        title: "Mapeie Dependências",
        content: "Identifique quem pode ajudar ou atrapalhar. Comunicação precoce evita surpresas.",
      },
    ],
    questions: [
      "Por que este projeto é importante para mim agora?",
      "O que muda na minha vida quando ele estiver pronto?",
      "Tenho os recursos mínimos para começar?",
    ],
  },
  {
    id: "planning",
    number: 2,
    title: "Planejamento",
    subtitle: "Definir o como e quando",
    icon: Map,
    color: "#F59E0B", // Amber
    bgColor: "#FFFBEB",
    description: "Crie um roadmap realista com cronograma, recursos necessários e identificação de riscos.",
    deliverables: [
      { id: "timeline", label: "Cronograma", description: "Quando cada etapa acontece?" },
      { id: "resources", label: "Recursos", description: "O que você precisa?" },
      { id: "risks", label: "Riscos", description: "O que pode dar errado?" },
    ],
    insights: [
      {
        icon: Calendar,
        title: "Ciclos Curtos",
        content: "Divida em ciclos de 3-7 dias. Cérebros TDAH funcionam melhor com deadlines próximos.",
      },
      {
        icon: Shield,
        title: "Buffer de Segurança",
        content: "Adicione 20-30% de tempo extra. Imprevistos acontecem, e isso não é falha.",
      },
    ],
    questions: [
      "Qual é o prazo realista para cada entrega?",
      "Quais ferramentas ou pessoas preciso?",
      "O que pode me fazer desistir no meio?",
    ],
  },
  {
    id: "execution",
    number: 3,
    title: "Execução",
    subtitle: "Fazer acontecer",
    icon: Rocket,
    color: "#8B5CF6", // Purple
    bgColor: "#F3E8FF",
    description: "Implemente as tarefas planejadas, coordene esforços e mantenha comunicação constante.",
    deliverables: [
      { id: "tasks", label: "Tarefas Diárias", description: "3+1 tarefas por dia" },
      { id: "coordination", label: "Coordenação", description: "Alinhamento com envolvidos" },
      { id: "communication", label: "Comunicação", description: "Atualizações regulares" },
    ],
    insights: [
      {
        icon: Clock,
        title: "Timer Progressivo",
        content: "Use o timer count-up. Ver o tempo investido motiva mais que ver o tempo acabando.",
      },
      {
        icon: MessageSquare,
        title: "Externalize Tudo",
        content: "Não confie na memória. Anote, grave, fotografe. Sua memória de trabalho agradece.",
      },
    ],
    questions: [
      "Quais são as 3 tarefas mais importantes de hoje?",
      "Preciso comunicar algo a alguém?",
      "Estou progredindo ou girando em círculos?",
    ],
  },
  {
    id: "monitoring",
    number: 4,
    title: "Monitoramento",
    subtitle: "Medir e ajustar",
    icon: BarChart3,
    color: "#3B82F6", // Blue (exception for monitoring)
    bgColor: "#EFF6FF",
    description: "Acompanhe o progresso, meça resultados e faça ajustes necessários no plano.",
    deliverables: [
      { id: "metrics", label: "Métricas", description: "Como medir progresso?" },
      { id: "adjustments", label: "Ajustes", description: "O que precisa mudar?" },
      { id: "blockers", label: "Bloqueios", description: "O que está travando?" },
    ],
    insights: [
      {
        icon: TrendingUp,
        title: "Progresso Visual",
        content: "Gráficos e barras de progresso ativam o sistema de recompensa. Veja seu avanço.",
      },
      {
        icon: AlertCircle,
        title: "Pivote Rápido",
        content: "Se algo não funciona por 3 dias, mude a abordagem. Persistência ≠ teimosia.",
      },
    ],
    questions: [
      "Estou no caminho certo para o prazo?",
      "O que funcionou e o que não funcionou?",
      "Preciso pedir ajuda em algo?",
    ],
  },
  {
    id: "closure",
    number: 5,
    title: "Encerramento",
    subtitle: "Celebrar e aprender",
    icon: Flag,
    color: "#DC2626", // Red
    bgColor: "#FEF2F2",
    description: "Documente aprendizados, avalie resultados e celebre as conquistas.",
    deliverables: [
      { id: "documentation", label: "Documentação", description: "O que aprendeu?" },
      { id: "evaluation", label: "Avaliação", description: "Atingiu os objetivos?" },
      { id: "celebration", label: "Celebração", description: "Como vai comemorar?" },
    ],
    insights: [
      {
        icon: Award,
        title: "Celebre Sempre",
        content: "Cérebros TDAH precisam de recompensas. Não pule a celebração, por menor que seja.",
      },
      {
        icon: FileCheck,
        title: "Retrospectiva",
        content: "Anote o que funcionou para usar no próximo projeto. Crie seu próprio playbook.",
      },
    ],
    questions: [
      "O que eu faria diferente?",
      "Quem me ajudou e preciso agradecer?",
      "Qual será minha recompensa?",
    ],
  },
];

interface ProjectPhasesProps {
  currentPhase?: string;
  completedPhases?: string[];
  onPhaseSelect?: (phaseId: string) => void;
  projectData?: {
    [phaseId: string]: {
      [deliverableId: string]: string;
    };
  };
  onDeliverableChange?: (phaseId: string, deliverableId: string, value: string) => void;
  readOnly?: boolean;
}

export function ProjectPhases({
  currentPhase = "initiation",
  completedPhases = [],
  onPhaseSelect,
  projectData = {},
  onDeliverableChange,
  readOnly = false,
}: ProjectPhasesProps) {
  const [expandedPhase, setExpandedPhase] = useState<string>(currentPhase);

  const getPhaseStatus = (phaseId: string) => {
    if (completedPhases.includes(phaseId)) return "completed";
    if (phaseId === currentPhase) return "in-progress";
    return "pending";
  };

  const calculatePhaseProgress = (phaseId: string) => {
    const phase = PROJECT_PHASES.find(p => p.id === phaseId);
    if (!phase) return 0;
    
    const phaseData = projectData[phaseId] || {};
    const filledDeliverables = phase.deliverables.filter(
      d => phaseData[d.id] && phaseData[d.id].trim().length > 0
    ).length;
    
    return Math.round((filledDeliverables / phase.deliverables.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Phase Navigation */}
      <div className="flex justify-center gap-2 flex-wrap">
        {PROJECT_PHASES.map((phase, index) => {
          const status = getPhaseStatus(phase.id);
          const Icon = phase.icon;
          
          return (
            <button
              key={phase.id}
              onClick={() => {
                setExpandedPhase(phase.id);
                onPhaseSelect?.(phase.id);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                "border-2 font-medium text-sm",
                expandedPhase === phase.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : status === "completed"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50"
              )}
            >
              {status === "completed" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{phase.title}</span>
              <span className="sm:hidden">{phase.number}</span>
            </button>
          );
        })}
      </div>

      {/* Phase Content */}
      <AnimatePresence mode="wait">
        {PROJECT_PHASES.map(phase => {
          if (phase.id !== expandedPhase) return null;
          
          const status = getPhaseStatus(phase.id);
          const progress = calculatePhaseProgress(phase.id);
          const Icon = phase.icon;
          
          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                {/* Phase Header */}
                <div
                  className="p-6"
                  style={{ backgroundColor: phase.bgColor }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: phase.color }}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded"
                            style={{ backgroundColor: phase.color, color: "white" }}
                          >
                            FASE {phase.number}
                          </span>
                          {status === "completed" && (
                            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded">
                              Concluída
                            </span>
                          )}
                          {status === "in-progress" && (
                            <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                              Em Progresso
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mt-1">
                          {phase.title}
                        </h2>
                        <p className="text-gray-600">{phase.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold" style={{ color: phase.color }}>
                        {progress}%
                      </div>
                      <div className="text-sm text-gray-500">completo</div>
                    </div>
                  </div>
                  
                  <Progress value={progress} className="mt-4 h-2" />
                  
                  <p className="mt-4 text-gray-700">{phase.description}</p>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Deliverables */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <FileCheck className="h-5 w-5" style={{ color: phase.color }} />
                      Entregas desta Fase
                    </h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      {phase.deliverables.map(deliverable => {
                        const value = projectData[phase.id]?.[deliverable.id] || "";
                        const isFilled = value.trim().length > 0;
                        
                        return (
                          <div
                            key={deliverable.id}
                            className={cn(
                              "p-4 rounded-lg border-2 transition-all",
                              isFilled
                                ? "border-green-500 bg-green-50"
                                : "border-border bg-card"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {isFilled ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                              )}
                              <span className="font-medium">{deliverable.label}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {deliverable.description}
                            </p>
                            {!readOnly && (
                              <textarea
                                value={value}
                                onChange={(e) => onDeliverableChange?.(phase.id, deliverable.id, e.target.value)}
                                placeholder="Escreva aqui..."
                                className="w-full p-2 text-sm border rounded-md resize-none h-20 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              />
                            )}
                            {readOnly && value && (
                              <p className="text-sm bg-white p-2 rounded border">
                                {value}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Insights */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" style={{ color: phase.color }} />
                      Insights de Aprendizado
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {phase.insights.map((insight, index) => {
                        const InsightIcon = insight.icon;
                        return (
                          <div
                            key={index}
                            className="p-4 rounded-lg bg-muted/50 border border-border"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: phase.bgColor }}
                              >
                                <InsightIcon className="h-4 w-4" style={{ color: phase.color }} />
                              </div>
                              <h4 className="font-semibold">{insight.title}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {insight.content}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reflection Questions */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" style={{ color: phase.color }} />
                      Perguntas para Reflexão
                    </h3>
                    <div className="space-y-2">
                      {phase.questions.map((question, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                        >
                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <p className="text-sm">{question}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default ProjectPhases;
