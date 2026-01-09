/**
 * Gamification Service
 * Implements XP, levels, streaks, and badges system
 * Designed to compensate dopamine deficit through micro-rewards (Barkley-aligned)
 */

import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { 
  userGamification, 
  badgeDefinitions, 
  userBadges, 
  xpTransactions,
  onboardingProgress,
  projectTemplates
} from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// XP rewards configuration
const XP_REWARDS = {
  TASK_COMPLETED: 25,
  PROJECT_COMPLETED: 100,
  FOCUS_SESSION_15MIN: 15,
  FOCUS_SESSION_30MIN: 35,
  FOCUS_SESSION_60MIN: 80,
  IDEA_CAPTURED: 5,
  STREAK_DAY: 10,
  STREAK_WEEK: 50,
  STREAK_MONTH: 200,
  FIRST_PROJECT: 50,
  FIRST_TASK: 25,
  FIRST_FOCUS: 30,
};

// Level thresholds (XP required for each level)
const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  850,    // Level 5
  1300,   // Level 6
  1900,   // Level 7
  2700,   // Level 8
  3700,   // Level 9
  5000,   // Level 10
  6500,   // Level 11
  8500,   // Level 12
  11000,  // Level 13
  14000,  // Level 14
  18000,  // Level 15
  23000,  // Level 16
  29000,  // Level 17
  36000,  // Level 18
  45000,  // Level 19
  55000,  // Level 20
];

// Default badge definitions
const DEFAULT_BADGES = [
  // Streak badges
  { code: "STREAK_3", name: "Iniciante Consistente", description: "3 dias consecutivos de atividade", icon: "Flame", color: "#FF8C42", category: "STREAK" as const, threshold: 3, xpReward: 30, rarity: "COMMON" as const },
  { code: "STREAK_7", name: "Semana Focada", description: "7 dias consecutivos de atividade", icon: "Flame", color: "#FF6B35", category: "STREAK" as const, threshold: 7, xpReward: 75, rarity: "UNCOMMON" as const },
  { code: "STREAK_14", name: "Quinzena de Ouro", description: "14 dias consecutivos de atividade", icon: "Flame", color: "#F97316", category: "STREAK" as const, threshold: 14, xpReward: 150, rarity: "RARE" as const },
  { code: "STREAK_30", name: "Mês de Ferro", description: "30 dias consecutivos de atividade", icon: "Flame", color: "#EA580C", category: "STREAK" as const, threshold: 30, xpReward: 300, rarity: "EPIC" as const },
  { code: "STREAK_100", name: "Centurião", description: "100 dias consecutivos de atividade", icon: "Crown", color: "#DC2626", category: "STREAK" as const, threshold: 100, xpReward: 1000, rarity: "LEGENDARY" as const },
  
  // Task badges
  { code: "TASKS_10", name: "Executor", description: "Complete 10 tarefas", icon: "CheckCircle", color: "#22C55E", category: "TASKS" as const, threshold: 10, xpReward: 50, rarity: "COMMON" as const },
  { code: "TASKS_50", name: "Produtivo", description: "Complete 50 tarefas", icon: "CheckCircle2", color: "#16A34A", category: "TASKS" as const, threshold: 50, xpReward: 150, rarity: "UNCOMMON" as const },
  { code: "TASKS_100", name: "Máquina de Execução", description: "Complete 100 tarefas", icon: "Zap", color: "#15803D", category: "TASKS" as const, threshold: 100, xpReward: 300, rarity: "RARE" as const },
  { code: "TASKS_500", name: "Mestre da Ação", description: "Complete 500 tarefas", icon: "Trophy", color: "#166534", category: "TASKS" as const, threshold: 500, xpReward: 750, rarity: "EPIC" as const },
  
  // Project badges
  { code: "PROJECTS_1", name: "Primeiro Passo", description: "Complete seu primeiro projeto", icon: "Target", color: "#22C55E", category: "PROJECTS" as const, threshold: 1, xpReward: 100, rarity: "COMMON" as const },
  { code: "PROJECTS_5", name: "Realizador", description: "Complete 5 projetos", icon: "Target", color: "#16A34A", category: "PROJECTS" as const, threshold: 5, xpReward: 250, rarity: "UNCOMMON" as const },
  { code: "PROJECTS_10", name: "Conquistador", description: "Complete 10 projetos", icon: "Award", color: "#15803D", category: "PROJECTS" as const, threshold: 10, xpReward: 500, rarity: "RARE" as const },
  
  // Focus badges
  { code: "FOCUS_60", name: "Foco Inicial", description: "Acumule 60 minutos de foco", icon: "Timer", color: "#FF8C42", category: "FOCUS" as const, threshold: 60, xpReward: 40, rarity: "COMMON" as const },
  { code: "FOCUS_300", name: "Concentrado", description: "Acumule 5 horas de foco", icon: "Timer", color: "#F97316", category: "FOCUS" as const, threshold: 300, xpReward: 100, rarity: "UNCOMMON" as const },
  { code: "FOCUS_1000", name: "Zen Master", description: "Acumule 16+ horas de foco", icon: "Brain", color: "#EA580C", category: "FOCUS" as const, threshold: 1000, xpReward: 300, rarity: "RARE" as const },
  
  // Ideas badges
  { code: "IDEAS_10", name: "Pensador", description: "Capture 10 ideias rápidas", icon: "Lightbulb", color: "#FBBF24", category: "IDEAS" as const, threshold: 10, xpReward: 30, rarity: "COMMON" as const },
  { code: "IDEAS_50", name: "Criativo", description: "Capture 50 ideias rápidas", icon: "Lightbulb", color: "#F59E0B", category: "IDEAS" as const, threshold: 50, xpReward: 100, rarity: "UNCOMMON" as const },
  { code: "IDEAS_100", name: "Visionário", description: "Capture 100 ideias rápidas", icon: "Sparkles", color: "#D97706", category: "IDEAS" as const, threshold: 100, xpReward: 250, rarity: "RARE" as const },
  
  // Special badges
  { code: "EARLY_ADOPTER", name: "Early Adopter", description: "Um dos primeiros usuários do NeuroPlan", icon: "Rocket", color: "#8B5CF6", category: "SPECIAL" as const, threshold: 1, xpReward: 100, rarity: "EPIC" as const },
  { code: "ONBOARDING_COMPLETE", name: "Pronto para Ação", description: "Complete o tour de boas-vindas", icon: "GraduationCap", color: "#22C55E", category: "SPECIAL" as const, threshold: 1, xpReward: 50, rarity: "COMMON" as const },
];

