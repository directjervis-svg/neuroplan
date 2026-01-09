/**
 * Rewards and TDAH Store Service
 * System for point redemption, discounts, and physical products
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { eq, and, desc, gte, lte, sql, isNull, or } from "drizzle-orm";
import { getDb } from "./db";
import { 
  rewards, 
  rewardRedemptions, 
  pointTransactions, 
  storeProducts, 
  storeOrders, 
  storeOrderItems,
  userGamification 
} from "../drizzle/schema";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

// Points configuration
const POINTS_CONFIG = {
  // Earning rates
  TASK_COMPLETE: 10,
  PROJECT_COMPLETE: 100,
  STREAK_BONUS_PER_DAY: 5,
  LEVEL_UP_BONUS: 50,
  ACHIEVEMENT_BONUS: 25,
  REFERRAL_BONUS: 200,
  
  // Conversion
  XP_TO_POINTS_RATIO: 0.1, // 10 XP = 1 point
};

// Generate unique coupon code
function generateCouponCode(): string {
  return `NP-${nanoid(8).toUpperCase()}`;
}

// Generate order number
function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `NP${dateStr}-${nanoid(6).toUpperCase()}`;
}

// Get user's current point balance
async function getUserPointBalance(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const gamification = await db
    .select()
    .from(userGamification)
    .where(eq(userGamification.userId, userId))
    .limit(1);

  if (!gamification[0]) return 0;

  // Calculate points from XP
  const xpPoints = Math.floor((gamification[0].totalXp || 0) * POINTS_CONFIG.XP_TO_POINTS_RATIO);
  
  // Get additional points from transactions
  const transactions = await db
    .select({ total: sql<number>`SUM(amount)` })
    .from(pointTransactions)
    .where(eq(pointTransactions.userId, userId));

  const transactionPoints = transactions[0]?.total || 0;

  return xpPoints + transactionPoints;
}

// Record point transaction
async function recordPointTransaction(
  userId: number,
  amount: number,
  type: 'EARNED' | 'SPENT' | 'BONUS' | 'REFUND' | 'EXPIRED' | 'ADJUSTMENT',
  sourceType?: string,
  sourceId?: number,
  redemptionId?: number,
  description?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const currentBalance = await getUserPointBalance(userId);
  const newBalance = currentBalance + amount;

  await db.insert(pointTransactions).values({
    userId,
    amount,
    balanceAfter: newBalance,
    type,
    sourceType: sourceType as any,
    sourceId,
    redemptionId,
    description,
  });
}

// Rewards Router
export const rewardsRouter = router({
  // Get user's point balance and stats
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const balance = await getUserPointBalance(ctx.user.id);
    
    const db = await getDb();
    if (!db) {
      return { balance: 0, totalEarned: 0, totalSpent: 0, pendingRedemptions: 0 };
    }

    // Get total earned and spent
    const earned = await db
      .select({ total: sql<number>`SUM(amount)` })
      .from(pointTransactions)
      .where(and(
        eq(pointTransactions.userId, ctx.user.id),
        sql`amount > 0`
      ));

    const spent = await db
      .select({ total: sql<number>`ABS(SUM(amount))` })
      .from(pointTransactions)
      .where(and(
        eq(pointTransactions.userId, ctx.user.id),
        sql`amount < 0`
      ));

    // Get pending redemptions
    const pending = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(rewardRedemptions)
      .where(and(
        eq(rewardRedemptions.userId, ctx.user.id),
        eq(rewardRedemptions.status, 'PENDING')
      ));

    return {
      balance,
      totalEarned: earned[0]?.total || 0,
      totalSpent: spent[0]?.total || 0,
      pendingRedemptions: pending[0]?.count || 0,
    };
  }),

  // Get point transaction history
  getTransactions: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { transactions: [], total: 0 };

      const limit = input?.limit || 20;
      const offset = input?.offset || 0;

      const transactions = await db
        .select()
        .from(pointTransactions)
        .where(eq(pointTransactions.userId, ctx.user.id))
        .orderBy(desc(pointTransactions.createdAt))
        .limit(limit)
        .offset(offset);

      const total = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(pointTransactions)
        .where(eq(pointTransactions.userId, ctx.user.id));

      return {
        transactions,
        total: total[0]?.count || 0,
      };
    }),

  // Get available rewards
  getAvailableRewards: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const now = new Date();
    const userBalance = await getUserPointBalance(ctx.user.id);

    const availableRewards = await db
      .select()
      .from(rewards)
      .where(and(
        eq(rewards.isActive, true),
        or(
          isNull(rewards.validFrom),
          lte(rewards.validFrom, now)
        ),
        or(
          isNull(rewards.validUntil),
          gte(rewards.validUntil, now)
        )
      ))
      .orderBy(rewards.pointsCost);

    // Check user redemption count for each reward
    const rewardsWithEligibility = await Promise.all(
      availableRewards.map(async (reward) => {
        const userRedemptions = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(rewardRedemptions)
          .where(and(
            eq(rewardRedemptions.userId, ctx.user.id),
            eq(rewardRedemptions.rewardId, reward.id)
          ));

        const redemptionCount = userRedemptions[0]?.count || 0;
        const canRedeem = userBalance >= reward.pointsCost && 
          (reward.maxPerUser === null || redemptionCount < reward.maxPerUser) &&
          (reward.stock === null || reward.stock > 0);

        return {
          ...reward,
          userRedemptionCount: redemptionCount,
          canRedeem,
          userBalance,
        };
      })
    );

    return rewardsWithEligibility;
  }),

  // Redeem a reward
  redeemReward: protectedProcedure
    .input(z.object({
      rewardId: z.number(),
      // For products - shipping info
      shippingInfo: z.object({
        name: z.string(),
        address: z.string(),
        city: z.string(),
        state: z.string(),
        zip: z.string(),
        country: z.string().default('BR'),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Get reward
      const reward = await db
        .select()
        .from(rewards)
        .where(eq(rewards.id, input.rewardId))
        .limit(1);

      if (!reward[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Recompensa não encontrada' });
      }

      // Check if active and valid
      const now = new Date();
      if (!reward[0].isActive) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Esta recompensa não está mais disponível' });
      }

      if (reward[0].validUntil && reward[0].validUntil < now) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Esta recompensa expirou' });
      }

      // Check user balance
      const userBalance = await getUserPointBalance(ctx.user.id);
      if (userBalance < reward[0].pointsCost) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Pontos insuficientes' });
      }

      // Check stock
      if (reward[0].stock !== null && reward[0].stock <= 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Esta recompensa está esgotada' });
      }

      // Check max per user
      if (reward[0].maxPerUser) {
        const userRedemptions = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(rewardRedemptions)
          .where(and(
            eq(rewardRedemptions.userId, ctx.user.id),
            eq(rewardRedemptions.rewardId, input.rewardId)
          ));

        if ((userRedemptions[0]?.count || 0) >= reward[0].maxPerUser) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Você já resgatou o máximo permitido desta recompensa' });
        }
      }

      // Validate shipping info for products
      if (reward[0].type === 'PRODUCT' && !input.shippingInfo) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Informações de envio são obrigatórias para produtos' });
      }

      // Create redemption
      const couponCode = reward[0].type === 'DISCOUNT' ? generateCouponCode() : null;

      const [redemption] = await db.insert(rewardRedemptions).values({
        userId: ctx.user.id,
        rewardId: input.rewardId,
        pointsSpent: reward[0].pointsCost,
        status: reward[0].type === 'DISCOUNT' ? 'COMPLETED' : 'PENDING',
        couponCode,
        shippingName: input.shippingInfo?.name,
        shippingAddress: input.shippingInfo?.address,
        shippingCity: input.shippingInfo?.city,
        shippingState: input.shippingInfo?.state,
        shippingZip: input.shippingInfo?.zip,
        shippingCountry: input.shippingInfo?.country,
      }).$returningId();

      // Deduct points
      await recordPointTransaction(
        ctx.user.id,
        -reward[0].pointsCost,
        'SPENT',
        'REDEMPTION',
        reward[0].id,
        redemption.id,
        `Resgate: ${reward[0].name}`
      );

      // Update stock if applicable
      if (reward[0].stock !== null) {
        await db
          .update(rewards)
          .set({ stock: reward[0].stock - 1 })
          .where(eq(rewards.id, input.rewardId));
      }

      return {
        success: true,
        redemptionId: redemption.id,
        couponCode,
        message: reward[0].type === 'DISCOUNT' 
          ? `Cupom gerado: ${couponCode}` 
          : 'Pedido registrado! Você receberá atualizações por email.',
      };
    }),

  // Get user's redemption history
  getRedemptions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const redemptions = await db
      .select({
        redemption: rewardRedemptions,
        reward: rewards,
      })
      .from(rewardRedemptions)
      .leftJoin(rewards, eq(rewardRedemptions.rewardId, rewards.id))
      .where(eq(rewardRedemptions.userId, ctx.user.id))
      .orderBy(desc(rewardRedemptions.redeemedAt));

    return redemptions.map(r => ({
      ...r.redemption,
      reward: r.reward,
    }));
  }),

  // TDAH Store - Get products
  getStoreProducts: protectedProcedure
    .input(z.object({
      category: z.enum(['PLANNER', 'TIMER', 'FIDGET', 'ORGANIZER', 'BOOK', 'ACCESSORY', 'KIT']).optional(),
      featured: z.boolean().optional(),
      pointsOnly: z.boolean().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db
        .select()
        .from(storeProducts)
        .where(eq(storeProducts.isActive, true));

      // Note: Additional filtering would be applied here
      // For now, return all active products

      const products = await query.orderBy(desc(storeProducts.isFeatured));

      return products;
    }),

  // Get single product
  getProduct: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const product = await db
        .select()
        .from(storeProducts)
        .where(eq(storeProducts.id, input.id))
        .limit(1);

      if (!product[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Produto não encontrado' });
      }

      return product[0];
    }),

  // Get user's orders
  getOrders: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const orders = await db
      .select()
      .from(storeOrders)
      .where(eq(storeOrders.userId, ctx.user.id))
      .orderBy(desc(storeOrders.createdAt));

    return orders;
  }),

  // Get order details
  getOrder: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const order = await db
        .select()
        .from(storeOrders)
        .where(and(
          eq(storeOrders.id, input.id),
          eq(storeOrders.userId, ctx.user.id)
        ))
        .limit(1);

      if (!order[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pedido não encontrado' });
      }

      const items = await db
        .select()
        .from(storeOrderItems)
        .where(eq(storeOrderItems.orderId, input.id));

      return {
        ...order[0],
        items,
      };
    }),

  // Apply coupon to subscription
  applyCoupon: protectedProcedure
    .input(z.object({
      couponCode: z.string(),
      planId: z.enum(['PRO', 'TEAM']),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Find redemption with this coupon
      const redemption = await db
        .select({
          redemption: rewardRedemptions,
          reward: rewards,
        })
        .from(rewardRedemptions)
        .leftJoin(rewards, eq(rewardRedemptions.rewardId, rewards.id))
        .where(and(
          eq(rewardRedemptions.couponCode, input.couponCode),
          eq(rewardRedemptions.userId, ctx.user.id),
          eq(rewardRedemptions.couponUsed, false)
        ))
        .limit(1);

      if (!redemption[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Cupom inválido ou já utilizado' });
      }

      const reward = redemption[0].reward;
      if (!reward || reward.type !== 'DISCOUNT') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Este cupom não é válido para descontos' });
      }

      // Check if applies to this plan
      if (reward.discountAppliesTo && reward.discountAppliesTo !== 'ANY' && reward.discountAppliesTo !== input.planId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: `Este cupom só é válido para o plano ${reward.discountAppliesTo}` });
      }

      return {
        valid: true,
        discountType: reward.discountType,
        discountValue: reward.discountValue,
        message: reward.discountType === 'PERCENTAGE' 
          ? `${reward.discountValue}% de desconto aplicado!`
          : `R$ ${((reward.discountValue || 0) / 100).toFixed(2)} de desconto aplicado!`,
      };
    }),

  // Mark coupon as used
  markCouponUsed: protectedProcedure
    .input(z.object({ couponCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      await db
        .update(rewardRedemptions)
        .set({ 
          couponUsed: true, 
          couponUsedAt: new Date() 
        })
        .where(and(
          eq(rewardRedemptions.couponCode, input.couponCode),
          eq(rewardRedemptions.userId, ctx.user.id)
        ));

      return { success: true };
    }),
});

export type RewardsRouter = typeof rewardsRouter;
