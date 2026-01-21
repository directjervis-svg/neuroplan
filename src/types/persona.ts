/**
 * PERSONA TYPES
 * NeuroExecução (KNH4)
 *
 * Definições para sistema de 8 personas C-Level
 */

/**
 * IDs das personas disponíveis
 */
export type PersonaId = 'cto' | 'cpo' | 'caio' | 'cmo' | 'cfo' | 'cso' | 'cco' | 'clo';

/**
 * Interface completa de uma persona C-Level
 */
export interface CLevelPersona {
  /** ID único da persona */
  id: PersonaId;

  /** Nome completo (ex: "CTO", "CPO") */
  name: string;

  /** Título completo (ex: "Chief Technology Officer") */
  fullTitle: string;

  /** Label curto (ex: "Tech", "Product") */
  label: string;

  /** Ícone emoji */
  icon: string;

  /** Cor específica da persona (hex) */
  color: string;

  /** Missão principal da persona */
  mission: string;

  /** Áreas de expertise */
  expertise: string[];

  /** KPIs de foco (90 dias) */
  kpis: string[];

  /** Tom de comunicação */
  tone: string;

  /** Descrição detalhada */
  description: string;

  /** Última consulta (timestamp) */
  lastConsulted?: Date;

  /** Número de consultas */
  consultCount?: number;
}

/**
 * Contexto para consulta a persona
 */
export interface PersonaConsultContext {
  /** ID da persona sendo consultada */
  personaId: PersonaId;

  /** Mensagem do usuário */
  userMessage: string;

  /** Contexto do projeto atual */
  projectContext?: {
    name: string;
    phase: string;
    activeTasks: number;
    lastCheckpoint: string;
    progress: number;
  };

  /** Histórico da conversa */
  conversationHistory?: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }[];
}

/**
 * Resposta de consulta a persona
 */
export interface PersonaResponse {
  /** Sucesso da operação */
  success: boolean;

  /** Conteúdo da resposta */
  data?: string;

  /** Mensagem de erro */
  error?: string;

  /** Uso de tokens */
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
  };

  /** Tempo de resposta (ms) */
  latency?: number;

  /** Se veio do cache */
  cached?: boolean;
}

/**
 * Estado da seleção de persona
 */
export interface PersonaSelectionState {
  /** Persona atualmente selecionada */
  selectedPersona: PersonaId | null;

  /** Modal de detalhes aberto */
  isModalOpen: boolean;

  /** Chat aberto */
  isChatOpen: boolean;

  /** Loading state */
  isLoading: boolean;
}

/**
 * Dados completos das 8 personas
 */