// Default project templates
const DEFAULT_TEMPLATES = [
  {
    name: "Planejamento de Conteúdo",
    description: "Template para criadores de conteúdo: posts, vídeos, podcasts",
    icon: "PenTool",
    color: "#EC4899",
    category: "CONTENT" as const,
    defaultBriefing: "Criar [tipo de conteúdo] sobre [tema] para [plataforma] com objetivo de [meta]",
    defaultDeliverableA: "Rascunho básico do conteúdo",
    defaultDeliverableB: "Conteúdo finalizado e revisado",
    defaultDeliverableC: "Conteúdo + materiais de apoio + agendamento",
    defaultCycleDuration: "DAYS_3" as const,
    defaultTasks: JSON.stringify([
      { title: "Pesquisar referências sobre o tema", dayNumber: 1, position: 1, type: "ACTION" },
      { title: "Criar outline/roteiro do conteúdo", dayNumber: 1, position: 2, type: "ACTION" },
      { title: "Separar materiais de apoio (imagens, dados)", dayNumber: 1, position: 3, type: "ACTION" },
      { title: "Preparar ambiente para produção", dayNumber: 1, position: 4, type: "RETENTION" },
      { title: "Produzir o conteúdo principal", dayNumber: 2, position: 1, type: "ACTION" },
      { title: "Revisar e editar", dayNumber: 2, position: 2, type: "ACTION" },
      { title: "Criar thumbnail/capa", dayNumber: 2, position: 3, type: "ACTION" },
      { title: "Preparar descrição e hashtags", dayNumber: 2, position: 4, type: "RETENTION" },
      { title: "Publicar e agendar", dayNumber: 3, position: 1, type: "ACTION" },
      { title: "Responder primeiros comentários", dayNumber: 3, position: 2, type: "ACTION" },
      { title: "Analisar métricas iniciais", dayNumber: 3, position: 3, type: "ACTION" },
    ]),
    isPremium: false,
  },
  {
    name: "Desenvolvimento de Software",
    description: "Template para desenvolvedores: features, bugs, sprints",
    icon: "Code",
    color: "#3B82F6",
    category: "SOFTWARE" as const,
    defaultBriefing: "Desenvolver [feature/correção] para [projeto] usando [tecnologia] com deadline [data]",
    defaultDeliverableA: "Código funcional básico",
    defaultDeliverableB: "Código com testes e documentação",
    defaultDeliverableC: "Código + testes + docs + deploy + métricas",
    defaultCycleDuration: "DAYS_7" as const,
    defaultTasks: JSON.stringify([
      { title: "Analisar requisitos e criar tasks no board", dayNumber: 1, position: 1, type: "ACTION" },
      { title: "Configurar ambiente de desenvolvimento", dayNumber: 1, position: 2, type: "ACTION" },
      { title: "Criar branch e estrutura inicial", dayNumber: 1, position: 3, type: "ACTION" },
      { title: "Revisar arquitetura proposta", dayNumber: 1, position: 4, type: "RETENTION" },
      { title: "Implementar lógica principal", dayNumber: 2, position: 1, type: "ACTION" },
      { title: "Criar testes unitários", dayNumber: 2, position: 2, type: "ACTION" },
      { title: "Integrar com APIs/serviços", dayNumber: 2, position: 3, type: "ACTION" },
      { title: "Documentar decisões técnicas", dayNumber: 2, position: 4, type: "RETENTION" },
      { title: "Code review e ajustes", dayNumber: 3, position: 1, type: "ACTION" },
      { title: "Testes de integração", dayNumber: 3, position: 2, type: "ACTION" },
      { title: "Deploy em staging", dayNumber: 3, position: 3, type: "ACTION" },
    ]),
    isPremium: false,
  },
  {
    name: "Trabalho Acadêmico",
    description: "Template para estudantes: artigos, TCC, dissertações",
    icon: "GraduationCap",
    color: "#8B5CF6",
    category: "ACADEMIC" as const,
    defaultBriefing: "Escrever [tipo de trabalho] sobre [tema] com [X] páginas para [disciplina/orientador]",
    defaultDeliverableA: "Estrutura e introdução",
    defaultDeliverableB: "Texto completo em rascunho",
    defaultDeliverableC: "Texto revisado + formatação ABNT + referências",
    defaultCycleDuration: "DAYS_7" as const,
    defaultTasks: JSON.stringify([
      { title: "Definir tema e problema de pesquisa", dayNumber: 1, position: 1, type: "ACTION" },
      { title: "Pesquisar referências bibliográficas", dayNumber: 1, position: 2, type: "ACTION" },
      { title: "Criar fichamento das fontes principais", dayNumber: 1, position: 3, type: "ACTION" },
      { title: "Organizar pasta de referências", dayNumber: 1, position: 4, type: "RETENTION" },
      { title: "Escrever introdução e objetivos", dayNumber: 2, position: 1, type: "ACTION" },
      { title: "Desenvolver fundamentação teórica", dayNumber: 2, position: 2, type: "ACTION" },
      { title: "Escrever metodologia", dayNumber: 2, position: 3, type: "ACTION" },
      { title: "Revisar coerência do texto", dayNumber: 2, position: 4, type: "RETENTION" },
      { title: "Escrever resultados/discussão", dayNumber: 3, position: 1, type: "ACTION" },
      { title: "Escrever conclusão", dayNumber: 3, position: 2, type: "ACTION" },
      { title: "Formatar referências ABNT", dayNumber: 3, position: 3, type: "ACTION" },
    ]),
    isPremium: false,
  },
  {
    name: "Meta de Saúde",
    description: "Template para hábitos saudáveis: exercícios, dieta, sono",
    icon: "Heart",
    color: "#EF4444",
    category: "HEALTH" as const,
    defaultBriefing: "Estabelecer rotina de [hábito] com frequência [X vezes por semana] por [período]",
    defaultDeliverableA: "Completar 3 dias do hábito",
    defaultDeliverableB: "Manter consistência por 1 semana",
    defaultDeliverableC: "Criar rotina sustentável + métricas de progresso",
    defaultCycleDuration: "DAYS_7" as const,
    defaultTasks: JSON.stringify([
      { title: "Definir horário fixo para o hábito", dayNumber: 1, position: 1, type: "ACTION" },
      { title: "Preparar ambiente/materiais necessários", dayNumber: 1, position: 2, type: "ACTION" },
      { title: "Executar primeira sessão (versão mínima)", dayNumber: 1, position: 3, type: "ACTION" },
      { title: "Registrar como se sentiu", dayNumber: 1, position: 4, type: "RETENTION" },
      { title: "Executar segunda sessão", dayNumber: 2, position: 1, type: "ACTION" },
      { title: "Ajustar intensidade se necessário", dayNumber: 2, position: 2, type: "ACTION" },
      { title: "Identificar gatilhos/obstáculos", dayNumber: 2, position: 3, type: "ACTION" },
      { title: "Planejar semana seguinte", dayNumber: 2, position: 4, type: "RETENTION" },
      { title: "Executar terceira sessão", dayNumber: 3, position: 1, type: "ACTION" },
      { title: "Celebrar pequena vitória", dayNumber: 3, position: 2, type: "ACTION" },
      { title: "Revisar progresso e ajustar metas", dayNumber: 3, position: 3, type: "ACTION" },
    ]),
    isPremium: false,
  },
  {
    name: "Projeto Pessoal",
    description: "Template genérico para qualquer projeto pessoal",
    icon: "User",
    color: "#22C55E",
    category: "PERSONAL" as const,
    defaultBriefing: "Realizar [objetivo] até [data] para [benefício esperado]",
    defaultDeliverableA: "Primeiro passo concreto dado",
    defaultDeliverableB: "50% do projeto concluído",
    defaultDeliverableC: "Projeto 100% finalizado",
    defaultCycleDuration: "DAYS_3" as const,
    defaultTasks: JSON.stringify([
      { title: "Definir escopo claro do projeto", dayNumber: 1, position: 1, type: "ACTION" },
      { title: "Listar recursos necessários", dayNumber: 1, position: 2, type: "ACTION" },
      { title: "Executar primeira ação concreta", dayNumber: 1, position: 3, type: "ACTION" },
      { title: "Preparar próximo passo", dayNumber: 1, position: 4, type: "RETENTION" },
      { title: "Continuar execução principal", dayNumber: 2, position: 1, type: "ACTION" },
      { title: "Resolver bloqueios identificados", dayNumber: 2, position: 2, type: "ACTION" },
      { title: "Validar progresso com critérios", dayNumber: 2, position: 3, type: "ACTION" },
      { title: "Ajustar plano se necessário", dayNumber: 2, position: 4, type: "RETENTION" },
      { title: "Finalizar entregas pendentes", dayNumber: 3, position: 1, type: "ACTION" },
      { title: "Revisar qualidade final", dayNumber: 3, position: 2, type: "ACTION" },
      { title: "Documentar aprendizados", dayNumber: 3, position: 3, type: "ACTION" },
    ]),
    isPremium: false,
  },
  {
    name: "Lançamento de Produto",
    description: "Template para empreendedores: MVP, lançamentos, campanhas",
    icon: "Rocket",
    color: "#F97316",
    category: "PROFESSIONAL" as const,
    defaultBriefing: "Lançar [produto/serviço] para [público-alvo] com meta de [resultado] até [data]",
    defaultDeliverableA: "Landing page + lista de espera",
    defaultDeliverableB: "MVP funcional + primeiros usuários",
    defaultDeliverableC: "Produto + marketing + métricas + feedback loop",
    defaultCycleDuration: "DAYS_14" as const,
    defaultTasks: JSON.stringify([
      { title: "Validar proposta de valor com 5 pessoas", dayNumber: 1, position: 1, type: "ACTION" },
      { title: "Definir features do MVP", dayNumber: 1, position: 2, type: "ACTION" },
      { title: "Criar wireframes básicos", dayNumber: 1, position: 3, type: "ACTION" },
      { title: "Pesquisar ferramentas no-code", dayNumber: 1, position: 4, type: "RETENTION" },
      { title: "Construir landing page", dayNumber: 2, position: 1, type: "ACTION" },
      { title: "Configurar formulário de captura", dayNumber: 2, position: 2, type: "ACTION" },
      { title: "Escrever copy de vendas", dayNumber: 2, position: 3, type: "ACTION" },
      { title: "Preparar primeiros posts de divulgação", dayNumber: 2, position: 4, type: "RETENTION" },
      { title: "Desenvolver MVP core", dayNumber: 3, position: 1, type: "ACTION" },
      { title: "Testar fluxo principal", dayNumber: 3, position: 2, type: "ACTION" },
      { title: "Convidar beta testers", dayNumber: 3, position: 3, type: "ACTION" },
    ]),
    isPremium: true,
  },
];

