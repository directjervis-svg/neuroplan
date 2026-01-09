import DashboardLayoutNeuroPlan from "@/components/DashboardLayoutNeuroPlan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  ArrowRight, 
  Brain, 
  Briefcase, 
  GraduationCap, 
  Loader2, 
  Sparkles, 
  User,
  Calendar,
  Target,
  Lightbulb
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

/**
 * New Project Page
 * Multi-step wizard for creating a new project with AI-powered briefing
 * Follows Barkley principles: one primary action per view, clear progression
 */
export default function NewProject() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    briefing: "",
    category: "PERSONAL" as "PERSONAL" | "PROFESSIONAL" | "ACADEMIC",
    cycleDuration: "DAYS_3" as "DAYS_3" | "DAYS_7" | "DAYS_14",
  });

  const createProject = trpc.projects.create.useMutation({
    onSuccess: (data) => {
      toast.success("Projeto criado com sucesso!");
      navigate(`/dashboard/projects/${data.id}`);
    },
    onError: (error) => {
      toast.error("Erro ao criar projeto: " + error.message);
    },
  });

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("Por favor, dê um nome ao seu projeto");
      return;
    }
    createProject.mutate(formData);
  };

  const totalSteps = 3;

  return (
    <DashboardLayoutNeuroPlan>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        {/* Back Button */}
        <Link href="/dashboard/projects">
          <Button variant="ghost" className="mb-6 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Projetos
          </Button>
        </Link>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Passo {step} de {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#22C55E] transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <StepOne 
            formData={formData} 
            setFormData={setFormData} 
            onNext={() => setStep(2)} 
          />
        )}
        {step === 2 && (
          <StepTwo 
            formData={formData} 
            setFormData={setFormData} 
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepThree 
            formData={formData} 
            setFormData={setFormData}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
            isLoading={createProject.isPending}
          />
        )}
      </div>
    </DashboardLayoutNeuroPlan>
  );
}