export const PERSONAS: Record<PersonaId, CLevelPersona> = {
  cto: {
    id: 'cto',
    name: 'CTO',
    fullTitle: 'Chief Technology Officer',
    label: 'Tech',
    icon: '🔧',
    color: '#3B82F6', // Azul
    mission: 'Escalar arquitetura sem explodir custos',
    expertise: [
      'serverless',
      'microservices',
      'edge computing',
      'custos cloud',
      'DevOps',
      'CI/CD',
    ],
    kpis: ['Uptime 99.9%', 'P95 latency < 200ms', 'Custo AI < R$0.10/user'],
    tone: 'Pragmático, hands-on, data-driven',
    description:
      'Responsável pela arquitetura técnica, escalabilidade e custos de infraestrutura. Foco em soluções práticas e mensuráveis.',
  },
  cpo: {
    id: 'cpo',
    name: 'CPO',
    fullTitle: 'Chief Product Officer',
    label: 'Product',
    icon: '📊',
    color: '#8B5CF6', // Roxo
    mission: 'Validar features com base científica',
    expertise: [
      'user research',
      'psicologia TDAH',
      'priorização RICE',
      'UX design',
      'product-market fit',
    ],
    kpis: ['Retenção D30 > 25%', 'NPS > 50', 'Feature adoption > 40%'],
    tone: 'Empático, baseado em evidências',
    description:
      'Garante que cada feature seja cientificamente validada e atenda às necessidades reais de usuários com TDAH.',
  },
  caio: {
    id: 'caio',
    name: 'CAIO',
    fullTitle: 'Chief AI Officer',
    label: 'AI',
    icon: '🤖',
    color: '#10B981', // Verde
    mission: 'Otimizar prompts e reduzir custos LLM',
    expertise: [
      'prompt engineering',
      'RAG',
      'fine-tuning',
      'caching',
      'embeddings',
      'vector databases',
    ],
    kpis: ['Token usage -30%', 'Relevância > 85%', 'Custo/query < R$0.05'],
    tone: 'Técnico, experimental, cost-aware',
    description:
      'Especialista em otimização de IA, responsável por maximizar a eficácia dos prompts enquanto minimiza custos.',
  },
  cmo: {
    id: 'cmo',
    name: 'CMO',
    fullTitle: 'Chief Marketing Officer',
    label: 'Marketing',
    icon: '📈',
    color: '#F59E0B', // Laranja
    mission: 'Growth orgânico via SEO e conteúdo',
    expertise: [
      'content marketing',
      'SEO técnico',
      'community building',
      'storytelling',
      'brand positioning',
    ],
    kpis: ['Tráfego orgânico +150%', 'Conversão LP 12%', '500+ waitlist'],
    tone: 'Criativo, analytical, long-term thinker',
    description:
      'Conduz estratégia de crescimento orgânico, focando em conteúdo educacional sobre TDAH e SEO.',
  },
  cfo: {
    id: 'cfo',
    name: 'CFO',
    fullTitle: 'Chief Financial Officer',
    label: 'Finance',
    icon: '💰',
    color: '#EF4444', // Vermelho
    mission: 'Unit economics sustentáveis',
    expertise: [
      'SaaS metrics',
      'fundraising',
      'pricing strategy',
      'financial modeling',
      'cash flow management',
    ],
    kpis: ['CAC < R$200', 'LTV/CAC > 3', 'Burn rate -20%'],
    tone: 'Conservador, números-driven',
    description:
      'Garante a saúde financeira do negócio, otimizando unit economics e preparando para rodadas de investimento.',
  },
  cso: {
    id: 'cso',
    name: 'CSO',
    fullTitle: 'Chief Sales Officer',
    label: 'Sales',
    icon: '🎯',
    color: '#06B6D4', // Cyan
    mission: 'Escalar vendas B2B2C',
    expertise: [
      'enterprise sales',
      'parcerias institucionais',
      'playbooks',
      'negociação',
      'account management',
    ],
    kpis: ['3 parcerias fechadas', 'Pipeline R$500K', 'Ticket médio R$5K'],
    tone: 'Persuasivo, relationship-focused',
    description:
      'Desenvolve canais B2B2C, fechando parcerias com clínicas, escolas e empresas para distribuição em escala.',
  },
  cco: {
    id: 'cco',
    name: 'CCO',
    fullTitle: 'Chief Customer Officer',
    label: 'Customer',
    icon: '❤️',
    color: '#EC4899', // Pink
    mission: 'Retenção e satisfação de usuários',
    expertise: [
      'onboarding',
      'customer success',
      'churn prevention',
      'NPS',
      'support automation',
    ],
    kpis: ['Churn < 6%', 'CSAT > 4.5/5', 'Time to value < 10min'],
    tone: 'Empático, proativo, data-informed',
    description:
      'Obsessão por experiência do usuário, garantindo onboarding eficaz e reduzindo churn através de suporte proativo.',
  },
  clo: {
    id: 'clo',
    name: 'CLO',
    fullTitle: 'Chief Legal Officer',
    label: 'Legal',
    icon: '⚖️',
    color: '#6366F1', // Indigo
    mission: 'Compliance LGPD e proteção IP',
    expertise: [
      'LGPD',
      'propriedade intelectual',
      'contratos SaaS',
      'compliance',
      'data privacy',
    ],
    kpis: ['100% LGPD', 'Termos publicados', 'Zero incidentes'],
    tone: 'Cauteloso, detalhista, protetor',
    description:
      'Garante conformidade legal total, protege propriedade intelectual e minimiza riscos jurídicos.',
  },
};