// Helper function to calculate level from XP
function calculateLevel(totalXp: number): { level: number; xpToNext: number; progress: number } {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  
  const currentLevelXp = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelXp = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 10000;
  const xpInCurrentLevel = totalXp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  const progress = Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100);
  
  return {
    level,
    xpToNext: nextLevelXp - totalXp,
    progress,
  };
}

// Helper to check and update streak
function checkStreak(lastActiveDate: Date | null): { newStreak: number; streakBroken: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!lastActiveDate) {
    return { newStreak: 1, streakBroken: false };
  }
  
  const lastActive = new Date(lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Same day, no change
    return { newStreak: 0, streakBroken: false }; // 0 means no update needed
  } else if (diffDays === 1) {
    // Consecutive day
    return { newStreak: 1, streakBroken: false }; // Increment by 1
  } else {
    // Streak broken
    return { newStreak: 1, streakBroken: true }; // Reset to 1
  }
}

export const gamificationRouter = router({
  // Get user's gamification stats
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // Get or create gamification record
    let stats = await db.select().from(userGamification).where(eq(userGamification.userId, ctx.user.id)).limit(1);
    
    if (stats.length === 0) {
      await db.insert(userGamification).values({ userId: ctx.user.id });
      stats = await db.select().from(userGamification).where(eq(userGamification.userId, ctx.user.id)).limit(1);
    }
    
    const userStats = stats[0];
    const levelInfo = calculateLevel(userStats.totalXp || 0);
    
    return {
      ...userStats,
      ...levelInfo,
    };
  }),
  
  // Award XP to user
  awardXp: protectedProcedure
    .input(z.object({
      amount: z.number().positive(),
      reason: z.string(),
      sourceType: z.enum(["TASK", "PROJECT", "FOCUS", "IDEA", "BADGE", "STREAK", "BONUS"]),
      sourceId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Record transaction
      await db.insert(xpTransactions).values({
        userId: ctx.user.id,
        amount: input.amount,
        reason: input.reason,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
      });
      
      // Update user stats
      const stats = await db.select().from(userGamification).where(eq(userGamification.userId, ctx.user.id)).limit(1);
      
      if (stats.length === 0) {
        await db.insert(userGamification).values({ 
          userId: ctx.user.id,
          totalXp: input.amount,
        });
      } else {
        const newTotalXp = (stats[0].totalXp || 0) + input.amount;
        const levelInfo = calculateLevel(newTotalXp);
        
        await db.update(userGamification)
          .set({ 
            totalXp: newTotalXp,
            currentLevel: levelInfo.level,
            xpToNextLevel: levelInfo.xpToNext,
          })
          .where(eq(userGamification.userId, ctx.user.id));
      }
      
      return { success: true, amount: input.amount };
    }),
  
  // Update streak
  updateStreak: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const stats = await db.select().from(userGamification).where(eq(userGamification.userId, ctx.user.id)).limit(1);
    
    if (stats.length === 0) {
      await db.insert(userGamification).values({ 
        userId: ctx.user.id,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: new Date(),
      });
      return { currentStreak: 1, streakBroken: false, xpEarned: XP_REWARDS.STREAK_DAY };
    }
    
    const userStats = stats[0];
    const { newStreak, streakBroken } = checkStreak(userStats.lastActiveDate);
    
    if (newStreak === 0) {
      // Same day, no update
      return { currentStreak: userStats.currentStreak, streakBroken: false, xpEarned: 0 };
    }
    
    const updatedStreak = streakBroken ? 1 : (userStats.currentStreak || 0) + 1;
    const longestStreak = Math.max(updatedStreak, userStats.longestStreak || 0);
    
    await db.update(userGamification)
      .set({
        currentStreak: updatedStreak,
        longestStreak,
        lastActiveDate: new Date(),
      })
      .where(eq(userGamification.userId, ctx.user.id));
    
    // Award streak XP
    let xpEarned = XP_REWARDS.STREAK_DAY;
    if (updatedStreak % 7 === 0) xpEarned += XP_REWARDS.STREAK_WEEK;
    if (updatedStreak % 30 === 0) xpEarned += XP_REWARDS.STREAK_MONTH;
    
    if (xpEarned > 0) {
      await db.insert(xpTransactions).values({
        userId: ctx.user.id,
        amount: xpEarned,
        reason: `Streak de ${updatedStreak} dias`,
        sourceType: "STREAK",
      });
      
      await db.update(userGamification)
        .set({ totalXp: sql`${userGamification.totalXp} + ${xpEarned}` })
        .where(eq(userGamification.userId, ctx.user.id));
    }
    
    return { currentStreak: updatedStreak, streakBroken, xpEarned };
  }),
  
  // Get all badges
  getAllBadges: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const badges = await db.select().from(badgeDefinitions);
    const userBadgesList = await db.select().from(userBadges).where(eq(userBadges.userId, ctx.user.id));
    
    const earnedBadgeIds = new Set(userBadgesList.map(b => b.badgeId));
    
    return badges.map(badge => ({
      ...badge,
      earned: earnedBadgeIds.has(badge.id),
      earnedAt: userBadgesList.find(ub => ub.badgeId === badge.id)?.earnedAt,
    }));
  }),
  
  // Get user's earned badges
  getEarnedBadges: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const earned = await db
      .select({
        badge: badgeDefinitions,
        earnedAt: userBadges.earnedAt,
      })
      .from(userBadges)
      .innerJoin(badgeDefinitions, eq(userBadges.badgeId, badgeDefinitions.id))
      .where(eq(userBadges.userId, ctx.user.id))
      .orderBy(desc(userBadges.earnedAt));
    
    return earned;
  }),
  
  // Check and award badges
  checkBadges: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const stats = await db.select().from(userGamification).where(eq(userGamification.userId, ctx.user.id)).limit(1);
    if (stats.length === 0) return { newBadges: [] };
    
    const userStats = stats[0];
    const allBadges = await db.select().from(badgeDefinitions);
    const earnedBadges = await db.select().from(userBadges).where(eq(userBadges.userId, ctx.user.id));
    const earnedBadgeIds = new Set(earnedBadges.map(b => b.badgeId));
    
    const newBadges: typeof allBadges = [];
    
    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) continue;
      
      let earned = false;
      
      switch (badge.category) {
        case "STREAK":
          earned = (userStats.currentStreak || 0) >= (badge.threshold || 0);
          break;
        case "TASKS":
          earned = (userStats.totalTasksCompleted || 0) >= (badge.threshold || 0);
          break;
        case "PROJECTS":
          earned = (userStats.totalProjectsCompleted || 0) >= (badge.threshold || 0);
          break;
        case "FOCUS":
          earned = (userStats.totalFocusMinutes || 0) >= (badge.threshold || 0);
          break;
        case "IDEAS":
          earned = (userStats.totalIdeasCaptured || 0) >= (badge.threshold || 0);
          break;
      }
      
      if (earned) {
        await db.insert(userBadges).values({
          userId: ctx.user.id,
          badgeId: badge.id,
        });
        
        // Award XP for badge
        if (badge.xpReward) {
          await db.insert(xpTransactions).values({
            userId: ctx.user.id,
            amount: badge.xpReward,
            reason: `Badge: ${badge.name}`,
            sourceType: "BADGE",
            sourceId: badge.id,
          });
          
          await db.update(userGamification)
            .set({ totalXp: sql`${userGamification.totalXp} + ${badge.xpReward}` })
            .where(eq(userGamification.userId, ctx.user.id));
        }
        
        newBadges.push(badge);
      }
    }
    
    return { newBadges };
  }),
  
  // Get XP history
  getXpHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const history = await db
        .select()
        .from(xpTransactions)
        .where(eq(xpTransactions.userId, ctx.user.id))
        .orderBy(desc(xpTransactions.createdAt))
        .limit(input.limit);
      
      return history;
    }),
  
  // Increment stat (called when user completes actions)
  incrementStat: protectedProcedure
    .input(z.object({
      stat: z.enum(["tasks", "projects", "focusMinutes", "ideas"]),
      amount: z.number().default(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const stats = await db.select().from(userGamification).where(eq(userGamification.userId, ctx.user.id)).limit(1);
      
      if (stats.length === 0) {
        const initialValues: Record<string, number> = {
          totalTasksCompleted: input.stat === "tasks" ? input.amount : 0,
          totalProjectsCompleted: input.stat === "projects" ? input.amount : 0,
          totalFocusMinutes: input.stat === "focusMinutes" ? input.amount : 0,
          totalIdeasCaptured: input.stat === "ideas" ? input.amount : 0,
        };
        await db.insert(userGamification).values({ userId: ctx.user.id, ...initialValues });
      } else {
        const updateField = {
          tasks: "totalTasksCompleted",
          projects: "totalProjectsCompleted",
          focusMinutes: "totalFocusMinutes",
          ideas: "totalIdeasCaptured",
        }[input.stat];
        
        await db.update(userGamification)
          .set({ [updateField]: sql`${userGamification[updateField as keyof typeof userGamification]} + ${input.amount}` })
          .where(eq(userGamification.userId, ctx.user.id));
      }
      
      return { success: true };
    }),
  
  // Initialize default badges (admin/setup)
  initializeBadges: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // Check if badges already exist
    const existing = await db.select().from(badgeDefinitions).limit(1);
    if (existing.length > 0) return { message: "Badges already initialized" };
    
    // Insert default badges
    for (const badge of DEFAULT_BADGES) {
      await db.insert(badgeDefinitions).values(badge);
    }
    
    return { message: "Badges initialized", count: DEFAULT_BADGES.length };
  }),
  
  // Get project templates
  getTemplates: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const templates = await db
      .select()
      .from(projectTemplates)
      .where(eq(projectTemplates.isActive, true))
      .orderBy(desc(projectTemplates.usageCount));
    
    return templates;
  }),
  
  // Initialize default templates (admin/setup)
  initializeTemplates: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // Check if templates already exist
    const existing = await db.select().from(projectTemplates).limit(1);
    if (existing.length > 0) return { message: "Templates already initialized" };
    
    // Insert default templates
    for (const template of DEFAULT_TEMPLATES) {
      await db.insert(projectTemplates).values(template);
    }
    
    return { message: "Templates initialized", count: DEFAULT_TEMPLATES.length };
  }),
  
  // Get onboarding progress
  getOnboarding: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    let progress = await db.select().from(onboardingProgress).where(eq(onboardingProgress.userId, ctx.user.id)).limit(1);
    
    if (progress.length === 0) {
      await db.insert(onboardingProgress).values({ userId: ctx.user.id });
      progress = await db.select().from(onboardingProgress).where(eq(onboardingProgress.userId, ctx.user.id)).limit(1);
    }
    
    return progress[0];
  }),
  
  // Update onboarding step
  updateOnboarding: protectedProcedure
    .input(z.object({
      step: z.enum(["welcomeViewed", "profileSetup", "firstProjectCreated", "firstTaskCompleted", "firstFocusSession", "firstIdeaCaptured", "tourCompleted"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const progress = await db.select().from(onboardingProgress).where(eq(onboardingProgress.userId, ctx.user.id)).limit(1);
      
      if (progress.length === 0) {
        await db.insert(onboardingProgress).values({ 
          userId: ctx.user.id,
          [input.step]: true,
          currentStep: 1,
        });
      } else {
        const currentStep = progress[0].currentStep || 0;
        await db.update(onboardingProgress)
          .set({ 
            [input.step]: true,
            currentStep: currentStep + 1,
          })
          .where(eq(onboardingProgress.userId, ctx.user.id));
      }
      
      return { success: true };
    }),
  
  // Skip onboarding
  skipOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    await db.update(onboardingProgress)
      .set({ skippedAt: new Date() })
      .where(eq(onboardingProgress.userId, ctx.user.id));
    
    return { success: true };
  }),
});
