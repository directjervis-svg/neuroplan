import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Rate Limiting for AI API calls
 * Protects against cost explosion and abuse
 * 
 * Limits:
 * - Free users: 100 AI calls per day
 * - Pro users: 500 AI calls per day
 * - Team users: 2000 AI calls per day
 * - Unauthenticated (IP): 10 calls per hour
 */

// Initialize Redis client (will use env vars UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN)
let redis: Redis | null = null;
let userRateLimit: Ratelimit | null = null;
let ipRateLimit: Ratelimit | null = null;

try {
  // Only initialize if Upstash credentials are available
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Rate limit for authenticated users (per user ID)
    userRateLimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 d'), // 100 calls per day for FREE
      analytics: true,
      prefix: 'ratelimit:user',
    });

    // Rate limit for unauthenticated requests (per IP)
    ipRateLimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 calls per hour
      analytics: true,
      prefix: 'ratelimit:ip',
    });

    console.log('[RateLimit] Upstash Redis initialized successfully');
  } else {
    console.warn('[RateLimit] Upstash credentials not found, rate limiting disabled');
  }
} catch (error) {
  console.error('[RateLimit] Failed to initialize Upstash Redis:', error);
}

/**
 * Get rate limit for user based on subscription plan
 */
function getUserLimit(subscriptionPlan: string): number {
  switch (subscriptionPlan) {
    case 'PRO':
      return 500; // 500 calls/day
    case 'TEAM':
      return 2000; // 2000 calls/day
    case 'FREE':
    default:
      return 100; // 100 calls/day
  }
}

/**
 * Check rate limit for authenticated user
 */
export async function checkUserRateLimit(
  userId: number,
  subscriptionPlan: string = 'FREE'
): Promise<{
  success: boolean;
  remaining: number;
  limit: number;
  reset: number;
}> {
  // If rate limiting is not configured, allow all requests
  if (!userRateLimit || !redis) {
    return {
      success: true,
      remaining: 999,
      limit: 999,
      reset: Date.now() + 86400000, // 24 hours from now
    };
  }

  const limit = getUserLimit(subscriptionPlan);
  const identifier = `user:${userId}`;

  try {
    // Create a dynamic rate limiter based on user's plan
    const dynamicLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, '1 d'),
      analytics: true,
      prefix: 'ratelimit:user',
    });

    const { success, limit: currentLimit, remaining, reset } = await dynamicLimiter.limit(identifier);

    return {
      success,
      remaining,
      limit: currentLimit,
      reset,
    };
  } catch (error) {
    console.error('[RateLimit] Error checking user rate limit:', error);
    // On error, allow the request but log it
    return {
      success: true,
      remaining: limit,
      limit,
      reset: Date.now() + 86400000,
    };
  }
}

/**
 * Check rate limit for unauthenticated request (by IP)
 */
export async function checkIpRateLimit(
  ip: string
): Promise<{
  success: boolean;
  remaining: number;
  limit: number;
  reset: number;
}> {
  // If rate limiting is not configured, allow all requests
  if (!ipRateLimit) {
    return {
      success: true,
      remaining: 10,
      limit: 10,
      reset: Date.now() + 3600000, // 1 hour from now
    };
  }

  const identifier = `ip:${ip}`;

  try {
    const { success, limit, remaining, reset } = await ipRateLimit.limit(identifier);

    return {
      success,
      remaining,
      limit,
      reset,
    };
  } catch (error) {
    console.error('[RateLimit] Error checking IP rate limit:', error);
    // On error, allow the request but log it
    return {
      success: true,
      remaining: 10,
      limit: 10,
      reset: Date.now() + 3600000,
    };
  }
}

/**
 * Get current usage for a user (for display in dashboard)
 */
export async function getUserUsage(
  userId: number,
  subscriptionPlan: string = 'FREE'
): Promise<{
  used: number;
  limit: number;
  remaining: number;
  resetAt: Date;
}> {
  const limit = getUserLimit(subscriptionPlan);

  // If rate limiting is not configured, return mock data
  if (!redis) {
    return {
      used: 0,
      limit,
      remaining: limit,
      resetAt: new Date(Date.now() + 86400000),
    };
  }

  try {
    const identifier = `user:${userId}`;
    const key = `ratelimit:user:${identifier}`;

    // Get current count from Redis
    const count = await redis.get<number>(key);
    const used = count || 0;
    const remaining = Math.max(0, limit - used);

    // Calculate reset time (next midnight UTC)
    const now = new Date();
    const resetAt = new Date(now);
    resetAt.setUTCHours(24, 0, 0, 0);

    return {
      used,
      limit,
      remaining,
      resetAt,
    };
  } catch (error) {
    console.error('[RateLimit] Error getting user usage:', error);
    return {
      used: 0,
      limit,
      remaining: limit,
      resetAt: new Date(Date.now() + 86400000),
    };
  }
}

/**
 * Middleware-style function to check rate limit before AI call
 * Throws error if rate limit exceeded
 */
export async function enforceRateLimit(
  userId: number | null,
  subscriptionPlan: string = 'FREE',
  ip?: string
): Promise<void> {
  if (userId) {
    // Authenticated user
    const result = await checkUserRateLimit(userId, subscriptionPlan);
    if (!result.success) {
      const resetDate = new Date(result.reset);
      throw new Error(
        `Rate limit exceeded. You have used all ${result.limit} AI calls for today. ` +
        `Limit resets at ${resetDate.toLocaleTimeString('pt-BR')}. ` +
        `Upgrade to PRO for 500 calls/day or TEAM for 2000 calls/day.`
      );
    }
  } else if (ip) {
    // Unauthenticated request
    const result = await checkIpRateLimit(ip);
    if (!result.success) {
      const resetDate = new Date(result.reset);
      throw new Error(
        `Rate limit exceeded. Anonymous users are limited to ${result.limit} AI calls per hour. ` +
        `Limit resets at ${resetDate.toLocaleTimeString('pt-BR')}. ` +
        `Please sign in for higher limits.`
      );
    }
  }
}
