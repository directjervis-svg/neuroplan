/**
 * useTDAHFeatures Hook - Funcionalidades Específicas para TDAH
 *
 * Implementa recursos baseados em pesquisa de Russell Barkley:
 * - Timer Progressivo (começa curto, aumenta com sucesso)
 * - Sistema de Streaks (gamificação de consistência)
 * - Body Doubling virtual (presença simulada)
 * - Âncoras de Tempo (externalização do tempo)
 * - Micro-recompensas (dopamina hack)
 * - Break Reminders (previne hiperfoco prejudicial)
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { tdahStorage, userPreferences } from '@/utils/storage';
import { calculateCV } from '@/utils/validation';

// ========================
// Tipos
// ========================

export interface TimerLevel {
  level: number;
  duration: number; // minutos
  breakDuration: number; // minutos
  sessionsToAdvance: number;
  rewardMessage: string;
}

export interface FocusSession {
  id: string;
  startedAt: number;
  endedAt?: number;
  targetDuration: number;
  actualDuration?: number;
  completed: boolean;
  taskId?: string;
  interruptions: number;
}

export interface StreakData {
  current: number;
  longest: number;
  lastActiveDate: string;
  weeklyActivity: boolean[]; // últimos 7 dias
  totalSessions: number;
}

export interface TDAHState {
  // Timer
  isTimerActive: boolean;
  currentSession: FocusSession | null;
  timerLevel: number;
  remainingSeconds: number;
  isBreak: boolean;

  // Streak
  streak: StreakData;

  // Features
  bodyDoublingActive: boolean;
  breakRemindersEnabled: boolean;
}

export interface UseTDAHFeaturesReturn {
  // Estado
  state: TDAHState;

  // Timer Progressivo
  startTimer: (taskId?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: (completed?: boolean) => void;
  recordInterruption: () => void;
  getCurrentLevel: () => TimerLevel;
  getProgress: () => number;

  // Streak
  checkStreak: () => void;
  getStreakMessage: () => string;
  getWeeklyStats: () => { completed: number; total: number; rate: number };

  // Body Doubling
  toggleBodyDoubling: () => void;
  getBodyDoublingMessage: () => string;

  // Break Reminders
  toggleBreakReminders: () => void;
  shouldTakeBreak: () => boolean;

  // Micro-recompensas
  getReward: () => { emoji: string; message: string };
  triggerCelebration: () => void;

  // Métricas TDAH
  getFocusConsistency: () => { cv: number; interpretation: string };
  getOptimalFocusTime: () => number;
  getProductiveHours: () => number[];

  // Histórico
  getSessionHistory: (days?: number) => FocusSession[];
  getTodaySessions: () => FocusSession[];
}

// ========================
// Configurações de Níveis
// ========================

const TIMER_LEVELS: TimerLevel[] = [
  { level: 1, duration: 10, breakDuration: 3, sessionsToAdvance: 3, rewardMessage: '🌱 Ótimo começo! Seu foco está brotando.' },
  { level: 2, duration: 15, breakDuration: 4, sessionsToAdvance: 4, rewardMessage: '🌿 Crescendo! Você está desenvolvendo consistência.' },
  { level: 3, duration: 20, breakDuration: 5, sessionsToAdvance: 5, rewardMessage: '🌳 Forte! Seu foco está se fortalecendo.' },
  { level: 4, duration: 25, breakDuration: 5, sessionsToAdvance: 6, rewardMessage: '🏆 Pomodoro clássico! Você dominou o básico.' },
  { level: 5, duration: 30, breakDuration: 6, sessionsToAdvance: 7, rewardMessage: '⭐ Impressionante! Foco de alto desempenho.' },
  { level: 6, duration: 40, breakDuration: 8, sessionsToAdvance: 8, rewardMessage: '🚀 Extraordinário! Você é uma máquina de foco.' },
  { level: 7, duration: 50, breakDuration: 10, sessionsToAdvance: 10, rewardMessage: '👑 Mestre do Foco! Nível máximo alcançado.' },
];

const REWARDS = [
  { emoji: '🎉', message: 'Incrível! Você completou uma sessão!' },
  { emoji: '🌟', message: 'Brilhante! Continue assim!' },
  { emoji: '💪', message: 'Você é mais forte do que pensa!' },
  { emoji: '🏅', message: 'Medalha de foco conquistada!' },
  { emoji: '✨', message: 'Sua consistência está brilhando!' },
  { emoji: '🎯', message: 'Direto no alvo! Tarefa focada.' },
  { emoji: '🔥', message: 'Você está em chamas hoje!' },
  { emoji: '🚀', message: 'Decolando para a produtividade!' },
];

const BODY_DOUBLING_MESSAGES = [
  'Estou aqui com você. Vamos focar juntos! 🤝',
  'Você não está sozinho(a). Trabalhando ao seu lado. 💪',
  'Presença virtual ativada. Foco compartilhado! 🧘',
  'Body double ativo. Vamos nessa! 👥',
  'Parceiro de foco online. Você consegue! 🌟',
];

// ========================
// Storage Keys
// ========================

const STORAGE_KEYS = {
  SESSIONS: 'tdah_sessions',
  LEVEL_PROGRESS: 'tdah_level_progress',
  STREAK: 'tdah_streak_data',
  SETTINGS: 'tdah_settings',
};

// ========================
// Hook Principal
// ========================

export function useTDAHFeatures(): UseTDAHFeaturesReturn {
  // Estado do Timer
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [timerLevel, setTimerLevel] = useState(() => tdahStorage.getProgressiveTimerLevel());

  // Estado do Streak
  const [streak, setStreak] = useState<StreakData>(() => {
    const saved = userPreferences.get<StreakData>(STORAGE_KEYS.STREAK);
    return saved ?? {
      current: tdahStorage.getStreak(),
      longest: 0,
      lastActiveDate: tdahStorage.getLastActiveDate() ?? '',
      weeklyActivity: new Array(7).fill(false),
      totalSessions: 0,
    };
  });

  // Configurações
  const [bodyDoublingActive, setBodyDoublingActive] = useState(false);
  const [breakRemindersEnabled, setBreakRemindersEnabled] = useState(true);

  // Histórico de sessões
  const [sessions, setSessions] = useState<FocusSession[]>(() => {
    return userPreferences.get<FocusSession[]>(STORAGE_KEYS.SESSIONS, []) ?? [];
  });

  // Progresso no nível atual
  const [levelProgress, setLevelProgress] = useState<number>(() => {
    return userPreferences.get<number>(STORAGE_KEYS.LEVEL_PROGRESS, 0) ?? 0;
  });

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const continuousFocusTime = useRef<number>(0);

  // Nível atual
  const currentLevel = useMemo(() => {
    return TIMER_LEVELS[Math.min(timerLevel - 1, TIMER_LEVELS.length - 1)];
  }, [timerLevel]);

  // Persistência
  useEffect(() => {
    userPreferences.set(STORAGE_KEYS.SESSIONS, sessions.slice(0, 100)); // Mantém últimas 100
  }, [sessions]);

  useEffect(() => {
    userPreferences.set(STORAGE_KEYS.STREAK, streak);
    tdahStorage.setStreak(streak.current);
    tdahStorage.setLastActiveDate(streak.lastActiveDate);
  }, [streak]);

  useEffect(() => {
    userPreferences.set(STORAGE_KEYS.LEVEL_PROGRESS, levelProgress);
  }, [levelProgress]);

  useEffect(() => {
    tdahStorage.setProgressiveTimerLevel(timerLevel);
  }, [timerLevel]);

  // Timer loop
  useEffect(() => {
    if (isTimerActive && remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            // Timer completou
            if (!isBreak) {
              handleTimerComplete();
            } else {
              handleBreakComplete();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerActive, isBreak]);

  // Handler quando timer de foco completa
  const handleTimerComplete = useCallback(() => {
    setIsTimerActive(false);

    if (currentSession) {
      const completedSession: FocusSession = {
        ...currentSession,
        endedAt: Date.now(),
        actualDuration: currentLevel.duration,
        completed: true,
      };

      setSessions(prev => [completedSession, ...prev]);
      tdahStorage.addFocusSession(currentLevel.duration);

      // Atualiza progresso do nível
      const newProgress = levelProgress + 1;
      if (newProgress >= currentLevel.sessionsToAdvance && timerLevel < TIMER_LEVELS.length) {
        setTimerLevel(prev => Math.min(prev + 1, TIMER_LEVELS.length));
        setLevelProgress(0);
      } else {
        setLevelProgress(newProgress);
      }

      // Atualiza streak
      updateStreak();
    }

    // Inicia break
    setIsBreak(true);
    setRemainingSeconds(currentLevel.breakDuration * 60);
    setIsTimerActive(true);
  }, [currentSession, currentLevel, levelProgress, timerLevel]);

  // Handler quando break completa
  const handleBreakComplete = useCallback(() => {
    setIsTimerActive(false);
    setIsBreak(false);
    setCurrentSession(null);
  }, []);

  // Atualiza streak
  const updateStreak = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];

    setStreak(prev => {
      const isNewDay = prev.lastActiveDate !== today;
      const wasYesterday = isConsecutiveDay(prev.lastActiveDate, today);

      let newCurrent = prev.current;
      if (isNewDay) {
        newCurrent = wasYesterday ? prev.current + 1 : 1;
      }

      const weeklyActivity = [...prev.weeklyActivity];
      if (isNewDay) {
        weeklyActivity.unshift(true);
        weeklyActivity.pop();
      } else {
        weeklyActivity[0] = true;
      }

      return {
        current: newCurrent,
        longest: Math.max(prev.longest, newCurrent),
        lastActiveDate: today,
        weeklyActivity,
        totalSessions: prev.totalSessions + 1,
      };
    });
  }, []);

  // Verifica se dias são consecutivos
  const isConsecutiveDay = (lastDate: string, today: string): boolean => {
    if (!lastDate) return false;
    const last = new Date(lastDate);
    const current = new Date(today);
    const diffTime = current.getTime() - last.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays === 1;
  };

  // ========================
  // API Pública
  // ========================

  const startTimer = useCallback((taskId?: string) => {
    const session: FocusSession = {
      id: `session-${Date.now()}`,
      startedAt: Date.now(),
      targetDuration: currentLevel.duration,
      completed: false,
      taskId,
      interruptions: 0,
    };

    setCurrentSession(session);
    setRemainingSeconds(currentLevel.duration * 60);
    setIsBreak(false);
    setIsTimerActive(true);
    continuousFocusTime.current = 0;
  }, [currentLevel]);

  const pauseTimer = useCallback(() => {
    setIsTimerActive(false);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsTimerActive(true);
  }, []);

  const stopTimer = useCallback((completed: boolean = false) => {
    setIsTimerActive(false);

    if (currentSession) {
      const actualMinutes = Math.round((currentLevel.duration * 60 - remainingSeconds) / 60);
      const endedSession: FocusSession = {
        ...currentSession,
        endedAt: Date.now(),
        actualDuration: actualMinutes,
        completed,
      };

      setSessions(prev => [endedSession, ...prev]);

      if (completed && actualMinutes >= currentLevel.duration * 0.8) {
        // Considera completo se fez pelo menos 80%
        tdahStorage.addFocusSession(actualMinutes);
        updateStreak();
      }
    }

    setCurrentSession(null);
    setIsBreak(false);
  }, [currentSession, currentLevel, remainingSeconds, updateStreak]);

  const recordInterruption = useCallback(() => {
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        interruptions: prev.interruptions + 1,
      } : null);
    }
  }, [currentSession]);

  const getCurrentLevel = useCallback(() => currentLevel, [currentLevel]);

  const getProgress = useCallback(() => {
    if (!isTimerActive || remainingSeconds === 0) return 0;
    const total = isBreak ? currentLevel.breakDuration * 60 : currentLevel.duration * 60;
    return ((total - remainingSeconds) / total) * 100;
  }, [isTimerActive, remainingSeconds, isBreak, currentLevel]);

  const checkStreak = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    if (streak.lastActiveDate && !isConsecutiveDay(streak.lastActiveDate, today) && streak.lastActiveDate !== today) {
      // Streak quebrado
      setStreak(prev => ({
        ...prev,
        current: 0,
        weeklyActivity: prev.weeklyActivity.map(() => false),
      }));
    }
  }, [streak.lastActiveDate]);

  const getStreakMessage = useCallback((): string => {
    if (streak.current === 0) return 'Comece hoje sua sequência de foco! 🌱';
    if (streak.current === 1) return 'Primeiro dia! O começo de algo grande. 🌟';
    if (streak.current < 7) return `${streak.current} dias seguidos! Continue assim! 🔥`;
    if (streak.current < 30) return `${streak.current} dias! Você está construindo um hábito! 💪`;
    return `${streak.current} dias! Você é uma lenda do foco! 👑`;
  }, [streak.current]);

  const getWeeklyStats = useCallback(() => {
    const completed = streak.weeklyActivity.filter(Boolean).length;
    return {
      completed,
      total: 7,
      rate: Math.round((completed / 7) * 100),
    };
  }, [streak.weeklyActivity]);

  const toggleBodyDoubling = useCallback(() => {
    setBodyDoublingActive(prev => !prev);
  }, []);

  const getBodyDoublingMessage = useCallback((): string => {
    return BODY_DOUBLING_MESSAGES[Math.floor(Math.random() * BODY_DOUBLING_MESSAGES.length)];
  }, []);

  const toggleBreakReminders = useCallback(() => {
    setBreakRemindersEnabled(prev => !prev);
  }, []);

  const shouldTakeBreak = useCallback((): boolean => {
    if (!breakRemindersEnabled) return false;
    // Recomenda pausa após 2 horas de foco contínuo
    return continuousFocusTime.current >= 120;
  }, [breakRemindersEnabled]);

  const getReward = useCallback(() => {
    return REWARDS[Math.floor(Math.random() * REWARDS.length)];
  }, []);

  const triggerCelebration = useCallback(() => {
    // Dispara evento para componentes de UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tdah-celebration', {
        detail: getReward(),
      }));
    }
  }, [getReward]);

  const getFocusConsistency = useCallback(() => {
    const focusHistory = tdahStorage.getFocusHistory();
    if (focusHistory.length < 3) {
      return { cv: 0, interpretation: 'Dados insuficientes. Continue praticando!' };
    }
    const analysis = calculateCV(focusHistory);
    return { cv: analysis.cv, interpretation: analysis.interpretation };
  }, []);

  const getOptimalFocusTime = useCallback((): number => {
    const focusHistory = tdahStorage.getFocusHistory();
    if (focusHistory.length === 0) return currentLevel.duration;

    // Calcula média das sessões completadas com sucesso
    const successful = focusHistory.filter(d => d >= currentLevel.duration * 0.8);
    if (successful.length === 0) return currentLevel.duration;

    const avg = successful.reduce((a, b) => a + b, 0) / successful.length;
    return Math.round(avg);
  }, [currentLevel]);

  const getProductiveHours = useCallback((): number[] => {
    // Analisa sessões para encontrar horários mais produtivos
    const hourCounts: number[] = new Array(24).fill(0);

    sessions.forEach(session => {
      if (session.completed) {
        const hour = new Date(session.startedAt).getHours();
        hourCounts[hour]++;
      }
    });

    // Retorna top 3 horários
    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(h => h.hour);
  }, [sessions]);

  const getSessionHistory = useCallback((days: number = 7): FocusSession[] => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return sessions.filter(s => s.startedAt >= cutoff);
  }, [sessions]);

  const getTodaySessions = useCallback((): FocusSession[] => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.filter(s => {
      const sessionDate = new Date(s.startedAt).toISOString().split('T')[0];
      return sessionDate === today;
    });
  }, [sessions]);

  // Estado compilado
  const state: TDAHState = {
    isTimerActive,
    currentSession,
    timerLevel,
    remainingSeconds,
    isBreak,
    streak,
    bodyDoublingActive,
    breakRemindersEnabled,
  };

  return {
    state,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    recordInterruption,
    getCurrentLevel,
    getProgress,
    checkStreak,
    getStreakMessage,
    getWeeklyStats,
    toggleBodyDoubling,
    getBodyDoublingMessage,
    toggleBreakReminders,
    shouldTakeBreak,
    getReward,
    triggerCelebration,
    getFocusConsistency,
    getOptimalFocusTime,
    getProductiveHours,
    getSessionHistory,
    getTodaySessions,
  };
}

// ========================
// Helpers
// ========================

/**
 * Formata segundos para MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Obtém cor baseada no progresso
 */
export function getProgressColor(progress: number, isBreak: boolean): string {
  if (isBreak) return '#22c55e'; // Verde para break

  if (progress < 25) return '#ef4444'; // Vermelho
  if (progress < 50) return '#f97316'; // Laranja
  if (progress < 75) return '#eab308'; // Amarelo
  return '#22c55e'; // Verde
}

/**
 * Obtém mensagem motivacional baseada no nível
 */
export function getLevelMessage(level: number): string {
  const messages: Record<number, string> = {
    1: 'Iniciante - Construindo sua base de foco',
    2: 'Aprendiz - Desenvolvendo consistência',
    3: 'Praticante - Fortalecendo o músculo do foco',
    4: 'Competente - Dominando o Pomodoro',
    5: 'Proficiente - Foco de alto desempenho',
    6: 'Expert - Sessões avançadas',
    7: 'Mestre - Nível máximo alcançado!',
  };
  return messages[level] || messages[1];
}

export default useTDAHFeatures;
