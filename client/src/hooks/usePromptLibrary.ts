/**
 * usePromptLibrary Hook - Biblioteca de Prompts
 *
 * Gerencia uma biblioteca de prompts pré-configurados para IA:
 * - Busca e filtro de prompts
 * - Sistema de favoritos
 * - Histórico de uso
 * - Templates customizáveis
 * - Categorização por contexto (TDAH, produtividade, etc)
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { userPreferences } from '@/utils/storage';

// ========================
// Tipos
// ========================

export type PromptCategory =
  | 'planejamento'
  | 'desbloqueio'
  | 'decomposicao'
  | 'validacao'
  | 'motivacao'
  | 'reflexao'
  | 'priorizacao'
  | 'foco';

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: PromptCategory;
  prompt: string;
  variables?: string[]; // Placeholders como {{tarefa}}, {{tempo}}
  tags: string[];
  usageCount: number;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
  isCustom: boolean;
}

export interface PromptUsageRecord {
  promptId: string;
  usedAt: number;
  context?: string;
  wasHelpful?: boolean;
}

export interface UsePromptLibraryReturn {
  // Dados
  prompts: PromptTemplate[];
  favorites: PromptTemplate[];
  recentlyUsed: PromptTemplate[];

  // Busca e filtro
  search: (query: string) => PromptTemplate[];
  filterByCategory: (category: PromptCategory) => PromptTemplate[];
  filterByTags: (tags: string[]) => PromptTemplate[];

  // Favoritos
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  // Uso
  usePrompt: (id: string, variables?: Record<string, string>) => string;
  recordUsage: (id: string, wasHelpful?: boolean) => void;

  // CRUD custom prompts
  createPrompt: (prompt: Omit<PromptTemplate, 'id' | 'usageCount' | 'isFavorite' | 'createdAt' | 'updatedAt' | 'isCustom'>) => PromptTemplate;
  updatePrompt: (id: string, updates: Partial<PromptTemplate>) => void;
  deletePrompt: (id: string) => boolean;

  // Estatísticas
  getMostUsed: (limit?: number) => PromptTemplate[];
  getUsageStats: () => { total: number; byCategory: Record<PromptCategory, number> };
}

// ========================
// Prompts Padrão
// ========================

const DEFAULT_PROMPTS: Omit<PromptTemplate, 'usageCount' | 'isFavorite' | 'createdAt' | 'updatedAt' | 'isCustom'>[] = [
  // Planejamento
  {
    id: 'plan-3day-cycle',
    title: 'Planejar Ciclo de 3 Dias',
    description: 'Cria um ciclo otimizado de 3 dias para um objetivo específico.',
    category: 'planejamento',
    prompt: `Crie um ciclo de 3 dias para alcançar o seguinte objetivo:

**Objetivo:** {{objetivo}}
**Tempo disponível por dia:** {{tempo_diario}} minutos
**Nível de energia atual:** {{energia}}

Para cada dia:
1. Liste tarefas priorizadas como A (essencial), B (importante), C (bônus)
2. Inclua pausas estratégicas
3. Defina critérios de "done" claros
4. Sugira primeira ação para cada tarefa`,
    variables: ['objetivo', 'tempo_diario', 'energia'],
    tags: ['ciclo', 'barkley', 'planejamento'],
  },
  {
    id: 'plan-weekly-review',
    title: 'Revisão Semanal',
    description: 'Template para reflexão e planejamento da próxima semana.',
    category: 'planejamento',
    prompt: `Ajude-me a fazer minha revisão semanal:

**Semana passada:**
- O que completei: {{completado}}
- O que ficou pendente: {{pendente}}
- Maior desafio: {{desafio}}

Por favor:
1. Identifique padrões de produtividade
2. Sugira ajustes para a próxima semana
3. Celebre as vitórias (mesmo pequenas)
4. Proponha uma intenção para a semana`,
    variables: ['completado', 'pendente', 'desafio'],
    tags: ['revisão', 'semanal', 'reflexão'],
  },

  // Desbloqueio
  {
    id: 'unblock-procrastination',
    title: 'Desbloquear Procrastinação',
    description: 'Técnica socrática para entender e superar bloqueios.',
    category: 'desbloqueio',
    prompt: `Estou procrastinando na seguinte tarefa:

**Tarefa:** {{tarefa}}
**Há quanto tempo adiando:** {{tempo_adiando}}
**O que sinto quando penso nela:** {{sentimento}}

Me ajude usando perguntas socráticas:
1. O que exatamente está me bloqueando?
2. Qual seria o menor passo possível?
3. O que acontece se eu não fizer?
4. O que acontece se eu fizer apenas 5 minutos?`,
    variables: ['tarefa', 'tempo_adiando', 'sentimento'],
    tags: ['procrastinação', 'bloqueio', 'socrático'],
  },
  {
    id: 'unblock-overwhelm',
    title: 'Superar Sobrecarga Mental',
    description: 'Quando tudo parece demais, reorganize e respire.',
    category: 'desbloqueio',
    prompt: `Estou me sentindo sobrecarregado(a) com:

{{lista_preocupacoes}}

Me ajude a:
1. Separar o que posso controlar do que não posso
2. Identificar a ÚNICA coisa mais importante agora
3. Criar um "estacionamento mental" para as outras coisas
4. Definir um próximo passo de 2 minutos`,
    variables: ['lista_preocupacoes'],
    tags: ['sobrecarga', 'ansiedade', 'foco'],
  },

  // Decomposição
  {
    id: 'decompose-task',
    title: 'Decompor Tarefa Grande',
    description: 'Quebra tarefas complexas em ações menores.',
    category: 'decomposicao',
    prompt: `Preciso decompor esta tarefa em ações menores:

**Tarefa:** {{tarefa}}
**Prazo:** {{prazo}}
**Meu nível de familiaridade:** {{familiaridade}}

Para cada subtarefa:
1. Descreva em 1 frase clara
2. Estime tempo (máx 25 min cada)
3. Defina "done" específico
4. Indique dependências`,
    variables: ['tarefa', 'prazo', 'familiaridade'],
    tags: ['wbs', 'decomposição', 'subtarefas'],
  },
  {
    id: 'decompose-project',
    title: 'Estruturar Projeto',
    description: 'Cria WBS (Work Breakdown Structure) para projetos.',
    category: 'decomposicao',
    prompt: `Crie uma estrutura WBS para o projeto:

**Projeto:** {{projeto}}
**Objetivo final:** {{objetivo}}
**Recursos disponíveis:** {{recursos}}
**Restrições:** {{restricoes}}

Estruture em:
1. Entregas principais (milestones)
2. Pacotes de trabalho
3. Tarefas individuais
4. Critérios de aceite para cada entrega`,
    variables: ['projeto', 'objetivo', 'recursos', 'restricoes'],
    tags: ['wbs', 'projeto', 'estrutura'],
  },

  // Validação
  {
    id: 'validate-smart',
    title: 'Validar Objetivo SMART',
    description: 'Verifica se objetivo atende critérios SMART.',
    category: 'validacao',
    prompt: `Analise este objetivo usando os critérios SMART:

**Objetivo:** {{objetivo}}

Avalie cada critério (1-10):
- **S**pecífico: É claro e bem definido?
- **M**ensurável: Como saberemos que foi alcançado?
- **A**lcançável: É realista com os recursos disponíveis?
- **R**elevante: Alinha com objetivos maiores?
- **T**emporal: Tem prazo definido?

Sugira melhorias para cada critério abaixo de 7.`,
    variables: ['objetivo'],
    tags: ['smart', 'validação', 'objetivo'],
  },
  {
    id: 'validate-cycle',
    title: 'Validar Ciclo de Tarefas',
    description: 'Avalia viabilidade de um ciclo de tarefas.',
    category: 'validacao',
    prompt: `Valide a viabilidade deste ciclo de tarefas:

{{ciclo_tarefas}}

**Capacidade cognitiva:** {{capacidade}} minutos/dia

Analise:
1. Carga cognitiva total vs disponível
2. Distribuição de tarefas A/B/C
3. Trocas de contexto excessivas
4. Riscos de sobrecarga
5. Score de viabilidade (0-100%)`,
    variables: ['ciclo_tarefas', 'capacidade'],
    tags: ['ciclo', 'validação', 'viabilidade'],
  },

  // Motivação
  {
    id: 'motivate-start',
    title: 'Motivação para Começar',
    description: 'Boost motivacional para iniciar uma tarefa.',
    category: 'motivacao',
    prompt: `Preciso de motivação para começar:

**Tarefa:** {{tarefa}}
**Por que é importante:** {{importancia}}
**O que me impede:** {{bloqueio}}

Me ajude com:
1. Uma perspectiva encorajadora
2. Lembrança de vitórias passadas similares
3. Técnica dos "2 minutos" para começar
4. Visualização do resultado positivo`,
    variables: ['tarefa', 'importancia', 'bloqueio'],
    tags: ['motivação', 'início', 'encorajamento'],
  },
  {
    id: 'motivate-celebrate',
    title: 'Celebrar Conquista',
    description: 'Reconhecer e celebrar uma vitória.',
    category: 'motivacao',
    prompt: `Acabei de completar:

**Conquista:** {{conquista}}
**Desafios que superei:** {{desafios}}

Me ajude a:
1. Reconhecer a importância dessa vitória
2. Identificar o que aprendi
3. Sugerir uma forma de celebrar
4. Conectar com o próximo objetivo`,
    variables: ['conquista', 'desafios'],
    tags: ['celebração', 'vitória', 'reconhecimento'],
  },

  // Reflexão
  {
    id: 'reflect-day',
    title: 'Reflexão do Dia',
    description: 'Encerramento diário com aprendizados.',
    category: 'reflexao',
    prompt: `Reflexão do meu dia:

**O que fiz:** {{realizacoes}}
**O que não consegui:** {{pendencias}}
**Meu nível de energia:** {{energia}}/10

Me ajude a:
1. Identificar padrões do dia
2. Encontrar aprendizados
3. Preparar intenção para amanhã
4. Praticar autocompaixão pelo que ficou pendente`,
    variables: ['realizacoes', 'pendencias', 'energia'],
    tags: ['reflexão', 'diário', 'aprendizado'],
  },

  // Priorização
  {
    id: 'prioritize-eisenhower',
    title: 'Matriz de Eisenhower',
    description: 'Prioriza tarefas por urgência e importância.',
    category: 'priorizacao',
    prompt: `Ajude-me a priorizar estas tarefas usando a Matriz de Eisenhower:

{{lista_tarefas}}

Classifique cada uma em:
- **Fazer agora** (urgente + importante)
- **Agendar** (importante + não urgente)
- **Delegar** (urgente + não importante)
- **Eliminar** (não urgente + não importante)

Explique brevemente cada classificação.`,
    variables: ['lista_tarefas'],
    tags: ['eisenhower', 'priorização', 'matriz'],
  },
  {
    id: 'prioritize-abc',
    title: 'Priorização A-B-C',
    description: 'Sistema Barkley de priorização para TDAH.',
    category: 'priorizacao',
    prompt: `Aplique o sistema A-B-C nestas tarefas para meu ciclo de 3 dias:

{{lista_tarefas}}

Critérios:
- **A (Mínimo viável):** O que DEVE ser feito, sem isso o ciclo falha
- **B (Ideal):** O que DEVERIA ser feito para resultado completo
- **C (Bônus):** O que PODE ser feito se sobrar energia

Para TDAH: Garanta que tarefas A sejam 40% do tempo, B 40%, C 20%.`,
    variables: ['lista_tarefas'],
    tags: ['abc', 'barkley', 'priorização', 'tdah'],
  },

  // Foco
  {
    id: 'focus-pomodoro',
    title: 'Setup Pomodoro Adaptado',
    description: 'Configura sessão Pomodoro para TDAH.',
    category: 'foco',
    prompt: `Configure uma sessão de foco para:

**Tarefa:** {{tarefa}}
**Tempo disponível:** {{tempo_total}} minutos
**Nível de dificuldade:** {{dificuldade}}/10
**Energia atual:** {{energia}}/10

Sugira:
1. Duração ideal dos pomodoros (pode ser menor que 25 min)
2. Tipo de pausa entre pomodoros
3. Recompensa ao final
4. Estratégia para recuperar foco se distrair`,
    variables: ['tarefa', 'tempo_total', 'dificuldade', 'energia'],
    tags: ['pomodoro', 'foco', 'sessão'],
  },
  {
    id: 'focus-environment',
    title: 'Otimizar Ambiente',
    description: 'Prepara ambiente para máximo foco.',
    category: 'foco',
    prompt: `Me ajude a preparar meu ambiente de trabalho para foco:

**Tarefa que vou fazer:** {{tarefa}}
**Ambiente atual:** {{ambiente}}
**Principais distrações:** {{distracoes}}

Sugira:
1. Ajustes físicos no ambiente
2. Configurações digitais (notificações, apps)
3. Ritual de início de foco
4. Âncoras sensoriais (música, cheiro, etc)`,
    variables: ['tarefa', 'ambiente', 'distracoes'],
    tags: ['ambiente', 'foco', 'setup'],
  },
];

// ========================
// Storage Keys
// ========================

const STORAGE_KEYS = {
  PROMPTS: 'prompt_library',
  FAVORITES: 'prompt_favorites',
  USAGE: 'prompt_usage',
  CUSTOM: 'prompt_custom',
};

// ========================
// Hook Principal
// ========================

export function usePromptLibrary(): UsePromptLibraryReturn {
  // Inicializa prompts com defaults + custom
  const [prompts, setPrompts] = useState<PromptTemplate[]>(() => {
    const customPrompts = userPreferences.get<PromptTemplate[]>(STORAGE_KEYS.CUSTOM, []) ?? [];
    const favorites = userPreferences.get<string[]>(STORAGE_KEYS.FAVORITES, []) ?? [];
    const usage = userPreferences.get<Record<string, number>>(STORAGE_KEYS.USAGE, {}) ?? {};

    const defaultPromptsFull: PromptTemplate[] = DEFAULT_PROMPTS.map(p => ({
      ...p,
      usageCount: usage[p.id] || 0,
      isFavorite: favorites.includes(p.id),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isCustom: false,
    }));

    return [...defaultPromptsFull, ...customPrompts];
  });

  const [usageHistory, setUsageHistory] = useState<PromptUsageRecord[]>(() => {
    return userPreferences.get<PromptUsageRecord[]>('prompt_usage_history', []) ?? [];
  });

  // Persiste mudanças
  useEffect(() => {
    const customPrompts = prompts.filter(p => p.isCustom);
    const favorites = prompts.filter(p => p.isFavorite).map(p => p.id);
    const usage: Record<string, number> = {};
    prompts.forEach(p => {
      if (p.usageCount > 0) usage[p.id] = p.usageCount;
    });

    userPreferences.set(STORAGE_KEYS.CUSTOM, customPrompts);
    userPreferences.set(STORAGE_KEYS.FAVORITES, favorites);
    userPreferences.set(STORAGE_KEYS.USAGE, usage);
  }, [prompts]);

  useEffect(() => {
    userPreferences.set('prompt_usage_history', usageHistory.slice(0, 100)); // Mantém últimos 100
  }, [usageHistory]);

  // Favoritos
  const favorites = useMemo(() => prompts.filter(p => p.isFavorite), [prompts]);

  // Recentemente usados
  const recentlyUsed = useMemo(() => {
    const recentIds = usageHistory.slice(0, 10).map(u => u.promptId);
    const uniqueIds = [...new Set(recentIds)];
    return uniqueIds.map(id => prompts.find(p => p.id === id)).filter(Boolean) as PromptTemplate[];
  }, [prompts, usageHistory]);

  // Busca
  const search = useCallback((query: string): PromptTemplate[] => {
    const lowerQuery = query.toLowerCase();
    return prompts.filter(p =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }, [prompts]);

  // Filtro por categoria
  const filterByCategory = useCallback((category: PromptCategory): PromptTemplate[] => {
    return prompts.filter(p => p.category === category);
  }, [prompts]);

  // Filtro por tags
  const filterByTags = useCallback((tags: string[]): PromptTemplate[] => {
    return prompts.filter(p =>
      tags.some(tag => p.tags.includes(tag))
    );
  }, [prompts]);

  // Toggle favorito
  const toggleFavorite = useCallback((id: string) => {
    setPrompts(prev => prev.map(p =>
      p.id === id ? { ...p, isFavorite: !p.isFavorite, updatedAt: Date.now() } : p
    ));
  }, []);

  // Verifica se é favorito
  const isFavorite = useCallback((id: string): boolean => {
    return prompts.find(p => p.id === id)?.isFavorite ?? false;
  }, [prompts]);

  // Usa prompt (substitui variáveis)
  const usePrompt = useCallback((id: string, variables?: Record<string, string>): string => {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return '';

    let result = prompt.prompt;

    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
    }

    // Incrementa contador de uso
    setPrompts(prev => prev.map(p =>
      p.id === id ? { ...p, usageCount: p.usageCount + 1, updatedAt: Date.now() } : p
    ));

    return result;
  }, [prompts]);

  // Registra uso
  const recordUsage = useCallback((id: string, wasHelpful?: boolean) => {
    setUsageHistory(prev => [{
      promptId: id,
      usedAt: Date.now(),
      wasHelpful,
    }, ...prev]);
  }, []);

  // Cria prompt customizado
  const createPrompt = useCallback((
    promptData: Omit<PromptTemplate, 'id' | 'usageCount' | 'isFavorite' | 'createdAt' | 'updatedAt' | 'isCustom'>
  ): PromptTemplate => {
    const newPrompt: PromptTemplate = {
      ...promptData,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      usageCount: 0,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isCustom: true,
    };

    setPrompts(prev => [...prev, newPrompt]);
    return newPrompt;
  }, []);

  // Atualiza prompt
  const updatePrompt = useCallback((id: string, updates: Partial<PromptTemplate>) => {
    setPrompts(prev => prev.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
    ));
  }, []);

  // Deleta prompt (apenas custom)
  const deletePrompt = useCallback((id: string): boolean => {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt?.isCustom) return false;

    setPrompts(prev => prev.filter(p => p.id !== id));
    return true;
  }, [prompts]);

  // Mais usados
  const getMostUsed = useCallback((limit: number = 5): PromptTemplate[] => {
    return [...prompts]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }, [prompts]);

  // Estatísticas de uso
  const getUsageStats = useCallback(() => {
    const total = prompts.reduce((sum, p) => sum + p.usageCount, 0);
    const byCategory: Record<PromptCategory, number> = {
      planejamento: 0,
      desbloqueio: 0,
      decomposicao: 0,
      validacao: 0,
      motivacao: 0,
      reflexao: 0,
      priorizacao: 0,
      foco: 0,
    };

    prompts.forEach(p => {
      byCategory[p.category] += p.usageCount;
    });

    return { total, byCategory };
  }, [prompts]);

  return {
    prompts,
    favorites,
    recentlyUsed,
    search,
    filterByCategory,
    filterByTags,
    toggleFavorite,
    isFavorite,
    usePrompt,
    recordUsage,
    createPrompt,
    updatePrompt,
    deletePrompt,
    getMostUsed,
    getUsageStats,
  };
}

// ========================
// Helpers
// ========================

/**
 * Extrai variáveis de um prompt
 */
export function extractVariables(prompt: string): string[] {
  const matches = prompt.match(/{{(\w+)}}/g) || [];
  return matches.map(m => m.replace(/[{}]/g, ''));
}

/**
 * Obtém cor da categoria
 */
export function getCategoryColor(category: PromptCategory): string {
  const colors: Record<PromptCategory, string> = {
    planejamento: '#6366f1',
    desbloqueio: '#ef4444',
    decomposicao: '#22c55e',
    validacao: '#3b82f6',
    motivacao: '#f97316',
    reflexao: '#8b5cf6',
    priorizacao: '#eab308',
    foco: '#06b6d4',
  };
  return colors[category];
}

/**
 * Obtém emoji da categoria
 */
export function getCategoryEmoji(category: PromptCategory): string {
  const emojis: Record<PromptCategory, string> = {
    planejamento: '📋',
    desbloqueio: '🔓',
    decomposicao: '🧩',
    validacao: '✅',
    motivacao: '🌟',
    reflexao: '🪞',
    priorizacao: '🎯',
    foco: '🧠',
  };
  return emojis[category];
}

export default usePromptLibrary;
