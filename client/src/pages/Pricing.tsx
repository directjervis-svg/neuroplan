import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  Brain, 
  Check, 
  Crown, 
  Loader2,
  Sparkles, 
  Star, 
  Zap 
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

/**
 * Pricing Page
 * Shows subscription plans with Stripe integration
 * Follows Barkley: Simple choices, clear value proposition
 */
export default function Pricing() {
  const { isAuthenticated } = useAuth();

  const createCheckout = trpc.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      toast.info("Redirecionando para o checkout...");
      window.open(data.url, "_blank");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar checkout");
    },
  });

  const handleSelectPlan = (planId: string) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    
    if (planId === "free") {
      window.location.href = "/dashboard";
      return;
    }

    if (planId === "team") {
      toast.info("Entre em contato conosco para o plano Equipe.");
      return;
    }

    createCheckout.mutate({ planId: planId.toUpperCase() as "PRO" | "TEAM" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2">
              <Brain className="h-7 w-7 text-[#22C55E]" />
              <span className="text-xl font-bold text-foreground">NeuroExecução</span>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comece gratuitamente e evolua conforme suas necessidades. 
            Todos os planos incluem acesso às funcionalidades neuroadaptadas.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <PlanCard
            name="Gratuito"
            price="R$ 0"
            period="/mês"
            description="Perfeito para começar"
            features={[
              "1 projeto ativo",
              "Timer de foco progressivo",
              "Quick Ideas ilimitadas",
              "Registro 'Onde Parei'",
              "Sistema 3+1 de tarefas",
            ]}
            limitations={[
              "Sem IA para decomposição",
              "Sem relatórios avançados",
            ]}
            buttonText="Começar Grátis"
            onSelect={() => handleSelectPlan("free")}
            isAuthenticated={isAuthenticated}
          />

          {/* Pro Plan */}
          <PlanCard
            name="Pro"
            price="R$ 29"
            period="/mês"
            description="Para quem quer mais produtividade"
            features={[
              "Projetos ilimitados",
              "IA para decomposição de tarefas",
              "Coach Socrático com IA",
              "Entregáveis A-B-C",
              "Relatórios de progresso",
              "Exportação de dados",
              "Suporte prioritário",
            ]}
            buttonText="Assinar Pro"
            onSelect={() => handleSelectPlan("pro")}
            isPopular
            isAuthenticated={isAuthenticated}
          />

          {/* Team Plan */}
          <PlanCard
            name="Equipe"
            price="R$ 79"
            period="/mês"
            description="Para times e empresas"
            features={[
              "Tudo do Pro",
              "Até 10 membros",
              "Projetos compartilhados",
              "Dashboard de equipe",
              "Integrações (Slack, Teams)",
              "API de acesso",
              "Onboarding dedicado",
            ]}
            buttonText="Falar com Vendas"
            onSelect={() => handleSelectPlan("team")}
            isAuthenticated={isAuthenticated}
          />
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Perguntas Frequentes
          </h2>
          <div className="space-y-6">
            <FAQItem
              question="Posso cancelar a qualquer momento?"
              answer="Sim! Você pode cancelar sua assinatura a qualquer momento. Seu acesso continua até o fim do período pago."
            />
            <FAQItem
              question="Os dados são seguros?"
              answer="Absolutamente. Seguimos a LGPD e usamos criptografia de ponta a ponta. Seus dados nunca são vendidos ou compartilhados."
            />
            <FAQItem
              question="Funciona para qualquer tipo de TDAH?"
              answer="O NeuroExecução foi projetado com base nos princípios de Russell Barkley, que se aplicam a todos os subtipos de TDAH. As funcionalidades são adaptáveis às suas necessidades."
            />
            <FAQItem
              question="Preciso de diagnóstico para usar?"
              answer="Não! O NeuroExecução é uma ferramenta de produtividade que beneficia qualquer pessoa que queira executar projetos com mais clareza, com ou sem diagnóstico."
            />
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">Pagamento seguro via</p>
          <div className="flex items-center justify-center gap-8 opacity-60">
            <span className="text-lg font-semibold">Stripe</span>
            <span className="text-lg font-semibold">PIX</span>
            <span className="text-lg font-semibold">Cartão</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 NeuroExecução. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

function PlanCard({
  name,
  price,
  period,
  description,
  features,
  limitations,
  buttonText,
  onSelect,
  isPopular,
  isAuthenticated,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limitations?: string[];
  buttonText: string;
  onSelect: () => void;
  isPopular?: boolean;
  isAuthenticated: boolean;
}) {
  return (
    <Card className={`relative ${isPopular ? "border-[#22C55E] shadow-lg shadow-[#22C55E]/10" : ""}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-[#22C55E] text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
            <Star className="h-3 w-3" />
            Mais Popular
          </span>
        </div>
      )}
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold text-foreground">{price}</span>
          <span className="text-muted-foreground">{period}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button
          onClick={onSelect}
          className={`w-full ${
            isPopular
              ? "bg-[#22C55E] hover:bg-[#16A34A] text-white"
              : "bg-foreground text-background hover:bg-foreground/90"
          }`}
        >
          {buttonText}
        </Button>

        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
          {limitations?.map((limitation, index) => (
            <div key={index} className="flex items-start gap-2 opacity-50">
              <span className="h-5 w-5 flex items-center justify-center text-muted-foreground flex-shrink-0">
                —
              </span>
              <span className="text-sm text-muted-foreground">{limitation}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-border pb-6">
      <h3 className="font-medium text-foreground mb-2">{question}</h3>
      <p className="text-sm text-muted-foreground">{answer}</p>
    </div>
  );
}
