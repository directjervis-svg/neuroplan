/**
 * usePersona Hook - Sistema de Personas C-Level
 *
 * Gerencia diferentes personas/vozes do assistente IA:
 * - CEO: Estratégico, foco em resultados e ROI
 * - COO: Operacional, processos e eficiência
 * - CTO: Técnico, arquitetura e implementação
 * - CMO: Marketing, comunicação e growth
 * - CFO: Financeiro, métricas e custos
 * - Coach: Motivacional, suporte TDAH
 *
 * Cada persona adapta o tom, vocabulário e prioridades das respostas.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { userPreferences } from '@/utils/storage';

// ========================
// Tipos
// ========================

export type PersonaType = 'ceo' | 'coo' | 'cto' | 'cmo' | 'cfo' | 'coach' | 'default';

export interface Persona {
  id: PersonaType;
  name: string;
  title: string;
  emoji: string;
  description: string;
  systemPrompt: string;
  tone: string[];
  priorities: string[];
  vocabulary: string[];
  color: string;
}

export interface PersonaState {
  current: Persona;
  history: PersonaType[];
  isTransitioning: boolean;
}

export interface UsePersonaReturn {
  persona: Persona;
  allPersonas: Persona[];
  setPersona: (id: PersonaType) => void;
  cyclePersona: () => void;
  getPromptPrefix: () => string;
  getFormattedResponse: (response: string) => string;
  isActive: (id: PersonaType) => boolean;
  history: PersonaType[];
  getSuggestedPersona: (context: string) => PersonaType;
}

// ========================
// Definição das Personas
// ========================

const PERSONAS: Record<PersonaType, Persona> = {
  default: {
    id: 'default',
    name: 'Assistente',
    title: 'Assistente NeuroExecução',
    emoji: '🧠',
    description: 'Modo padrão balanceado para todas as situações.',
    systemPrompt: `Você é um assistente de produtividade especializado em TDAH.
Seja direto, use linguagem clara e quebre tarefas complexas em passos simples.
Priorize ação sobre planejamento excessivo.`,
    tone: ['direto', 'claro', 'empático'],
    priorities: ['clareza', 'ação', 'foco'],
    vocabulary: ['tarefa', 'foco', 'próximo passo', 'prioridade'],
    color: '#6366f1',
  },

  ceo: {
    id: 'ceo',
    name: 'CEO',
    title: 'Chief Executive Officer',
    emoji: '👔',
    description: 'Visão estratégica, resultados e tomada de decisão executiva.',
    systemPrompt: `Você é um CEO experiente focado em resultados de alto impacto.
Priorize: ROI, escalabilidade, visão de longo prazo.
Comunique-se de forma executiva e decisiva.
Questione o "porquê" antes do "como".
Foque em outcomes, não outputs.`,
    tone: ['executivo', 'decisivo', 'estratégico'],
    priorities: ['ROI', 'impacto', 'escalabilidade', 'visão'],
    vocabulary: ['estratégia', 'resultado', 'ROI', 'crescimento', 'liderança', 'visão'],
    color: '#1f2937',
  },

  coo: {
    id: 'coo',
    name: 'COO',
    title: 'Chief Operating Officer',
    emoji: '⚙️',
    description: 'Eficiência operacional, processos e execução.',
    systemPrompt: `Você é um COO focado em excelência operacional.
Priorize: eficiência, processos, métricas operacionais.
Otimize fluxos de trabalho e elimine desperdícios.
Foque em execução consistente e previsível.
Estabeleça KPIs claros para cada processo.`,
    tone: ['sistemático', 'eficiente', 'orientado a processos'],
    priorities: ['eficiência', 'processos', 'execução', 'métricas'],
    vocabulary: ['processo', 'otimização', 'SLA', 'throughput', 'workflow', 'KPI'],
    color: '#059669',
  },

  cto: {
    id: 'cto',
    name: 'CTO',
    title: 'Chief Technology Officer',
    emoji: '💻',
    description: 'Arquitetura técnica, inovação e implementação.',
    systemPrompt: `Você é um CTO com expertise em arquitetura de software.
Priorize: qualidade técnica, escalabilidade, manutenibilidade.
Considere trade-offs técnicos em cada decisão.
Sugira soluções elegantes e bem arquitetadas.
Pense em débito técnico e sustentabilidade.`,
    tone: ['técnico', 'analítico', 'inovador'],
    priorities: ['arquitetura', 'qualidade', 'segurança', 'performance'],
    vocabulary: ['arquitetura', 'stack', 'API', 'escalabilidade', 'deploy', 'tech debt'],
    color: '#7c3aed',
  },

  cmo: {
    id: 'cmo',
    name: 'CMO',
    title: 'Chief Marketing Officer',
    emoji: '📢',
    description: 'Marketing, comunicação e crescimento.',
    systemPrompt: `Você é um CMO focado em growth e comunicação.
Priorize: engajamento, conversão, brand awareness.
Pense em narrativas e storytelling.
Considere o público-alvo em cada decisão.
Foque em métricas de growth e funil.`,
    tone: ['criativo', 'persuasivo', 'orientado a growth'],
    priorities: ['growth', 'engajamento', 'conversão', 'brand'],
    vocabulary: ['conversão', 'funil', 'CAC', 'LTV', 'engagement', 'awareness'],
    color: '#db2777',
  },

  cfo: {
    id: 'cfo',
    name: 'CFO',
    title: 'Chief Financial Officer',
    emoji: '💰',
    description: 'Análise financeira, custos e métricas.',
    systemPrompt: `Você é um CFO focado em saúde financeira.
Priorize: redução de custos, ROI, sustentabilidade financeira.
Analise sempre o custo-benefício de cada ação.
Considere riscos financeiros e cash flow.
Foque em métricas financeiras e unit economics.`,
    tone: ['analítico', 'conservador', 'orientado a dados'],
    priorities: ['custos', 'ROI', 'cash flow', 'riscos'],
    vocabulary: ['ROI', 'margem', 'burn rate', 'runway', 'unit economics', 'EBITDA'],
    color: '#ca8a04',
  },

  coach: {
    id: 'coach',
    name: 'Coach TDAH',
    title: 'Neuro-Coach Especializado',
    emoji: '🌟',
    description: 'Suporte motivacional e técnicas específicas para TDAH.',
    systemPrompt: `Você é um coach especializado em TDAH e neurodivergência.
Priorize: motivação, autocompaixão, técnicas adaptativas.
Use linguagem encorajadora e celebre pequenas vitórias.
Normalize desafios do TDAH sem minimizá-los.
Sugira técnicas baseadas em evidências (Barkley, etc).
Foque em sistemas, não força de vontade.`,
    tone: ['encorajador', 'empático', 'celebratório'],
    priorities: ['motivação', 'sistemas', 'autocompaixão', 'celebração'],
    vocabulary: ['vitória', 'progresso', 'sistema', 'você conseguiu', 'um passo de cada vez'],
    color: '#f97316',
  },
};

// ========================
// Hook Principal
// ========================

const STORAGE_KEY = 'active_persona';
const HISTORY_KEY = 'persona_history';

export function usePersona(): UsePersonaReturn {
  // Estado
  const [currentId, setCurrentId] = useState<PersonaType>(() => {
    return userPreferences.get<PersonaType>(STORAGE_KEY, 'default') ?? 'default';
  });

  const [history, setHistory] = useState<PersonaType[]>(() => {
    return userPreferences.get<PersonaType[]>(HISTORY_KEY, []) ?? [];
  });

  // Persona atual
  const persona = useMemo(() => PERSONAS[currentId], [currentId]);

  // Lista de todas as personas
  const allPersonas = useMemo(() => Object.values(PERSONAS), []);

  // Persiste mudanças
  useEffect(() => {
    userPreferences.set(STORAGE_KEY, currentId);
    userPreferences.set(HISTORY_KEY, history);
  }, [currentId, history]);

  // Define persona
  const setPersona = useCallback((id: PersonaType) => {
    if (PERSONAS[id]) {
      setHistory(prev => {
        const newHistory = [currentId, ...prev.filter(p => p !== currentId)].slice(0, 5);
        return newHistory;
      });
      setCurrentId(id);
    }
  }, [currentId]);

  // Cicla entre personas
  const cyclePersona = useCallback(() => {
    const ids = Object.keys(PERSONAS) as PersonaType[];
    const currentIndex = ids.indexOf(currentId);
    const nextIndex = (currentIndex + 1) % ids.length;
    setPersona(ids[nextIndex]);
  }, [currentId, setPersona]);

  // Gera prefixo do prompt baseado na persona
  const getPromptPrefix = useCallback(() => {
    const p = PERSONAS[currentId];
    return `[Modo ${p.name}] ${p.systemPrompt}\n\nTom: ${p.tone.join(', ')}.\nPrioridades: ${p.priorities.join(', ')}.\n\n`;
  }, [currentId]);

  // Formata resposta de acordo com a persona
  const getFormattedResponse = useCallback((response: string) => {
    const p = PERSONAS[currentId];

    // Adiciona emoji e formatação baseada na persona
    if (currentId === 'coach') {
      // Coach adiciona encorajamentos
      const encouragements = ['🌟', '💪', '✨', '🎯', '🏆'];
      const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
      return `${randomEncouragement} ${response}`;
    }

    if (currentId === 'ceo') {
      // CEO adiciona foco em resultado
      return `📊 ${response}`;
    }

    return `${p.emoji} ${response}`;
  }, [currentId]);

  // Verifica se persona está ativa
  const isActive = useCallback((id: PersonaType) => {
    return currentId === id;
  }, [currentId]);

  // Sugere persona baseada no contexto
  const getSuggestedPersona = useCallback((context: string): PersonaType => {
    const lowerContext = context.toLowerCase();

    // Padrões para cada persona
    const patterns: Record<PersonaType, string[]> = {
      ceo: ['estratégia', 'visão', 'decisão', 'resultado', 'roi', 'negócio'],
      coo: ['processo', 'eficiência', 'operação', 'workflow', 'otimizar'],
      cto: ['código', 'técnico', 'arquitetura', 'api', 'deploy', 'bug'],
      cmo: ['marketing', 'growth', 'conversão', 'campanha', 'funil'],
      cfo: ['custo', 'orçamento', 'financeiro', 'investimento', 'margem'],
      coach: ['motivação', 'difícil', 'bloqueio', 'procrastinação', 'tdah', 'foco'],
      default: [],
    };

    for (const [personaId, keywords] of Object.entries(patterns)) {
      if (keywords.some(kw => lowerContext.includes(kw))) {
        return personaId as PersonaType;
      }
    }

    return 'default';
  }, []);

  return {
    persona,
    allPersonas,
    setPersona,
    cyclePersona,
    getPromptPrefix,
    getFormattedResponse,
    isActive,
    history,
    getSuggestedPersona,
  };
}

// ========================
// Componentes Helper
// ========================

/**
 * Obtém a cor da persona para UI
 */
export function getPersonaColor(id: PersonaType): string {
  return PERSONAS[id]?.color || PERSONAS.default.color;
}

/**
 * Obtém o emoji da persona
 */
export function getPersonaEmoji(id: PersonaType): string {
  return PERSONAS[id]?.emoji || PERSONAS.default.emoji;
}

/**
 * Verifica se é uma persona C-Level
 */
export function isCLevelPersona(id: PersonaType): boolean {
  return ['ceo', 'coo', 'cto', 'cmo', 'cfo'].includes(id);
}

/**
 * Obtém todas as personas C-Level
 */
export function getCLevelPersonas(): Persona[] {
  return Object.values(PERSONAS).filter(p => isCLevelPersona(p.id));
}

export default usePersona;
