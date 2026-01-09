import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { 
  Brain, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Lightbulb, 
  ListTodo, 
  Quote, 
  Sparkles, 
  Target, 
  Timer, 
  Zap,
  ArrowRight,
  Play,
  Users,
  Star,
  Rocket
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

/**
 * NeuroPlan Landing Page
 * Design inspired by Starlink with Voyager hero image
 * Following Barkley principles: reduced cognitive load, clear CTAs, generous whitespace
 */
export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section with Voyager - Starlink Style */}
      <VoyagerHeroSection isAuthenticated={isAuthenticated} />
      
      {/* AI Partner Section */}
      <AIPartnerSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* How People Use Section */}
      <UseCasesSection />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* CTA Section */}
      <CTASection isAuthenticated={isAuthenticated} />
      
      {/* Footer with Disclaimer */}
      <Footer />
    </div>
  );
}

function VoyagerHeroSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background Image - Voyager */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/voyager-hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        
        {/* Animated particles/stars effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Header - Floating over hero */}
      <header className="relative z-20 w-full">
        <div className="container flex h-20 items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <Brain className="h-8 w-8 text-[#22C55E]" />
              <motion.div
                className="absolute -inset-1 bg-[#22C55E]/20 rounded-full blur-md"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">NeuroPlan</span>
          </motion.div>
          
          <motion.nav 
            className="hidden md:flex items-center gap-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <a href="#features" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Recursos
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Como Funciona
            </a>
            <Link href="/pricing" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Planos
            </Link>
          </motion.nav>
          
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-medium border-0">
                  Acessar Dashboard
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="bg-white/10 hover:bg-white/20 text-white font-medium border border-white/20 backdrop-blur-sm">
                  Entrar
                </Button>
              </a>
            )}
          </motion.div>
        </div>
      </header>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            {/* Mission Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
            >
              <Rocket className="h-4 w-4 text-[#22C55E]" />
              <span className="text-sm text-white/90">Missão: Transformar Ideias em Ação</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Execute
              <br />
              <span className="bg-gradient-to-r from-[#22C55E] via-[#4ADE80] to-[#86EFAC] bg-clip-text text-transparent">
                Qualquer Projeto
              </span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              Seu parceiro de execução neuroadaptado. Fundamentado em ciência cognitiva, 
              construído com IA para transformar ideias em ações concretas.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold px-10 py-7 text-lg rounded-full shadow-lg shadow-[#22C55E]/30 transition-all hover:shadow-xl hover:shadow-[#22C55E]/40 hover:scale-105">
                    Ir para o Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <a href={getLoginUrl()}>
                    <Button size="lg" className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold px-10 py-7 text-lg rounded-full shadow-lg shadow-[#22C55E]/30 transition-all hover:shadow-xl hover:shadow-[#22C55E]/40 hover:scale-105">
                      Começar Agora
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                  <a href="#features">
                    <Button size="lg" variant="outline" className="bg-transparent hover:bg-white/10 text-white font-semibold px-8 py-7 text-lg rounded-full border-white/30 hover:border-white/50">
                      <Play className="mr-2 h-5 w-5" />
                      Ver Como Funciona
                    </Button>
                  </a>
                </>
              )}
            </motion.div>
            
            {/* Trust indicators */}
            <motion.div 
              className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-white/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                <span>Baseado em Russell Barkley</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                <span>Design Neuroadaptado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                <span>Conformidade LGPD</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="relative z-10 pb-8 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.3 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function AIPartnerSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Seu Parceiro de Execução com IA
        </motion.h2>
        
        <div className="grid gap-16 max-w-6xl mx-auto">
          {/* Feature 1: Upload Briefing */}
          <FeatureRow
            icon={<FileText className="h-6 w-6" />}
            title="Descreva seu projeto"
            description="Escreva seu objetivo em linguagem natural. O NeuroPlan analisa, reformula em formato SMART e identifica automaticamente a categoria (pessoal, profissional ou acadêmico) para aplicar os frameworks mais adequados."
            imagePosition="right"
            imageBg="bg-gradient-to-br from-slate-900 to-slate-800"
            imageContent={
              <div className="p-6">
                <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700">
                  <div className="text-slate-400 text-xs mb-2">Notebook</div>
                  <div className="text-white text-2xl font-bold">Projeto MVP</div>
                  <div className="text-slate-500 text-sm mt-1">3 dias • 9 tarefas</div>
                </div>
              </div>
            }
          />
          
          {/* Feature 2: Instant Insights */}
          <FeatureRow
            icon={<Sparkles className="h-6 w-6" />}
            title="Insights instantâneos"
            description="Com seu briefing processado, o NeuroPlan decompõe automaticamente em tarefas acionáveis seguindo o sistema 3+1: máximo 3 ações por dia + 1 preparação para o próximo. Cada tarefa começa com um verbo no infinitivo."
            imagePosition="left"
            imageBg="bg-gradient-to-br from-slate-900 to-slate-800"
            imageContent={
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-white text-sm">
                  <span className="text-slate-400">+</span> Adicionar nota
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-700/50 rounded-lg px-3 py-2 text-white text-xs flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-[#22C55E]" /> Guia de estudo
                  </div>
                  <div className="bg-slate-700/50 rounded-lg px-3 py-2 text-white text-xs flex items-center gap-2">
                    <FileText className="h-3 w-3" /> Briefing doc
                  </div>
                  <div className="bg-slate-700/50 rounded-lg px-3 py-2 text-white text-xs flex items-center gap-2">
                    <ListTodo className="h-3 w-3" /> FAQ
                  </div>
                  <div className="bg-slate-700/50 rounded-lg px-3 py-2 text-white text-xs flex items-center gap-2">
                    <Clock className="h-3 w-3" /> Timeline
                  </div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 mt-2">
                  <div className="text-white text-sm font-medium">Plano de Execução</div>
                  <div className="text-slate-400 text-xs mt-1">Responda às perguntas em 2-3 sentenças...</div>
                </div>
              </div>
            }
          />
          
          {/* Feature 3: See the source */}
          <FeatureRow
            icon={<Quote className="h-6 w-6" />}
            title="Veja a origem, não apenas a resposta"
            description="Ganhe confiança em cada recomendação porque o NeuroPlan mostra claramente a base científica do seu trabalho, citando os princípios de Barkley aplicados em cada decisão de decomposição."
            imagePosition="right"
            imageBg="bg-gradient-to-br from-slate-900 to-slate-800"
            imageContent={
              <div className="p-6">
                <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700">
                  <div className="text-slate-400 text-xs mb-2">Notebook</div>
                  <div className="text-white text-2xl font-bold">Ciclo 3+1</div>
                  <div className="text-[#22C55E] text-sm mt-2">Baseado em Barkley</div>
                </div>
              </div>
            }
          />
          
          {/* Feature 4: Timer */}
          <FeatureRow
            icon={<Timer className="h-6 w-6" />}
            title="Execute com foco no tempo"
            description="Nosso timer progressivo mostra quanto você já investiu, ativando o senso de comprometimento. Diferente do countdown que gera ansiedade, o timer progressivo celebra seu progresso em tempo real."
            imagePosition="left"
            imageBg="bg-gradient-to-br from-[#FF8C42]/20 via-[#EC4899]/20 to-[#22C55E]/20"
            imageContent={
              <div className="p-6 flex flex-col items-center justify-center h-full">
                <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-700 text-center">
                  <div className="text-[#22C55E] text-xs uppercase tracking-wider mb-2">Criar Ciclo de Foco</div>
                  <div className="flex items-center justify-center gap-2">
                    <Play className="h-5 w-5 text-white" />
                    <span className="text-white font-medium">Timer Progressivo</span>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}

function FeatureRow({ 
  icon, 
  title, 
  description, 
  imagePosition, 
  imageBg,
  imageContent 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  imagePosition: "left" | "right";
  imageBg: string;
  imageContent: React.ReactNode;
}) {
  const textContent = (
    <motion.div 
      className="flex flex-col justify-center"
      initial={{ opacity: 0, x: imagePosition === "left" ? 20 : -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="text-[#22C55E]">{icon}</div>
        <h3 className="text-xl md:text-2xl font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-muted-foreground leading-relaxed max-w-md">
        {description}
      </p>
    </motion.div>
  );
  
  const imageBox = (
    <motion.div 
      className={`${imageBg} rounded-2xl h-64 md:h-80 flex items-center justify-center overflow-hidden`}
      initial={{ opacity: 0, x: imagePosition === "left" ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {imageContent}
    </motion.div>
  );
  
  return (
    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
      {imagePosition === "left" ? (
        <>
          <div className="order-2 md:order-1">{imageBox}</div>
          <div className="order-1 md:order-2">{textContent}</div>
        </>
      ) : (
        <>
          <div>{textContent}</div>
          <div>{imageBox}</div>
        </>
      )}
    </div>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Projetado para Mentes que Funcionam Diferente
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Cada funcionalidade foi validada contra os fundamentos de Russell Barkley 
            para compensar déficits de funções executivas.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Target className="h-8 w-8" />}
            title="Sistema 3+1"
            description="Máximo 3 tarefas de ação por dia + 1 preparação. Reduz paralisia por excesso de opções."
            color="#22C55E"
            delay={0}
          />
          <FeatureCard
            icon={<Clock className="h-8 w-8" />}
            title="Ciclos Curtos"
            description="Projetos em ciclos de 3 dias. A miopia temporal do TDAH exige horizontes próximos."
            color="#FF8C42"
            delay={0.1}
          />
          <FeatureCard
            icon={<Lightbulb className="h-8 w-8" />}
            title="Onde Parei"
            description="Registro diário de contexto. Compensa o déficit de memória de trabalho."
            color="#22C55E"
            delay={0.2}
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8" />}
            title="Quick Ideas"
            description="Capture pensamentos não-lineares sem perder o foco na tarefa atual."
            color="#FF8C42"
            delay={0.3}
          />
          <FeatureCard
            icon={<ListTodo className="h-8 w-8" />}
            title="Entregáveis A-B-C"
            description="Três níveis de entrega: mínimo, ideal, excepcional. Combate o perfeccionismo paralisante."
            color="#22C55E"
            delay={0.4}
          />
          <FeatureCard
            icon={<Brain className="h-8 w-8" />}
            title="Coach Socrático"
            description="IA que faz perguntas ao invés de dar respostas. Desenvolve auto-descoberta."
            color="#FF8C42"
            delay={0.5}
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  color,
  delay = 0
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="bg-card border-border/50 hover:border-border transition-all hover:shadow-lg">
        <CardContent className="p-6">
          <div className="mb-4" style={{ color }}>{icon}</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function UseCasesSection() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Como as Pessoas Usam o NeuroPlan
        </motion.h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <UseCaseCard
            icon={<FileText className="h-6 w-6" />}
            title="Projetos Pessoais"
            description="Organize mudanças de carreira, projetos de vida, metas de saúde. O NeuroPlan decompõe objetivos complexos em passos diários gerenciáveis."
            cta="Aprenda mais rápido."
            delay={0}
          />
          <UseCaseCard
            icon={<Target className="h-6 w-6" />}
            title="Organize seu Pensamento"
            description="Transforme ideias dispersas em planos estruturados. A IA cria um outline polido com pontos-chave e evidências de suporte."
            cta="Apresente com confiança."
            delay={0.1}
          />
          <UseCaseCard
            icon={<Lightbulb className="h-6 w-6" />}
            title="Inove com Clareza"
            description="Faça upload de pesquisas, análises de mercado e brainstorms. Identifique tendências, gere novas ideias e descubra oportunidades ocultas."
            cta="Desbloqueie seu potencial criativo."
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
}

function UseCaseCard({ 
  icon, 
  title, 
  description, 
  cta,
  delay = 0
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  delay?: number;
}) {
  return (
    <motion.div 
      className="text-center md:text-left"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-muted mb-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
      <p className="text-sm font-medium text-[#22C55E]">{cta}</p>
    </motion.div>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          O que as Pessoas Estão Dizendo
        </motion.h2>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <TestimonialCard
            quote="NeuroPlan mudou minha forma de trabalhar. Finalmente consigo terminar projetos."
            gradient="from-[#22C55E]/20 to-[#16A34A]/20"
            delay={0}
          />
          <TestimonialCard
            quote="Pode ser o próximo app essencial para produtividade com TDAH."
            gradient="from-[#FF8C42]/20 to-[#F97316]/20"
            delay={0.1}
          />
          <TestimonialCard
            quote="NeuroPlan é um vislumbre do futuro da execução de projetos."
            gradient="from-[#EC4899]/20 to-[#DB2777]/20"
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ 
  quote, 
  gradient,
  delay = 0
}: { 
  quote: string;
  gradient: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={`bg-gradient-to-br ${gradient} border-0`}>
        <CardContent className="p-8">
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-[#FF8C42] text-[#FF8C42]" />
            ))}
          </div>
          <blockquote className="text-lg font-medium text-foreground">
            "{quote}"
          </blockquote>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CTASection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="py-20">
      <div className="container">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Pronto para Transformar suas Ideias em Ação?
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Junte-se a milhares de pessoas que estão executando seus projetos 
            com mais clareza e menos ansiedade.
          </p>
          
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="lg" className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold px-8 py-6 text-lg rounded-full">
                Acessar Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold px-8 py-6 text-lg rounded-full">
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-6 w-6 text-[#22C55E]" />
              <span className="text-lg font-bold text-foreground">NeuroPlan</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Ferramenta de execução neuroadaptada para transformar ideias em ações.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Produto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Recursos</a></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Planos</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Roadmap</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Recursos</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Documentação</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Suporte</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Termos de Uso</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contato DPO</a></li>
            </ul>
          </div>
        </div>
        
        {/* ANVISA/LGPD Disclaimer - Required by Blueprint */}
        <div className="border-t border-border pt-8">
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Aviso Legal:</strong> O NeuroPlan é uma ferramenta de produtividade e organização de projetos. 
              Não se trata de dispositivo médico, não realiza diagnóstico, tratamento ou acompanhamento de condições de saúde. 
              Para questões relacionadas a TDAH ou outras condições, consulte um profissional de saúde qualificado. 
              Este produto está em conformidade com a Lei Geral de Proteção de Dados (LGPD). 
              Seus dados são tratados com segurança e você pode exercer seus direitos a qualquer momento.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 NeuroPlan. Todos os direitos reservados.</p>
            <p>Feito com ❤️ para mentes que funcionam diferente</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
