import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
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
  X,
  Shield
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Onboarding steps configuration
const ONBOARDING_STEPS = [
  {
    id: "consent",
    field: "welcomeViewed",
    title: "Termos e Privacidade",
    subtitle: "Sua privacidade é nossa prioridade",
    description: "Antes de começar, precisamos do seu consentimento para processar seus dados de acordo com a LGPD (Lei Geral de Proteção de Dados).",
    icon: Shield,
    color: "#22C55E",
    tips: [
      "Seus dados são criptografados e armazenados com segurança",
      "Você pode solicitar exclusão a qualquer momento",
      "Não compartilhamos dados com terceiros sem consentimento",
    ],
    requiresConsent: true,
  },
  {
    id: "welcome",
    field: "welcomeViewed",
    title: "Bem-vindo ao NeuroExecução! 🧠",
    subtitle: "Seu parceiro de execução neuroadaptado",
    description: "O NeuroExecução foi desenvolvido com base em ciência cognitiva para ajudar pessoas com TDAH (e qualquer pessoa que luta com procrastinação) a transformar ideias em ações concretas.",
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
    description: "No NeuroExecução, você começa com um briefing simples. Nossa IA transforma seu texto em tarefas acionáveis, organizadas em ciclos de 3, 7 ou 14 dias.",
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

// Current consent version - update when terms change
const CONSENT_VERSION = "1.0.0";

export default function Onboarding() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [consentChecked, setConsentChecked] = useState(false);
  
  const { data: onboardingProgress, isLoading } = trpc.gamification.getOnboarding.useQuery();
  const updateOnboarding = trpc.gamification.updateOnboarding.useMutation();
  const skipOnboarding = trpc.gamification.skipOnboarding.useMutation();
  const saveConsent = trpc.user.saveConsent.useMutation();
  const utils = trpc.useUtils();

  // Check if user already completed onboarding
  useEffect(() => {
    if (onboardingProgress?.completedAt || onboardingProgress?.skippedAt) {
      navigate("/dashboard");
    }
  }, [onboardingProgress, navigate]);

  const handleNext = async () => {
    const step = ONBOARDING_STEPS[currentStep];
    
    // If this is the consent step, save consent first
    if (step.requiresConsent) {
      if (!consentChecked) {
        toast.error("Você precisa aceitar os termos para continuar.");
        return;
      }
      
      try {
        await saveConsent.mutateAsync({ 
          consentVersion: CONSENT_VERSION 
        });
        toast.success("Consentimento registrado com sucesso!");
      } catch (error) {
        toast.error("Erro ao salvar consentimento. Tente novamente.");
        return;
      }
    }
    
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
      toast.success("Onboarding completo! Bem-vindo ao NeuroExecução!");
      navigate("/dashboard");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    // Cannot skip if consent not given
    if (currentStep === 0 && !consentChecked) {
      toast.error("Você precisa aceitar os termos para usar o NeuroExecução.");
      return;
    }
    
    // Save consent if on first step
    if (currentStep === 0 && consentChecked) {
      await saveConsent.mutateAsync({ consentVersion: CONSENT_VERSION });
    }
    
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

  // Check if next button should be disabled
  const isNextDisabled = 
    updateOnboarding.isPending || 
    saveConsent.isPending ||
    (step.requiresConsent && !consentChecked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#22C55E]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF8C42]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Skip button - hidden on consent step unless consent is given */}
        {(currentStep > 0 || consentChecked) && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-12 right-0 text-slate-400 hover:text-white"
            onClick={handleSkip}
          >
            Pular Tour
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}

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

                {/* Consent checkbox - only on consent step */}
                {step.requiresConsent && (
                  <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="consent"
                        checked={consentChecked}
                        onCheckedChange={(checked) => setConsentChecked(checked === true)}
                        className="mt-1 border-slate-500 data-[state=checked]:bg-[#22C55E] data-[state=checked]:border-[#22C55E]"
                      />
                      <label 
                        htmlFor="consent" 
                        className="text-sm text-slate-300 leading-relaxed cursor-pointer"
                      >
                        Li e aceito a{" "}
                        <Link href="/privacy" className="text-[#22C55E] hover:underline" target="_blank">
                          Política de Privacidade
                        </Link>{" "}
                        e os{" "}
                        <Link href="/terms" className="text-[#22C55E] hover:underline" target="_blank">
                          Termos de Uso
                        </Link>
                        . Autorizo o tratamento dos meus dados pessoais conforme descrito nestes documentos, de acordo com a LGPD.
                      </label>
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div className="bg-slate-900/50 rounded-lg p-4 mb-8">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-3">
                    <Sparkles className="h-4 w-4" />
                    {step.requiresConsent ? "Seus direitos" : "Dicas importantes"}
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
                    className="bg-[#22C55E] hover:bg-[#16A34A] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isNextDisabled}
                  >
                    {(updateOnboarding.isPending || saveConsent.isPending) ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {currentStep === ONBOARDING_STEPS.length - 1 ? (
                      <>
                        Começar
                        <Rocket className="ml-2 h-4 w-4" />
                      </>
                    ) : step.requiresConsent ? (
                      <>
                        Aceitar e Continuar
                        <ArrowRight className="ml-2 h-4 w-4" />
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
              onClick={() => {
                // Only allow going back, not forward (unless consent given)
                if (index < currentStep || (currentStep === 0 && consentChecked)) {
                  setCurrentStep(index);
                }
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep 
                  ? "bg-[#22C55E] w-6" 
                  : index < currentStep 
                    ? "bg-[#22C55E]/50 cursor-pointer" 
                    : "bg-slate-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
