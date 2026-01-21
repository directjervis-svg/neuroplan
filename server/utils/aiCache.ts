/**
 * AI Cache Utility
 * 
 * Implementa cache agressivo para reduzir uso de créditos.
 * Baseado nas táticas do Guia Avançado Manus.
 */

import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

interface CacheOptions {
  ttl?: number; // Time to live em segundos (padrão: 86400 = 24h)
  key: string;
}

/**
 * Gerar chave de cache baseada em hash
 */
function generateCacheKey(prefix: string, data: any): string {
  const hash = JSON.stringify(data)
    .split('')
    .reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

  return `${prefix}:${Math.abs(hash)}`;
}

/**
 * Obter do cache ou executar função
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 86400
): Promise<T> {
  try {
    // Tentar obter do cache
    const cached = await redis.get(key);
    if (cached) {
      console.log(`✅ Cache hit: ${key}`);
      return JSON.parse(cached as string) as T;
    }
  } catch (error) {
    console.warn(`⚠️ Erro ao acessar cache: ${error}`);
  }

  // Executar função
  console.log(`🔄 Cache miss: ${key} - executando função`);
  const result = await fn();

  // Salvar no cache
  try {
    await redis.setex(key, ttl, JSON.stringify(result));
    console.log(`💾 Resultado cacheado: ${key}`);
  } catch (error) {
    console.warn(`⚠️ Erro ao salvar cache: ${error}`);
  }

  return result;
}

/**
 * Cache para análise de charter
 */
export async function cacheCharterAnalysis(
  projectDescription: string,
  fn: () => Promise<any>
) {
  const key = generateCacheKey('charter', { description: projectDescription });
  return withCache(key, fn, 604800); // 7 dias
}

/**
 * Cache para geração de WBS
 */
export async function cacheWBSGeneration(
  projectDescription: string,
  userProfile: any,
  fn: () => Promise<any>
) {
  const key = generateCacheKey('wbs', { description: projectDescription, profile: userProfile });
  return withCache(key, fn, 604800); // 7 dias
}

/**
 * Cache para geração de tarefas
 */
export async function cacheTaskGeneration(
  deliverable: any,
  userProfile: any,
  fn: () => Promise<any>
) {
  const key = generateCacheKey('tasks', { deliverable, profile: userProfile });
  return withCache(key, fn, 604800); // 7 dias
}

/**
 * Cache para ciclos de 3 dias
 */
export async function cacheCycleGeneration(
  projectDescription: string,
  userProfile: any,
  fn: () => Promise<any>
) {
  const key = generateCacheKey('cycle', { description: projectDescription, profile: userProfile });
  return withCache(key, fn, 604800); // 7 dias
}

/**
 * Invalidar cache por padrão
 */
export async function invalidateCachePattern(pattern: string) {
  try {
    // Redis não suporta pattern delete nativamente, então usamos SCAN
    const keys = await redis.keys(`${pattern}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🗑️ Cache invalidado: ${keys.length} chaves removidas`);
    }
  } catch (error) {
    console.warn(`⚠️ Erro ao invalidar cache: ${error}`);
  }
}

/**
 * Limpar todo o cache
 */
export async function clearAllCache() {
  try {
    // Cuidado: isso limpa TUDO do Redis
    // Usar apenas em desenvolvimento ou com cuidado
    await redis.flushdb();
    console.log('🗑️ Todo o cache foi limpo');
  } catch (error) {
    console.warn(`⚠️ Erro ao limpar cache: ${error}`);
  }
}

/**
 * Obter estatísticas de cache
 */
export async function getCacheStats() {
  try {
    const info = await redis.info();
    return {
      keyspace: info.keyspace,
      memoryUsed: info.used_memory,
      connectedClients: info.connected_clients,
    };
  } catch (error) {
    console.warn(`⚠️ Erro ao obter estatísticas: ${error}`);
    return null;
  }
}
