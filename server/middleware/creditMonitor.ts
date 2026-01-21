/**
 * Credit Monitor Middleware
 * 
 * Monitora o uso de créditos em tempo real e alerta sobre uso anormal.
 * Implementa as melhores práticas do Guia Avançado Manus.
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../db';

interface CreditLog {
  userId: string;
  endpoint: string;
  creditsUsed: number;
  timeMs: number;
  timestamp: Date;
  status: 'success' | 'error';
}

// Cache para logs recentes (evita sobrecarga do banco)
const recentLogs: CreditLog[] = [];
const MAX_RECENT_LOGS = 1000;

/**
 * Middleware para monitorar uso de créditos
 * Deve ser aplicado a rotas que usam IA
 */
export const creditMonitorMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const userId = (req as any).user?.id;
  const endpoint = req.path;

  // Capturar resposta original
  const originalJson = res.json.bind(res);
  let creditsUsed = 0;
  let status: 'success' | 'error' = 'success';

  res.json = function (data: any) {
    creditsUsed = data?.creditsUsed || 0;
    return originalJson(data);
  };

  // Capturar erros
  const originalSend = res.send.bind(res);
  res.send = function (data: any) {
    if (res.statusCode >= 400) {
      status = 'error';
    }
    return originalSend(data);
  };

  // Executar próximo middleware
  await next();

  // Registrar uso
  const timeMs = Date.now() - startTime;
  const log: CreditLog = {
    userId: userId || 'anonymous',
    endpoint,
    creditsUsed,
    timeMs,
    timestamp: new Date(),
    status,
  };

  // Adicionar ao cache
  recentLogs.push(log);
  if (recentLogs.length > MAX_RECENT_LOGS) {
    recentLogs.shift();
  }

  // Alertar se uso anormal
  if (creditsUsed > 100) {
    console.warn(`⚠️ Alto uso de créditos: ${creditsUsed} em ${endpoint}`);
    // TODO: Enviar notificação ao owner
  }

  // Registrar no banco (assincronamente)
  if (userId) {
    logCreditUsage(log).catch(err => {
      console.error('Erro ao registrar uso de créditos:', err);
    });
  }
};

/**
 * Registrar uso de créditos no banco de dados
 */
async function logCreditUsage(log: CreditLog) {
  try {
    // TODO: Implementar tabela de logs de créditos
    // await db.creditLogs.create({
    //   userId: log.userId,
    //   endpoint: log.endpoint,
    //   creditsUsed: log.creditsUsed,
    //   timeMs: log.timeMs,
    //   status: log.status,
    //   createdAt: log.timestamp,
    // });
  } catch (error) {
    console.error('Erro ao salvar log de créditos:', error);
  }
}

/**
 * Obter uso de créditos do usuário hoje
 */
export async function getUserCreditUsageToday(userId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayLogs = recentLogs.filter(
    log => log.userId === userId && log.timestamp >= today
  );

  return todayLogs.reduce((sum, log) => sum + log.creditsUsed, 0);
}

/**
 * Obter uso de créditos total do usuário
 */
export async function getUserCreditUsageTotal(userId: string): Promise<number> {
  const userLogs = recentLogs.filter(log => log.userId === userId);
  return userLogs.reduce((sum, log) => sum + log.creditsUsed, 0);
}

/**
 * Obter logs recentes
 */
export function getRecentLogs(limit: number = 100): CreditLog[] {
  return recentLogs.slice(-limit);
}

/**
 * Limpar logs antigos
 */
export function clearOldLogs(hoursAgo: number = 24) {
  const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  const initialLength = recentLogs.length;

  while (recentLogs.length > 0 && recentLogs[0].timestamp < cutoff) {
    recentLogs.shift();
  }

  console.log(`Limpeza de logs: ${initialLength} → ${recentLogs.length}`);
}
