import { useEffect, useState } from 'react';
import { Loader2, Brain, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AILoadingStateProps {
  stage: 'analyzing' | 'generating-wbs' | 'generating-tasks' | 'validating';
  estimatedSeconds?: number;
}

const stageMessages = {
  analyzing: {
    title: 'Analisando seu projeto...',
    tips: [
      'Estamos identificando os principais desafios e objetivos',
      'Nossa IA está estruturando seu plano de execução',
      'Adaptando a granularidade às suas preferências'
    ]
  },
  'generating-wbs': {
    title: 'Gerando estrutura de entregáveis...',
    tips: [
      'Definindo os três níveis: Mínimo, Ideal e Excepcional',
      'Estruturando seu projeto em etapas alcançáveis',
      'Aplicando o Sistema ABC baseado em ciência'
    ]
  },
  'generating-tasks': {
    title: 'Criando lista de tarefas...',
    tips: [
      'Quebrando seu projeto em ações específicas',
      'Distribuindo tarefas ao longo de 3 dias',
      'Estimando tempo necessário para cada etapa'
    ]
  },
  'validating': {
    title: 'Validando e otimizando...',
    tips: [
      'Verificando coerência do plano',
      'Ajustando complexidade das tarefas',
      'Finalizando sua estrutura de execução'
    ]
  }
};

export function AILoadingState({ stage, estimatedSeconds = 5 }: AILoadingStateProps) {
  const [progress, setProgress] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const messages = stageMessages[stage];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        const increment = (100 / estimatedSeconds) * 0.1;
        return Math.min(prev + increment, 95);
      });
    }, 100);

    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % messages.tips.length);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, [estimatedSeconds, messages.tips.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <div className="relative">
        <div className="absolute inset-0 animate-ping">
          <Brain className="w-16 h-16 text-primary/20" />
        </div>
        <Brain className="w-16 h-16 text-primary relative z-10" />
      </div>

      <div className="text-center space-y-2 max-w-md">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <h3 className="text-xl font-semibold">{messages.title}</h3>
        </div>
        
        <p className="text-muted-foreground text-sm transition-all duration-300">
          {messages.tips[currentTipIndex]}
        </p>
      </div>

      <div className="w-full max-w-md space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground text-center">
          Isso pode levar alguns segundos...
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-4 py-2 rounded-full">
        <Sparkles className="w-4 h-4" />
        <span>Usando IA adaptativa GPT-4o-mini</span>
      </div>
    </div>
  );
}
