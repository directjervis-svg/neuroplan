import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { getLoginUrl } from "@/const";
import {
  Brain,
  CheckCircle2,
  Clock,
  Target,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  TrendingUp,
  Shield,
  Users,
  Star,
} from "lucide-react";
import { Link } from "wouter";
import Testimonials from "@/components/Testimonials";

/**
 * NeuroExecução Landing Page - NeuroFlow Design System
 *
 * Hero premium com:
 * - Gradiente laranja→azul
 * - Badge "Baseado em Ciência de Russell Barkley"
 * - Preview do dashboard com ProgressCircle
 * - Métricas de impacto (98%, 3x, 92%)
 * - CTA com gradiente e glow
 */

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "O que é o NeuroExecução?",
      answer:
        "É um sistema de gestão de projetos neuroadaptado, baseado na ciência cognitiva de Russell Barkley, projetado especialmente para adultos com TDAH executarem projetos em ciclos curtos de 3 dias.",
    },
    {
      question: "Como funciona o ciclo de 3 dias?",
      answer:
        "Você descreve seu projeto em poucas frases e o sistema gera automaticamente um ciclo de 3 dias com tarefas priorizadas (A-B-C). Cada dia você vê apenas 3 tarefas, com a mais importante destacada.",
    },
    {
      question: "O que é o bloco 'Onde parei'?",
      answer:
        "É um registro automático do seu progresso que aparece todo dia quando você abre o app. Assim você nunca precisa lembrar onde parou - o sistema mostra para você.",
    },
    {
      question: "Preciso de diagnóstico de TDAH para usar?",
      answer:
        "Não. O sistema foi projetado com base em princípios neuroadaptativos que beneficiam qualquer pessoa que tenha dificuldade com procrastinação, foco ou conclusão de projetos.",
    },
    {
      question: "Posso usar no celular?",
      answer:
        "Sim! O sistema é totalmente responsivo e funciona em qualquer dispositivo.",
    },
    {
      question: "É gratuito?",
      answer:
        "Oferecemos um plano gratuito com funcionalidades básicas. Planos pagos desbloqueiam recursos avançados como IA assistente e múltiplos projetos simultâneos.",
    },
  ];

  const features = [
    {
      icon: Target,
      title: "Descreva seu projeto",
      description:
        "Em 3 frases, conte o que você quer fazer. O sistema entende seu objetivo e cria um plano executável automaticamente.",
      color: "orange",
    },
    {
      icon: Clock,
      title: "Receba ciclo de 3 dias",
      description:
        "O sistema quebra seu projeto em 3 dias com 3 tarefas cada. Tarefa A é o mínimo, B é o ideal, C é o bônus.",
      color: "blue",
    },
    {
      icon: CheckCircle2,
      title: "Execute com foco",
      description:
        "Todo dia você vê 'Hoje' + 'Onde parei'. Sem sobrecarga, sem esquecimento. Apenas execute.",
      color: "green",
    },
  ];

  const metrics = [
    { value: "98%", label: "Taxa de conclusão", sublabel: "de ciclos iniciados" },
    { value: "3x", label: "Mais produtivo", sublabel: "vs. métodos tradicionais" },
    { value: "92%", label: "Menos ansiedade", sublabel: "relatada por usuários" },
  ];

  const neuroscience = [
    {
      emoji: "⏱️",
      title: "Miopia Temporal",
      description:
        "Pessoas com TDAH têm dificuldade em visualizar o futuro distante. Por isso usamos ciclos curtos de 3 dias.",
      insight: "Ciclos de 3 dias mantêm o futuro próximo",
      color: "blue",
    },
    {
      emoji: "🧠",
      title: "Memória de Trabalho",
      description:
        "A memória de trabalho é limitada. Guardar contexto mentalmente é exaustivo e propenso a falhas.",
      insight: "Painel 'Onde parei' externaliza a memória",
      color: "green",
    },
    {
      emoji: "⚡",
      title: "Motivação Flutuante",
      description:
        "A motivação varia muito ao longo do dia. Tarefas grandes parecem impossíveis em momentos baixos.",
      insight: "Tarefas mínimas (A) + feedback visual rápido",
      color: "orange",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      orange: {
        bg: "bg-[var(--neuro-orange-100)]",
        text: "text-[var(--neuro-orange-primary)]",
        border: "border-[var(--neuro-orange-200)]",
      },
      blue: {
        bg: "bg-[var(--neuro-blue-100)]",
        text: "text-[var(--neuro-blue-primary)]",
        border: "border-[var(--neuro-blue-200)]",
      },
      green: {
        bg: "bg-[var(--neuro-green-100)]",
        text: "text-[var(--neuro-green-primary)]",
        border: "border-[var(--neuro-green-200)]",
      },
    };
    return colors[color] || colors.orange;
  };

  return (
    <div className="min-h-screen bg-[var(--neuro-bg-primary)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--neuro-bg-card)]/90 backdrop-blur-md border-b border-[var(--neuro-border-default)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neuro-gradient-primary flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--neuro-text-primary)]">
              NeuroExecução
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#como-funciona"
              className="text-sm text-[var(--neuro-text-secondary)] hover:text-[var(--neuro-text-primary)] transition-colors"
            >
              Como Funciona
            </a>
            <a
              href="#neurociencia"
              className="text-sm text-[var(--neuro-text-secondary)] hover:text-[var(--neuro-text-primary)] transition-colors"
            >
              Neurociência
            </a>
            <a
              href="#faq"
              className="text-sm text-[var(--neuro-text-secondary)] hover:text-[var(--neuro-text-primary)] transition-colors"
            >
              FAQ
            </a>
          </nav>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button variant="primary">Dashboard</Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button variant="ghost">Entrar</Button>
            </a>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--neuro-orange-50)_0%,var(--neuro-bg-primary)_50%,var(--neuro-blue-50)_100%)] opacity-50" />

        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Science Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--neuro-bg-card)] border border-[var(--neuro-border-default)] shadow-sm animate-fade-in-up">
                <Sparkles className="w-4 h-4 text-[var(--neuro-orange-primary)]" />
                <span className="text-sm font-medium text-[var(--neuro-text-secondary)]">
                  Baseado em Ciência de Russell Barkley
                </span>
              </div>

              {/* Main Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--neuro-text-primary)] leading-tight animate-fade-in-up stagger-1">
                O Fim da{" "}
                <span className="text-gradient-primary">Paralisia do TDAH</span>.
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-[var(--neuro-text-secondary)] max-w-lg leading-relaxed animate-fade-in-up stagger-2">
                Cansado de começar e largar? O NeuroExecução usa neurociência para
                te ajudar a concluir projetos em ciclos curtos de 3 dias.{" "}
                <strong className="text-[var(--neuro-text-primary)]">
                  Chega de sobrecarga. É hora de executar.
                </strong>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-3">
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button variant="gradient" size="lg" className="animate-pulse-glow">
                      Ir para o Dashboard
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <a href={getLoginUrl()}>
                    <Button variant="gradient" size="lg" className="animate-pulse-glow">
                      Comece Seu Primeiro Ciclo
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </a>
                )}
                <a href="#como-funciona">
                  <Button variant="outline" size="lg">
                    Ver Como Funciona
                  </Button>
                </a>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 pt-4 animate-fade-in-up stagger-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-[var(--neuro-gray-200)] border-2 border-[var(--neuro-bg-card)] flex items-center justify-center"
                    >
                      <Users className="w-4 h-4 text-[var(--neuro-text-tertiary)]" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-[var(--neuro-yellow-primary)] text-[var(--neuro-yellow-primary)]"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-[var(--neuro-text-secondary)]">
                    +2.000 usuários ativos
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative animate-fade-in-up stagger-3">
              <Card className="p-6 shadow-lg border-[var(--neuro-border-default)]">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--neuro-text-tertiary)]">Dia 2 do ciclo</p>
                      <h3 className="text-lg font-semibold text-[var(--neuro-text-primary)]">
                        Hoje
                      </h3>
                    </div>
                    <ProgressCircle value={82} size="md" color="orange" sublabel="Focus" />
                  </div>

                  {/* Tasks Preview */}
                  <div className="space-y-3">
                    {[
                      { priority: "A", title: "Revisar proposta do cliente", done: true },
                      { priority: "B", title: "Enviar e-mail de follow-up", done: false },
                      { priority: "C", title: "Organizar notas da reunião", done: false },
                    ].map((task, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          task.done
                            ? "bg-[var(--neuro-green-50)] border-[var(--neuro-green-200)]"
                            : "bg-[var(--neuro-bg-secondary)] border-[var(--neuro-border-default)]"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                            task.done
                              ? "bg-[var(--neuro-orange-primary)] border-[var(--neuro-orange-primary)]"
                              : "border-[var(--neuro-gray-400)]"
                          }`}
                        >
                          {task.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded ${
                            task.priority === "A"
                              ? "bg-[var(--neuro-red-100)] text-[var(--neuro-red-600)]"
                              : task.priority === "B"
                              ? "bg-[var(--neuro-yellow-100)] text-[var(--neuro-yellow-600)]"
                              : "bg-[var(--neuro-green-100)] text-[var(--neuro-green-600)]"
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span
                          className={`flex-1 text-sm ${
                            task.done
                              ? "line-through text-[var(--neuro-text-tertiary)]"
                              : "text-[var(--neuro-text-primary)]"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Where I Left Off */}
                  <div className="p-3 rounded-lg bg-[var(--neuro-blue-50)] border border-[var(--neuro-blue-200)]">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-4 h-4 text-[var(--neuro-blue-primary)]" />
                      <span className="text-sm font-medium text-[var(--neuro-text-primary)]">
                        Onde parei
                      </span>
                    </div>
                    <p className="text-xs text-[var(--neuro-text-secondary)]">
                      Terminei a análise dos dados. Próximo passo: criar visualizações.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 px-3 py-1.5 rounded-full bg-[var(--neuro-green-primary)] text-white text-sm font-medium shadow-lg animate-bounce-attention">
                +50 XP
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-16 px-6 bg-[var(--neuro-bg-card)] border-y border-[var(--neuro-border-default)]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="space-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-4xl md:text-5xl font-bold text-gradient-primary">
                  {metric.value}
                </p>
                <p className="text-lg font-semibold text-[var(--neuro-text-primary)]">
                  {metric.label}
                </p>
                <p className="text-sm text-[var(--neuro-text-tertiary)]">{metric.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--neuro-text-primary)] mb-4">
              Seu Assistente de Execução Personalizado
            </h2>
            <p className="text-[var(--neuro-text-secondary)] max-w-2xl mx-auto">
              Em 3 passos simples, transforme qualquer projeto em tarefas executáveis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const colors = getColorClasses(feature.color);
              return (
                <Card
                  key={index}
                  className="p-6 hover:shadow-lg transition-all duration-200 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-7 h-7 ${colors.text}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--neuro-text-primary)] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--neuro-text-secondary)] leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Neuroscience Section */}
      <section id="neurociencia" className="py-20 px-6 bg-[var(--neuro-bg-secondary)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--neuro-text-primary)] mb-4">
              Neurociência por Trás
            </h2>
            <p className="text-[var(--neuro-text-secondary)] max-w-2xl mx-auto">
              Baseado na pesquisa de Russell Barkley sobre funções executivas e TDAH
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {neuroscience.map((item, index) => {
              const colors = getColorClasses(item.color);
              return (
                <Card
                  key={index}
                  className="p-8 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-4xl mb-4">{item.emoji}</div>
                  <h3 className="text-xl font-semibold text-[var(--neuro-text-primary)] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[var(--neuro-text-secondary)] leading-relaxed mb-4">
                    {item.description}
                  </p>
                  <p className={`text-sm font-medium ${colors.text}`}>→ {item.insight}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--neuro-text-primary)] mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-[var(--neuro-text-secondary)]">
              Tudo que você precisa saber para começar
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="overflow-hidden transition-all duration-200"
                interactive
                onClick={() => toggleFaq(index)}
              >
                <button className="w-full px-6 py-5 flex items-center justify-between text-left">
                  <span className="font-medium text-[var(--neuro-text-primary)]">
                    {faq.question}
                  </span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-[var(--neuro-text-tertiary)] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[var(--neuro-text-tertiary)] flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5">
                    <p className="text-[var(--neuro-text-secondary)] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Final CTA Section */}
      <section className="py-20 px-6 bg-[var(--neuro-bg-card)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--neuro-text-primary)] mb-6">
            Pronto para executar mais?
          </h2>
          <p className="text-lg text-[var(--neuro-text-secondary)] mb-10 max-w-2xl mx-auto">
            Comece seu primeiro ciclo de 3 dias agora mesmo.{" "}
            <strong className="text-[var(--neuro-text-primary)]">É grátis.</strong>
          </p>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button variant="gradient" size="xl" className="animate-pulse-glow">
                Ir para o Dashboard
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button variant="gradient" size="xl" className="animate-pulse-glow">
                Começar Agora - Grátis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
          )}

          <div className="flex items-center justify-center gap-8 mt-10">
            <div className="flex items-center gap-2 text-sm text-[var(--neuro-text-tertiary)]">
              <Shield className="w-4 h-4" />
              Sem cartão de crédito
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--neuro-text-tertiary)]">
              <Zap className="w-4 h-4" />
              Setup em 2 minutos
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--neuro-text-tertiary)]">
              <Users className="w-4 h-4" />
              +2.000 usuários
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--neuro-border-default)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neuro-gradient-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-[var(--neuro-text-primary)]">
                NeuroExecução
              </span>
            </div>
            <p className="text-sm text-[var(--neuro-text-tertiary)] text-center max-w-md">
              Este aplicativo não substitui acompanhamento médico ou psicológico. Consulte
              um profissional de saúde.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy">
                <a className="text-sm text-[var(--neuro-text-secondary)] hover:text-[var(--neuro-text-primary)]">
                  Privacidade
                </a>
              </Link>
              <Link href="/terms">
                <a className="text-sm text-[var(--neuro-text-secondary)] hover:text-[var(--neuro-text-primary)]">
                  Termos
                </a>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
