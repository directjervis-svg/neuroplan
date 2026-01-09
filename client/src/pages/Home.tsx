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
  Rocket,
  ChevronDown
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

/**
 * NeuroPlan Landing Page
 * Design inspired by Starlink - Hero with ONLY Voyager image, text below
 * Following Barkley principles: reduced cognitive load, clear CTAs, generous whitespace
 */
export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section - ONLY Voyager Image */}
      <VoyagerHeroSection />
      
      {/* Main Content Section - Text and CTAs */}
      <MainContentSection isAuthenticated={isAuthenticated} />
      
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

/**
 * Hero Section - ONLY the Voyager image, no text
 * Clean, immersive visual experience like Starlink
 */
function VoyagerHeroSection() {
  return (
    <section className="relative h-screen flex flex-col overflow-hidden">
      {/* Background Image - Voyager - Full screen */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/voyager-hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Subtle gradient at bottom for transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
        
        {/* Animated particles/stars effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(60)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.6 + 0.2,
              }}
              animate={{
                opacity: [0.2, 0.9, 0.2],
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

      {/* Minimal Header - Just logo */}
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
        </div>
      </header>

      {/* Scroll indicator at bottom */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2 cursor-pointer"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          onClick={() => document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="text-xs text-white/50 uppercase tracking-widest">Explorar</span>
          <ChevronDown className="h-6 w-6 text-white/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/**
 * Main Content Section - All text and CTAs below the hero image
 */
function MainContentSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section id="main-content" className="relative py-24 bg-gradient-to-b from-black via-gray-950 to-background">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          {/* Navigation */}
          <motion.nav 
            className="flex justify-center items-center gap-8 mb-16"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
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
          </motion.nav>

          {/* Mission Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
          >
            <Rocket className="h-4 w-4 text-[#22C55E]" />
            <span className="text-sm text-white/90">Missão: Transformar Ideias em Ação</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
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
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Seu parceiro de execução neuroadaptado. Fundamentado em ciência cognitiva, 
            construído com IA para transformar ideias em ações concretas.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
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
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
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
    </section>
  );
}

function AIPartnerSection() {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Seu Parceiro de Execução com IA
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transforme qualquer ideia em um plano estruturado e executável em minutos
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Feature List */}
          <div className="space-y-8">
            {[
              {
                icon: FileText,
                title: "Faça o upload do seu briefing",
                description: "Descreva seu projeto em linguagem natural. A IA reformula e estrutura automaticamente, extraindo objetivos claros e entregáveis definidos."
              },
              {
                icon: Sparkles,
                title: "Insights instantâneos",
                description: "Com seu briefing processado, o NeuroPlan gera tarefas acionáveis organizadas em ciclos 3+1, respeitando sua capacidade cognitiva."
              },
              {
                icon: Quote,
                title: "Veja a fonte, não apenas a resposta",
                description: "Cada tarefa gerada mantém conexão com seu briefing original. Entenda o 'porquê' de cada ação sugerida."
              },
              {
                icon: Timer,
                title: "Execute com foco progressivo",
                description: "Timer que mostra tempo investido (não restante), reduzindo ansiedade e celebrando cada minuto de progresso."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-[#22C55E]" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Visual Demo */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative bg-card rounded-2xl border shadow-2xl overflow-hidden">
              {/* Mock App Interface */}
              <div className="p-6 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-sm text-muted-foreground">NeuroPlan - Projeto Ativo</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-4 bg-[#22C55E]/10 rounded-xl border border-[#22C55E]/20">
                  <Target className="h-5 w-5 text-[#22C55E]" />
                  <div>
                    <p className="font-medium text-foreground">Projeto: Landing Page</p>
                    <p className="text-xs text-muted-foreground">Ciclo 2 de 3 • 4 tarefas restantes</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                    <span className="text-sm text-muted-foreground line-through">Definir estrutura de navegação</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#FF8C42]/10 rounded-lg border border-[#FF8C42]/20">
                    <Clock className="h-4 w-4 text-[#FF8C42]" />
                    <span className="text-sm text-foreground">Criar hero section com CTA</span>
                    <span className="ml-auto text-xs bg-[#FF8C42] text-white px-2 py-0.5 rounded">Em foco</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="h-4 w-4 rounded border-2 border-muted-foreground/30" />
                    <span className="text-sm text-muted-foreground">Implementar seção de features</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -z-10 -top-4 -right-4 w-72 h-72 bg-[#22C55E]/10 rounded-full blur-3xl" />
            <div className="absolute -z-10 -bottom-4 -left-4 w-72 h-72 bg-[#FF8C42]/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "Design Neuroadaptado",
      description: "Interface sem azul, com cores verde/vermelho/laranja otimizadas para TDAH. Tipografia clara e espaçamento generoso."
    },
    {
      icon: ListTodo,
      title: "Ciclos 3+1",
      description: "Projetos divididos em ciclos curtos: D0 para planejamento, D1-D3 para execução. Máximo 3 tarefas por dia."
    },
    {
      icon: Lightbulb,
      title: "Quick Ideas",
      description: "Capture pensamentos não-lineares instantaneamente. Ideias são salvas e podem ser transformadas em tarefas depois."
    },
    {
      icon: Target,
      title: "Entregáveis A-B-C",
      description: "Defina 3 níveis de entrega: A (mínimo), B (bom), C (excelente). Combate o perfeccionismo paralisante."
    },
    {
      icon: Zap,
      title: "Timer Progressivo",
      description: "Mostra tempo investido, não restante. Cada segundo conta como vitória. Pausas sugeridas automaticamente."
    },
    {
      icon: FileText,
      title: "Daily Log",
      description: "'Onde parei' - externalize sua memória de trabalho. Retome qualquer projeto exatamente de onde parou."
    }
  ];

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Recursos Projetados para Seu Cérebro
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cada funcionalidade foi desenvolvida com base em pesquisas de Russell Barkley 
            sobre funções executivas e TDAH
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow border-border/50 bg-card">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-[#22C55E]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  const useCases = [
    {
      icon: Rocket,
      title: "Projetos Profissionais",
      description: "Entregas de trabalho, apresentações, relatórios. Decomponha projetos complexos em tarefas diárias gerenciáveis.",
      cta: "Execute com clareza."
    },
    {
      icon: Brain,
      title: "Organize seu Pensamento",
      description: "Capture ideias soltas, estruture planos, externalize sua memória de trabalho. Deixe o NeuroPlan lembrar por você.",
      cta: "Pense com suporte."
    },
    {
      icon: Star,
      title: "Metas Pessoais",
      description: "Exercícios, estudos, hobbies. Transforme intenções vagas em ações concretas com prazos realistas.",
      cta: "Realize seus objetivos."
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como as Pessoas Usam o NeuroPlan
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                <useCase.icon className="h-8 w-8 text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-3">{useCase.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{useCase.description}</p>
              <p className="text-sm font-medium text-[#22C55E]">{useCase.cta}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Finalmente uma ferramenta que entende como meu cérebro funciona. Os ciclos curtos são game-changer.",
      author: "Marina S.",
      role: "Designer UX",
      color: "#FBBF24"
    },
    {
      quote: "O timer progressivo mudou minha relação com o tempo. Cada minuto agora é uma vitória, não uma contagem regressiva.",
      author: "Pedro L.",
      role: "Desenvolvedor",
      color: "#F472B6"
    },
    {
      quote: "Quick Ideas salvou centenas de pensamentos que eu perderia. Agora consigo capturar e organizar depois.",
      author: "Ana C.",
      role: "Empreendedora",
      color: "#A78BFA"
    }
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O Que as Pessoas Estão Dizendo
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className="h-full"
                style={{ 
                  background: `linear-gradient(135deg, ${testimonial.color}15 0%, transparent 50%)`,
                  borderColor: `${testimonial.color}30`
                }}
              >
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 mb-4" style={{ color: testimonial.color }} />
                  <p className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Pronto para Transformar Ideias em Ação?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Comece gratuitamente. Sem cartão de crédito. Cancele quando quiser.
          </p>
          
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="lg" className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold px-10 py-7 text-lg rounded-full">
                Ir para o Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold px-10 py-7 text-lg rounded-full shadow-lg shadow-[#22C55E]/30">
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
    <footer className="py-12 bg-muted/50 border-t">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-6 w-6 text-[#22C55E]" />
              <span className="font-bold text-foreground">NeuroPlan</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Seu parceiro de execução neuroadaptado.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Produto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Recursos</a></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Planos</Link></li>
              <li><a href="#how-it-works" className="hover:text-foreground transition-colors">Como Funciona</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">LGPD</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contato</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="mailto:contato@neuroplan.app" className="hover:text-foreground transition-colors">contato@neuroplan.app</a></li>
            </ul>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground text-center max-w-4xl mx-auto leading-relaxed">
            <strong>Aviso Legal:</strong> O NeuroPlan é uma ferramenta de produtividade e organização pessoal. 
            Não se trata de dispositivo médico, tratamento ou terapia para TDAH ou qualquer condição de saúde. 
            O uso desta ferramenta não substitui acompanhamento médico ou psicológico profissional. 
            Consulte sempre um profissional de saúde qualificado para questões relacionadas à saúde mental.
            Em conformidade com a LGPD (Lei 13.709/2018), seus dados são tratados com segurança e transparência.
          </p>
          <p className="text-xs text-muted-foreground text-center mt-4">
            © {new Date().getFullYear()} NeuroPlan. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
