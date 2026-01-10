import React, { useState } from "react";
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
  Sparkles, 
  Target, 
  Timer, 
  Zap,
  ArrowRight,
  Play,
  Upload,
  MessageSquare,
  Users,
  Calendar,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Eye,
  Heart,
  Shield
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

/**
 * NeuroExecução Landing Page
 * Design inspired by NotebookLM - Clean, minimal, dark theme
 * Following Barkley principles: reduced cognitive load, clear CTAs
 */
export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <Header isAuthenticated={isAuthenticated} />
      
      {/* Hero Section */}
      <HeroSection isAuthenticated={isAuthenticated} />
      
      {/* How It Works Section */}
      <HowItWorksSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Example Projects Section */}
      <ExampleProjectsSection />
      
      {/* Neuroscience Section */}
      <NeuroscienceSection />
      
      {/* FAQ Section */}
      <FAQSection />
      
      {/* CTA Section */}
      <CTASection isAuthenticated={isAuthenticated} />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

/**
 * Header - Simple, minimal like NotebookLM
 */
function Header({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
      <div className="container flex h-16 items-center justify-between">
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Brain className="h-7 w-7 text-[#22C55E]" />
          <span className="text-xl font-semibold text-white">NeuroExecução</span>
          <span className="text-xs bg-[#22C55E]/20 text-[#22C55E] px-2 py-0.5 rounded-full ml-2">
            BETA
          </span>
        </motion.div>
        
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button className="bg-[#22C55E] hover:bg-[#16A34A] text-white">
                Dashboard
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                Entrar
              </Button>
            </a>
          )}
        </motion.div>
      </div>
    </header>
  );
}

/**
 * Hero Section - NotebookLM style with geometric shapes
 */
function HeroSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Green geometric shapes like NotebookLM */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-[#22C55E]/10 rounded-3xl"
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-40 left-32 w-20 h-20 bg-[#22C55E]/5 rounded-2xl"
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, -3, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-24 h-24 bg-[#22C55E]/8 rounded-3xl"
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, 3, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, delay: 0.5 }}
        />
        
        {/* Right side shapes */}
        <motion.div
          className="absolute top-32 right-20 w-40 h-40 bg-[#22C55E]/10 rounded-3xl"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 9, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-60 right-40 w-28 h-28 bg-[#22C55E]/5 rounded-2xl"
          animate={{ 
            y: [0, 18, 0],
            rotate: [0, 4, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, delay: 1.5 }}
        />
        <motion.div
          className="absolute bottom-32 right-16 w-36 h-36 bg-[#22C55E]/8 rounded-3xl"
          animate={{ 
            y: [0, -12, 0],
            rotate: [0, -3, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 0.8 }}
        />
        
        {/* Outline shapes like NotebookLM */}
        <div className="absolute top-24 left-8 flex flex-col gap-2">
          <div className="w-16 h-3 border border-white/10 rounded-full" />
          <div className="w-12 h-3 border border-white/10 rounded-full" />
          <div className="w-20 h-3 border border-white/10 rounded-full" />
        </div>
        <div className="absolute bottom-24 right-8 flex flex-col gap-2">
          <div className="w-16 h-3 border border-white/10 rounded-full" />
          <div className="w-12 h-3 border border-white/10 rounded-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Title - Like NotebookLM "Welcome to NotebookLM" */}
          <motion.h1 
            className="text-5xl md:text-7xl font-light text-[#7DD3FC] mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Bem-vindo ao NeuroExecução
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Seu assistente de execução neuroadaptado, fundamentado na ciência cognitiva de Russell Barkley. 
            Execute projetos em ciclos de 3 dias, mesmo com TDAH.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-medium px-8 py-6 text-lg rounded-xl">
                  Ir para o Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button size="lg" className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-medium px-8 py-6 text-lg rounded-xl">
                    Começar Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" className="bg-transparent hover:bg-white/5 text-white/70 hover:text-white font-medium px-8 py-6 text-lg rounded-xl border-white/20">
                    Ver Como Funciona
                  </Button>
                </a>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * How It Works Section - 3 steps with icons like NotebookLM
 */
function HowItWorksSection() {
  const steps = [
    {
      icon: Upload,
      title: "Descreva seu projeto",
      description: "Envie uma descrição simples do que você quer realizar. A IA vai estruturar tudo para você."
    },
    {
      icon: Calendar,
      title: "Receba seu ciclo de 3 dias",
      description: "Tarefas A-B-C organizadas por prioridade. Máximo 3 por dia para não sobrecarregar."
    },
    {
      icon: Target,
      title: "Execute com foco",
      description: "Timer progressivo, assistente IA e registro 'Onde Parei' para manter o contexto."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#111111]">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
              Como funciona
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              NeuroExecução é um assistente de execução neuroadaptado que funciona melhor com seus projetos
            </p>
          </motion.div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-white/70" />
                </div>
                <h3 className="text-lg font-medium text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <a href={getLoginUrl()}>
              <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium px-8 py-6 text-base rounded-xl">
                Criar Projeto
              </Button>
            </a>
            <p className="mt-4 text-white/40 text-sm">
              Experimente com um projeto de exemplo
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Features Section - Key features in cards
 */
function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "Baseado em Barkley",
      description: "Fundamentado na ciência cognitiva de Russell Barkley sobre funções executivas e TDAH."
    },
    {
      icon: Timer,
      title: "Timer Progressivo",
      description: "Mostra tempo investido ao invés de countdown. Reduz ansiedade e aumenta motivação."
    },
    {
      icon: MessageSquare,
      title: "Assistente IA",
      description: "Pergunte sobre seu projeto, peça dicas ou use prompts rápidos para metacognição."
    },
    {
      icon: FileText,
      title: "Onde Parei",
      description: "Registro automático do contexto. Nunca mais perca tempo lembrando onde parou."
    },
    {
      icon: BarChart3,
      title: "Gamificação",
      description: "XP, streaks e badges para manter a motivação. Recompensas por consistência."
    },
    {
      icon: Zap,
      title: "Ciclos de 3 Dias",
      description: "Projetos divididos em sprints curtos. Ideal para manter foco e ver progresso rápido."
    }
  ];

  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
              Recursos neuroadaptados
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Cada funcionalidade foi desenhada para reduzir carga cognitiva e facilitar a execução
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <feature.icon className="w-8 h-8 text-[#22C55E] mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Example Projects Section - Like NotebookLM's example notebooks
 */
function ExampleProjectsSection() {
  const examples = [
    {
      emoji: "📝",
      title: "Criar Conteúdo",
      description: "Blog, vídeos, posts",
      color: "from-amber-500/20 to-amber-600/20"
    },
    {
      emoji: "💻",
      title: "Projeto de Software",
      description: "Apps, sites, APIs",
      color: "from-blue-500/20 to-blue-600/20"
    },
    {
      emoji: "📚",
      title: "Trabalho Acadêmico",
      description: "TCC, artigos, estudos",
      color: "from-purple-500/20 to-purple-600/20"
    },
    {
      emoji: "🏠",
      title: "Projeto Pessoal",
      description: "Organização, metas",
      color: "from-green-500/20 to-green-600/20"
    }
  ];

  return (
    <section className="py-24 bg-[#111111]">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-medium text-white mb-2">
              Projetos de exemplo
            </h2>
            <p className="text-white/50">
              Comece com um template ou crie do zero
            </p>
          </motion.div>

          {/* Examples Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {examples.map((example, index) => (
              <motion.div
                key={index}
                className={`p-5 rounded-2xl bg-gradient-to-br ${example.color} border border-white/5 hover:border-white/10 cursor-pointer transition-all hover:scale-[1.02]`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <span className="text-2xl mb-3 block">{example.emoji}</span>
                <h3 className="text-base font-medium text-white mb-1">
                  {example.title}
                </h3>
                <p className="text-white/50 text-sm">
                  {example.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Neuroscience Section - 3 cards explaining Barkley principles
 */
function NeuroscienceSection() {
  const principles = [
    {
      icon: Eye,
      title: "Externalização",
      description: "O TDAH afeta a memória de trabalho. Por isso, externalizamos tudo: tarefas, progresso, onde você parou. Nada fica só na sua cabeça.",
      color: "from-blue-500/20 to-blue-600/20"
    },
    {
      icon: Clock,
      title: "Proximidade Temporal",
      description: "Recompensas distantes não motivam cérebros TDAH. Ciclos de 3 dias garantem resultados visíveis rapidamente, mantendo a motivação.",
      color: "from-green-500/20 to-green-600/20"
    },
    {
      icon: Target,
      title: "Redução de Atrito",
      description: "Cada clique a menos é uma barreira removida. Interface mínima, ações claras, feedback instantâneo. Menos decisões, mais execução.",
      color: "from-purple-500/20 to-purple-600/20"
    }
  ];

  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-[#22C55E]/10 text-[#22C55E] px-4 py-2 rounded-full text-sm mb-6">
              <Brain className="w-4 h-4" />
              Fundamentado em Ciência
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
              A neurociência por trás
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Baseado nos estudos de Russell Barkley sobre funções executivas e TDAH. 
              Cada funcionalidade foi desenhada para compensar déficits específicos.
            </p>
          </motion.div>

          {/* Principles Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {principles.map((principle, index) => (
              <motion.div
                key={index}
                className={`p-8 rounded-2xl bg-gradient-to-br ${principle.color} border border-white/5`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                  <principle.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">
                  {principle.title}
                </h3>
                <p className="text-white/60 leading-relaxed">
                  {principle.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Barkley Quote */}
          <motion.div 
            className="mt-12 p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <blockquote className="text-lg text-white/70 italic mb-4">
              "TDAH não é um problema de saber o que fazer, é um problema de fazer o que você sabe."
            </blockquote>
            <cite className="text-white/40 text-sm">- Dr. Russell Barkley</cite>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * FAQ Section - Common questions with accordion
 */
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs = [
    {
      question: "O NeuroExecução é apenas para pessoas com TDAH?",
      answer: "Não! Embora seja otimizado para cérebros TDAH, qualquer pessoa que tenha dificuldade em executar projetos pode se beneficiar. Os princípios de externalização e fragmentação funcionam para todos."
    },
    {
      question: "Como funciona o sistema A-B-C de tarefas?",
      answer: "Cada dia tem 3 tarefas: A (é o mínimo aceitável, ~30min), B (ideal, ~45min), C (excepcional, ~30min). Isso reduz a paralisia de decisão e dá clareza sobre prioridades."
    },
    {
      question: "Por que ciclos de 3 dias?",
      answer: "Projetos longos desmotivam cérebros TDAH. Ciclos curtos de 3 dias garantem resultados visíveis rapidamente, mantendo a dopamina e motivação em alta."
    },
    {
      question: "O que é o 'Onde Parei'?",
      answer: "É um registro automático do seu contexto de trabalho. Quando você retorna a uma tarefa, sabe exatamente onde parou e qual é o próximo passo. Compensa déficits de memória de trabalho."
    },
    {
      question: "Meus dados estão seguros?",
      answer: "Sim. Seguimos a LGPD, seus dados são criptografados e nunca compartilhados. Você pode exportar ou deletar seus dados a qualquer momento."
    },
    {
      question: "Isso substitui tratamento médico?",
      answer: "Não. NeuroExecução é uma ferramenta de produtividade, não um tratamento médico. Se você tem TDAH ou suspeita ter, consulte um profissional de saúde."
    }
  ];

  return (
    <section className="py-24 bg-[#111111]">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
              Perguntas frequentes
            </h2>
            <p className="text-white/50">
              Tire suas dúvidas sobre o NeuroExecução
            </p>
          </motion.div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="border border-white/10 rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                <button
                  className="w-full px-6 py-5 flex items-center justify-between text-left bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="text-white font-medium pr-4">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-white/50 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/50 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 py-5 bg-white/[0.01] border-t border-white/5">
                    <p className="text-white/60 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * CTA Section - Final call to action
 */
function CTASection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="container">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
            Pronto para executar?
          </h2>
          <p className="text-white/50 mb-8 max-w-xl mx-auto">
            Comece seu primeiro ciclo de 3 dias agora. Sem cartão de crédito, sem compromisso.
          </p>
          
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="lg" className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-medium px-10 py-6 text-lg rounded-xl">
                Ir para o Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-medium px-10 py-6 text-lg rounded-xl">
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          )}
          
          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
              <span>Baseado em Russell Barkley</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
              <span>IA Neuroadaptada</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
              <span>Dados Protegidos</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Footer - Simple with disclaimer
 */
function Footer() {
  return (
    <footer className="py-12 bg-[#0a0a0a] border-t border-white/5">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Brain className="h-6 w-6 text-[#22C55E]" />
            <span className="text-lg font-semibold text-white">NeuroExecução</span>
          </div>
          
          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            <Link href="/pricing" className="text-white/50 hover:text-white transition-colors">
              Planos
            </Link>
            <a href="#" className="text-white/50 hover:text-white transition-colors">
              Privacidade
            </a>
            <a href="#" className="text-white/50 hover:text-white transition-colors">
              Termos
            </a>
            <a href="#" className="text-white/50 hover:text-white transition-colors">
              Contato
            </a>
          </div>
          
          {/* Disclaimer */}
          <div className="text-center text-xs text-white/30 max-w-2xl mx-auto leading-relaxed">
            <p className="mb-4">
              <strong>Aviso Legal:</strong> NeuroExecução é uma ferramenta de produtividade e não substitui 
              tratamento médico ou psicológico. Se você tem TDAH ou suspeita ter, consulte um profissional de saúde.
            </p>
            <p>
              © {new Date().getFullYear()} NeuroExecução. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
