import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { 
  ArrowRight, 
  ArrowLeft,
  Brain, 
  CheckCircle2, 
  Flame, 
  Lightbulb, 
  Loader2, 
  Rocket, 
  Target, 
  Timer,
  Sparkles,
  X
} from "lucide-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Onboarding steps configuration
const ONBOARDING_STEPS = [
  {
    id: "welcome",
    field: "welcomeViewed",
    title: "Bem-vindo ao NeuroPlan! 🧠",
    subtitle: "Seu parceiro de execução neuroadaptado",
    description: "O NeuroPlan foi desenvolvido com base em ciência cognitiva para ajudar pessoas com TDAH (e qualquer pessoa que luta com procrastinação) a transformar ideias em ações concretas.",
    icon: Brain,
    color: "#22C55E",
    tips: [
      "Baseado nos estudos de Russell Barkley sobre TDAH",
      "Design sem azul (otimizado para percepção visual)",
      "Micro-recompensas para compensar déficit dopaminérgico",
    ],
  },
  {
    id: "projects",
    field: "firstProjectCreated",
    title: "Crie seu Primeiro Projeto",
    subtitle: "Transforme ideias em planos executáveis",
    description: "No NeuroPlan, você começa com um briefing simples. Nossa IA transforma seu texto em tarefas acionáveis, organizadas em ciclos de 3, 7 ou 14 dias.",
    icon: Target,
    color: "#FF8C42",
    tips: [
      "Máximo de 3 tarefas ACTION por dia + 1 priming",
      "Entregas A-B-C para combater perfeccionismo",
      "Ciclos curtos para manter momentum",
    ],
  },
  {
    id: "tasks",
    field: "firstTaskCompleted",
    title: "Complete Tarefas",
    subtitle: "Cada tarefa começa com um verbo de ação",
    description: "Nossas tarefas são decompostas em ações específicas e mensuráveis. Cada uma começa com um verbo imperativo para eliminar ambiguidade.",
    icon: CheckCircle2,
    color: "#22C55E",
    tips: [
      "Tarefas ACTION são as principais do dia",
      "Tarefas RETENTION preparam o dia seguinte",
      "Justifique mudanças em até 100 caracteres",
    ],
  },
  {
    id: "focus",
    field: "firstFocusSession",
    title: "Timer de Foco Progressivo",
    subtitle: "Veja o tempo investido, não o restante",
    description: "Nosso timer conta para cima (não para baixo). Isso reduz ansiedade e mostra seu progresso real. Você decide quando parar.",
    icon: Timer,
    color: "#FF8C42",
    tips: [
      "Timer progressivo reduz ansiedade",
      "Pausas são registradas automaticamente",
      "Ganhe XP por cada sessão de foco",
    ],
  },
  {
    id: "ideas",
    field: "firstIdeaCaptured",
    title: "Capture Ideias Rápidas",
    subtitle: "Não perca pensamentos tangenciais",
    description: "O TDAH traz pensamentos não-lineares. Em vez de perder essas ideias, capture-as rapidamente e converta em tarefas depois.",
    icon: Lightbulb,
    color: "#FBBF24",
    tips: [
      "Capture sem interromper seu foco",
      "Converta ideias em tarefas depois",
      "Organize por projeto ou deixe soltas",
    ],
  },
  {
    id: "gamification",
    field: "profileSetup",
    title: "Gamificação e Recompensas",
    subtitle: "Micro-recompensas para seu cérebro",
    description: "Ganhe XP, suba de nível e desbloqueie emblemas. A gamificação compensa o déficit dopaminérgico típico do TDAH.",
    icon: Flame,
    color: "#FF6B35",
    tips: [
      "Mantenha streaks diários para bônus",
      "Desbloqueie emblemas por conquistas",
      "Acompanhe seu progresso no perfil",
    ],
  },
  {
    id: "complete",
    field: "tourCompleted",
    title: "Pronto para Começar! 🚀",
    subtitle: "Sua jornada de execução começa agora",
    description: "Você completou o tour! Agora é hora de criar seu primeiro projeto e começar a transformar ideias em ações.",
    icon: Rocket,
    color: "#22C55E",
    tips: [
      "Comece com um projeto pequeno",
      "Use templates para acelerar",
      "Lembre-se: progresso > perfeição",
    ],
  },
];

export default function Onboarding() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  
  const { data: onboardingProgress, isLoading } = trpc.gamification.getOnboarding.useQuery();
  const updateOnboarding = trpc.gamification.updateOnboarding.useMutation();
  const skipOnboarding = trpc.gamification.skipOnboarding.useMutation();
  const utils = trpc.useUtils();

  // Check if user already completed onboarding
  useEffect(() => {
    if (onboardingProgress?.completedAt || onboardingProgress?.skippedAt) {
      navigate("/dashboard");
    }
  }, [onboardingProgress, navigate]);

  const handleNext = async () => {
    const step = ONBOARDING_STEPS[currentStep];
    
    // Update progress in database
    await updateOnboarding.mutateAsync({ 
      step: step.field as any 
    });
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      await updateOnboarding.mutateAsync({ step: "tourCompleted" });
      utils.gamification.getOnboarding.invalidate();
      toast.success("Onboarding completo! Bem-vindo ao NeuroPlan!");
      navigate("/dashboard");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await skipOnboarding.mutateAsync();
    utils.gamification.getOnboarding.invalidate();
    toast.info("Você pode acessar o tour a qualquer momento no menu de ajuda.");
    navigate("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  const step = ONBOARDING_STEPS[currentStep];
  const IconComponent = step.icon;
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#22C55E]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF8C42]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Skip button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute -top-12 right-0 text-slate-400 hover:text-white"
          onClick={handleSkip}
        >
          Pular Tour
          <X className="ml-2 h-4 w-4" />
        </Button>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Passo {currentStep + 1} de {ONBOARDING_STEPS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-700" />
        </div>

        {/* Main card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-8">
                {/* Icon */}
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: `${step.color}20` }}
                >
                  <IconComponent 
                    className="h-10 w-10"
                    style={{ color: step.color }}
                  />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-white text-center mb-2">
                  {step.title}
                </h1>
                <p className="text-lg text-slate-400 text-center mb-6">
                  {step.subtitle}
                </p>

                {/* Description */}
                <p className="text-slate-300 text-center mb-8 leading-relaxed">
                  {step.description}
                </p>

                {/* Tips */}
                <div className="bg-slate-900/50 rounded-lg p-4 mb-8">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-3">
                    <Sparkles className="h-4 w-4" />
                    Dicas importantes
                  </div>
                  <ul className="space-y-2">
                    {step.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-[#22C55E] mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="text-slate-400 hover:text-white"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
                    disabled={updateOnboarding.isPending}
                  >
                    {updateOnboarding.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {currentStep === ONBOARDING_STEPS.length - 1 ? (
                      <>
                        Começar
                        <Rocket className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Próximo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {ONBOARDING_STEPS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep 
                  ? "bg-[#22C55E] w-6" 
                  : index < currentStep 
                    ? "bg-[#22C55E]/50" 
                    : "bg-slate-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
