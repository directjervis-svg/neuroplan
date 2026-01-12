import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { 
  Brain, 
  CheckCircle, 
  Clock, 
  Target, 
  ArrowRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Link } from "wouter";
import Testimonials from "@/components/Testimonials";
import { useState } from "react";

/**
 * NeuroExecução Landing Page
 * Design IDÊNTICO ao NotebookLM Google:
 * - Fundo branco puro
 * - Tipografia limpa e moderna
 * - Título com palavra em gradiente colorido
 * - Layout minimalista com muito espaço em branco
 * - Botão CTA preto arredondado
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
      answer: "É um sistema de gestão de projetos neuroadaptado, baseado na ciência cognitiva de Russell Barkley, projetado especialmente para adultos com TDAH executarem projetos em ciclos curtos de 3 dias."
    },
    {
      question: "Como funciona o ciclo de 3 dias?",
      answer: "Você descreve seu projeto em poucas frases e o sistema gera automaticamente um ciclo de 3 dias com tarefas priorizadas (A-B-C). Cada dia você vê apenas 3 tarefas, com a mais importante destacada."
    },
    {
      question: "O que é o bloco 'Onde parei'?",
      answer: "É um registro automático do seu progresso que aparece todo dia quando você abre o app. Assim você nunca precisa lembrar onde parou - o sistema mostra para você."
    },
    {
      question: "Preciso de diagnóstico de TDAH para usar?",
      answer: "Não. O sistema foi projetado com base em princípios neuroadaptativos que beneficiam qualquer pessoa que tenha dificuldade com procrastinação, foco ou conclusão de projetos."
    },
    {
      question: "Posso usar no celular?",
      answer: "Sim! O sistema é totalmente responsivo e funciona em qualquer dispositivo."
    },
    {
      question: "É gratuito?",
      answer: "Oferecemos um plano gratuito com funcionalidades básicas. Planos pagos desbloqueiam recursos avançados como IA assistente e múltiplos projetos simultâneos."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Minimal like NotebookLM */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-7 h-7 text-gray-900" />
            <span className="text-xl font-medium text-gray-900">NeuroExecução</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline-offset-4 hover:underline">
              Como Funciona
            </a>
            <a href="#neurociencia" className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline-offset-4 hover:underline">
              Neurociência
            </a>
          </nav>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6">
                Dashboard
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Entrar
              </Button>
            </a>
          )}
        </div>
      </header>

      {/* Hero Section - NotebookLM Style */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Title with Gradient Word */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
            O Fim da <span className="bg-gradient-to-r from-green-500 via-teal-400 to-blue-500 bg-clip-text text-transparent">Paralisia do TDAH</span>.
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            Cansado de começar e largar? O NeuroExecução usa a ciência de Russell Barkley para te ajudar a concluir projetos em ciclos curtos de 3 dias. Chega de se sentir sobrecarregado. É hora de executar.
          </p>
          
          {/* CTA Button - Black rounded like NotebookLM */}
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-base rounded-full font-medium">
                Ir para o Dashboard
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-base rounded-full font-medium">
                Comece Seu Primeiro Ciclo (Grátis)
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Section: Your Personalized Execution Assistant */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16">
            Your Personalized Execution Assistant
          </h2>
          
          {/* Feature Cards - 3 columns like NotebookLM */}
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {/* Card 1 */}
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Descreva seu projeto
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Em 3 frases, conte o que você quer fazer. O sistema entende seu objetivo 
                e cria um plano executável automaticamente.
              </p>
            </div>

            {/* Card 2 */}
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Receba ciclo de 3 dias
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                O sistema quebra seu projeto em 3 dias com 3 tarefas cada. 
                Tarefa A é o mínimo, B é o ideal, C é o bônus.
              </p>
            </div>

            {/* Card 3 */}
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Execute com foco
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Todo dia você vê "Hoje" + "Onde parei". Sem sobrecarga, 
                sem esquecimento. Apenas execute.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Neuroscience Section */}
      <section id="neurociencia" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Neurociência por Trás
          </h2>
          <p className="text-gray-500 text-center mb-16 max-w-2xl mx-auto">
            Baseado na pesquisa de Russell Barkley sobre funções executivas e TDAH
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Miopia Temporal
              </h3>
              <p className="text-gray-500 leading-relaxed mb-4">
                Pessoas com TDAH têm dificuldade em visualizar o futuro distante. 
                Por isso usamos ciclos curtos de 3 dias.
              </p>
              <p className="text-sm text-blue-600 font-medium">
                → Ciclos de 3 dias mantêm o futuro próximo
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Memória de Trabalho
              </h3>
              <p className="text-gray-500 leading-relaxed mb-4">
                A memória de trabalho é limitada. Guardar contexto mentalmente 
                é exaustivo e propenso a falhas.
              </p>
              <p className="text-sm text-green-600 font-medium">
                → Painel "Onde parei" externaliza a memória
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Motivação Flutuante
              </h3>
              <p className="text-gray-500 leading-relaxed mb-4">
                A motivação varia muito ao longo do dia. Tarefas grandes 
                parecem impossíveis em momentos baixos.
              </p>
              <p className="text-sm text-purple-600 font-medium">
                → Tarefas mínimas (A) + feedback visual rápido
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-gray-500 text-center mb-12">
            Tudo que você precisa saber para começar
          </p>
          
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-500 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Pronto para executar mais?
          </h2>
          <p className="text-lg text-gray-500 mb-10">
            Comece seu primeiro ciclo de 3 dias agora mesmo. É grátis.
          </p>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-base rounded-full font-medium">
                Ir para o Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-base rounded-full font-medium">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-gray-900" />
              <span className="font-medium text-gray-900">NeuroExecução</span>
            </div>
            <p className="text-sm text-gray-400 text-center max-w-md">
              Este aplicativo não substitui acompanhamento médico ou psicológico. 
              Consulte um profissional de saúde.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacidade</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Termos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