function StepOne({
  formData,
  setFormData,
  onNext,
}: {
  formData: { title: string; briefing: string; category: string; cycleDuration: string };
  setFormData: (data: any) => void;
  onNext: () => void;
}) {
  const canProceed = formData.title.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[#22C55E]/10">
            <Target className="h-5 w-5 text-[#22C55E]" />
          </div>
          <CardTitle>Qual é o seu projeto?</CardTitle>
        </div>
        <CardDescription>
          Dê um nome claro e objetivo ao seu projeto. Isso ajuda a manter o foco.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Nome do Projeto</Label>
          <Input
            id="title"
            placeholder="Ex: Lançar meu portfólio online"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="text-lg"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Seja específico. "Criar site" é vago, "Lançar portfólio com 5 projetos" é melhor.
          </p>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={onNext} 
            disabled={!canProceed}
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
          >
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StepTwo({
  formData,
  setFormData,
  onNext,
  onBack,
}: {
  formData: { title: string; briefing: string; category: string; cycleDuration: string };
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[#FF8C42]/10">
            <Lightbulb className="h-5 w-5 text-[#FF8C42]" />
          </div>
          <CardTitle>Descreva seu objetivo</CardTitle>
        </div>
        <CardDescription>
          Escreva em linguagem natural o que você quer alcançar. A IA vai ajudar a estruturar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="briefing">Briefing do Projeto</Label>
          <Textarea
            id="briefing"
            placeholder="Descreva seu objetivo, contexto, recursos disponíveis, prazo desejado..."
            value={formData.briefing}
            onChange={(e) => setFormData({ ...formData, briefing: e.target.value })}
            className="min-h-[150px] text-base"
            maxLength={2000}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Quanto mais detalhes, melhor a decomposição em tarefas</span>
            <span>{formData.briefing.length}/2000</span>
          </div>
        </div>

        {/* AI Tip */}
        <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Dica da IA</p>
            <p className="text-sm text-muted-foreground">
              Inclua: o que você quer entregar, para quem, até quando, e quais recursos você tem disponíveis.
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button 
            onClick={onNext}
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
          >
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StepThree({
  formData,
  setFormData,
  onBack,
  onSubmit,
  isLoading,
}: {
  formData: { title: string; briefing: string; category: string; cycleDuration: string };
  setFormData: (data: any) => void;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[#22C55E]/10">
            <Calendar className="h-5 w-5 text-[#22C55E]" />
          </div>
          <CardTitle>Configure seu ciclo</CardTitle>
        </div>
        <CardDescription>
          Escolha a categoria e duração do ciclo. Ciclos curtos são melhores para TDAH.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Category Selection */}
        <div className="space-y-4">
          <Label>Categoria do Projeto</Label>
          <RadioGroup
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
            className="grid grid-cols-3 gap-4"
          >
            <CategoryOption
              value="PERSONAL"
              icon={<User className="h-5 w-5" />}
              label="Pessoal"
              description="Projetos de vida, hobbies"
              selected={formData.category === "PERSONAL"}
            />
            <CategoryOption
              value="PROFESSIONAL"
              icon={<Briefcase className="h-5 w-5" />}
              label="Profissional"
              description="Trabalho, carreira"
              selected={formData.category === "PROFESSIONAL"}
            />
            <CategoryOption
              value="ACADEMIC"
              icon={<GraduationCap className="h-5 w-5" />}
              label="Acadêmico"
              description="Estudos, pesquisa"
              selected={formData.category === "ACADEMIC"}
            />
          </RadioGroup>
        </div>

        {/* Cycle Duration Selection */}
        <div className="space-y-4">
          <Label>Duração do Ciclo</Label>
          <RadioGroup
            value={formData.cycleDuration}
            onValueChange={(value) => setFormData({ ...formData, cycleDuration: value })}
            className="space-y-3"
          >
            <CycleDurationOption
              value="DAYS_3"
              label="3 dias"
              tasks="9 tarefas"
              description="Recomendado para TDAH. Horizonte curto, resultados rápidos."
              selected={formData.cycleDuration === "DAYS_3"}
              recommended
            />
            <CycleDurationOption
              value="DAYS_7"
              label="7 dias"
              tasks="21 tarefas"
              description="Para projetos de média complexidade."
              selected={formData.cycleDuration === "DAYS_7"}
            />
            <CycleDurationOption
              value="DAYS_14"
              label="14 dias"
              tasks="42 tarefas"
              description="Para projetos maiores com muitas dependências."
              selected={formData.cycleDuration === "DAYS_14"}
            />
          </RadioGroup>
        </div>

        {/* Barkley Tip */}
        <div className="bg-gradient-to-r from-[#22C55E]/5 to-[#FF8C42]/5 rounded-lg p-4 flex items-start gap-3 border border-[#22C55E]/20">
          <Brain className="h-5 w-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Baseado em Barkley</p>
            <p className="text-sm text-muted-foreground">
              A miopia temporal do TDAH dificulta ver consequências futuras. 
              Ciclos de 3 dias mantêm o objetivo dentro do horizonte perceptível.
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} disabled={isLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button 
            onClick={onSubmit}
            disabled={isLoading}
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                Criar Projeto
                <Sparkles className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryOption({
  value,
  icon,
  label,
  description,
  selected,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  selected: boolean;
}) {
  return (
    <label
      className={`relative flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
        selected
          ? "border-[#22C55E] bg-[#22C55E]/5"
          : "border-border hover:border-[#22C55E]/30"
      }`}
    >
      <RadioGroupItem value={value} className="sr-only" />
      <div className={`mb-2 ${selected ? "text-[#22C55E]" : "text-muted-foreground"}`}>
        {icon}
      </div>
      <span className={`text-sm font-medium ${selected ? "text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
      <span className="text-xs text-muted-foreground text-center mt-1">{description}</span>
    </label>
  );
}

function CycleDurationOption({
  value,
  label,
  tasks,
  description,
  selected,
  recommended,
}: {
  value: string;
  label: string;
  tasks: string;
  description: string;
  selected: boolean;
  recommended?: boolean;
}) {
  return (
    <label
      className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
        selected
          ? "border-[#22C55E] bg-[#22C55E]/5"
          : "border-border hover:border-[#22C55E]/30"
      }`}
    >
      <RadioGroupItem value={value} className="sr-only" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`font-medium ${selected ? "text-foreground" : "text-muted-foreground"}`}>
            {label}
          </span>
          <span className="text-xs text-muted-foreground">({tasks})</span>
          {recommended && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] font-medium">
              Recomendado
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          selected ? "border-[#22C55E] bg-[#22C55E]" : "border-muted-foreground/30"
        }`}
      >
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </label>
  );
}
