import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { 
  ArrowRight, 
  Brain, 
  CheckCircle2, 
  Flame, 
  Lightbulb, 
  Loader2, 
  Rocket, 
  Target, 
  Timer,
  Shield,
  Sparkles
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Bem-vindo ao NeuroExecução!",
    subtitle: "Vamos transformar seu caos mental em clareza.",
    icon: Brain,
    requiresConsent: true,
  },
  {
    id: "create-project",
    title: "Qual projeto está travado na sua mente?",
    subtitle: "Descreva-o em poucas palavras. Nossa IA vai transformá-lo em um plano de 3 dias.",
    icon: Target,
  },
  {
    id: "tools",
    title: "Suas duas maiores aliadas contra a procrastinação.",
    icon: '🛠️',
  },
  {
    id: "gamification",
    title: "Cultive Seu Foco, Colha Resultados.",
    icon: '🌱',
  },
  {
    id: "complete",
    title: "Tudo Pronto para Executar!",
    subtitle: "Sua jornada de execução começa agora!",
    icon: Rocket,
  },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [consentGiven, setConsentGiven] = useState(false);

  const goToNextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Progress value={(currentStep + 1) * (100 / ONBOARDING_STEPS.length)} className="w-full max-w-md mb-8" />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-green-100 text-green-600`}>
                  <currentStepData.icon className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
              <p className="text-gray-600 mb-6">{currentStepData.subtitle}</p>

              {currentStepData.id === 'welcome' && (
                <div className="text-left space-y-4 mt-6 border-t pt-6">
                    <div className="flex items-start space-x-3">
                        <Checkbox id="consent-checkbox" checked={consentGiven} onCheckedChange={() => setConsentGiven(!consentGiven)} />
                        <label htmlFor="consent-checkbox" className="text-sm text-gray-600">
                            Eu li e concordo com os <a href="/terms" target="_blank" className="underline">Termos de Serviço</a> e a <a href="/privacy" target="_blank" className="underline">Política de Privacidade</a>.
                        </label>
                    </div>
                </div>
              )}

              {currentStepData.id === 'create-project' && (
                  <textarea className="w-full p-2 border rounded" placeholder="Ex: Lançar meu site de fotografia..."></textarea>
              )}

              <Button onClick={goToNextStep} disabled={currentStepData.requiresConsent && !consentGiven} className="w-full mt-6 bg-gray-900 hover:bg-gray-800 text-white">
                {currentStep === ONBOARDING_STEPS.length - 1 ? 'Ir para Meu Dashboard' : 'Continuar'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
