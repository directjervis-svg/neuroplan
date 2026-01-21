import React from 'react';
import { trpc } from '@/lib/trpc';
import { Zap, CheckCircle, Clock } from 'lucide-react';

/**
 * Componente de Barra de Progresso Permanente (ProgressHeader)
 * Exibe o progresso do ciclo atual e estatísticas chave.
 */
export const ProgressHeader: React.FC = () => {
  // Simulação de dados (em produção, usaria a API)
  const { data: stats, isLoading } = trpc.user.getStats.useQuery(undefined, {
    staleTime: 5000, // Atualiza a cada 5 segundos
  });

  if (isLoading) {
    return (
      <div className="w-full bg-gray-100 p-4 border-b border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div className="h-2 bg-gray-300 rounded w-full"></div>
      </div>
    );
  }

  const activeProjects = stats?.activeProjects || 0;
  const todayTasks = stats?.todayTasks || 0;
  const completedTasks = stats?.completedTasks || 0;
  const focusMinutes = stats?.focusMinutes || 0;

  const progress = todayTasks > 0 ? Math.round((completedTasks / todayTasks) * 100) : 0;
  const progressColor = progress === 100 ? 'bg-green-500' : 'bg-indigo-500';

  return (
    <header className="w-full bg-white shadow-md border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Progresso do Dia */}
        <div className="flex-1 mr-8">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-medium text-gray-700">
              Progresso do Dia: {completedTasks} de {todayTasks} tarefas
            </h3>
            <span className="text-sm font-semibold text-indigo-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ${progressColor}`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Estatísticas Chave */}
        <div className="flex space-x-6">
          
          <div className="flex items-center text-sm text-gray-600">
            <Zap className="w-4 h-4 text-indigo-500 mr-1.5" />
            <span className="font-medium">{activeProjects}</span>
            <span className="ml-1 hidden sm:inline">Projetos Ativos</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500 mr-1.5" />
            <span className="font-medium">{completedTasks}</span>
            <span className="ml-1 hidden sm:inline">Concluídas Hoje</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 text-yellow-500 mr-1.5" />
            <span className="font-medium">{focusMinutes}</span>
            <span className="ml-1 hidden sm:inline">Minutos Focados</span>
          </div>

        </div>
      </div>
    </header>
  );
};
