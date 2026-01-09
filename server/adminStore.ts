/**
 * Admin Store Router - Gerenciamento de produtos e pedidos da TDAH Store
 * Apenas usuários com role 'admin' podem acessar
 */

import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { storeProducts, storeOrders, users, userGamification } from "../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

// Admin procedure - verifica se o usuário é admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso restrito a administradores",
    });
  }
  return next({ ctx });
});

export const adminStoreRouter = router({
  // ==================== PRODUTOS ====================
  
  // Listar todos os produtos (incluindo inativos)
  listProducts: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      category: z.enum(["PLANNER", "TIMER", "FIDGET", "ORGANIZER", "BOOK", "ACCESSORY", "KIT"]).optional(),
      active: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const results = await db.select().from(storeProducts).orderBy(desc(storeProducts.createdAt));
      
      // Filtrar no JavaScript para simplicidade
      let filtered = results;
      if (input?.search) {
        const searchLower = input.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          (p.description?.toLowerCase().includes(searchLower))
        );
      }
      if (input?.category) {
        filtered = filtered.filter(p => p.category === input.category);
      }
      if (input?.active !== undefined) {
        filtered = filtered.filter(p => p.isActive === input.active);
      }
      
      return filtered;
    }),

  // Criar novo produto
  createProduct: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      longDescription: z.string().optional(),
      category: z.enum(["PLANNER", "TIMER", "FIDGET", "ORGANIZER", "BOOK", "ACCESSORY", "KIT"]),
      priceInCents: z.number().min(0),
      compareAtPriceInCents: z.number().min(0).optional(),
      pointsPrice: z.number().min(1).optional(),
      pointsOnly: z.boolean().default(false),
      stock: z.number().min(0).optional(),
      imageUrl: z.string().optional(),
      isActive: z.boolean().default(true),
      isFeatured: z.boolean().default(false),
      weight: z.number().optional(),
      freeShipping: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Gerar SKU único
      const sku = `TDAH-${nanoid(8).toUpperCase()}`;
      
      // Gerar slug a partir do nome
      const slug = input.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const result = await db.insert(storeProducts).values({
        sku,
        name: input.name,
        description: input.description || null,
        longDescription: input.longDescription || null,
        category: input.category,
        priceInCents: input.priceInCents,
        compareAtPriceInCents: input.compareAtPriceInCents ?? null,
        pointsPrice: input.pointsPrice ?? null,
        pointsOnly: input.pointsOnly,
        stock: input.stock ?? 0,
        imageUrl: input.imageUrl || null,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
        weight: input.weight ?? null,
        freeShipping: input.freeShipping,
        slug,
      });

      return { success: true, id: result[0].insertId, sku };
    }),

  // Atualizar produto
  updateProduct: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      longDescription: z.string().optional(),
      category: z.enum(["PLANNER", "TIMER", "FIDGET", "ORGANIZER", "BOOK", "ACCESSORY", "KIT"]).optional(),
      priceInCents: z.number().min(0).optional(),
      compareAtPriceInCents: z.number().min(0).optional(),
      pointsPrice: z.number().min(1).optional(),
      pointsOnly: z.boolean().optional(),
      stock: z.number().min(0).optional(),
      imageUrl: z.string().optional(),
      isActive: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
      weight: z.number().optional(),
      freeShipping: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const { id, ...updates } = input;
      
      // Remover campos undefined
      const cleanUpdates: Record<string, any> = {};
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanUpdates[key] = value;
        }
      });

      if (Object.keys(cleanUpdates).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Nenhum campo para atualizar" });
      }

      // Atualizar slug se o nome mudou
      if (cleanUpdates.name) {
        cleanUpdates.slug = cleanUpdates.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }

      await db.update(storeProducts)
        .set(cleanUpdates)
        .where(eq(storeProducts.id, id));

      return { success: true };
    }),

  // Deletar produto (soft delete - desativa)
  deleteProduct: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.update(storeProducts)
        .set({ isActive: false })
        .where(eq(storeProducts.id, input.id));

      return { success: true };
    }),

  // ==================== PEDIDOS ====================

  // Listar todos os pedidos
  listOrders: adminProcedure
    .input(z.object({
      status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED", "REFUNDED"]).optional(),
      search: z.string().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const page = input?.page || 1;
      const limit = input?.limit || 20;
      const offset = (page - 1) * limit;

      // Buscar pedidos com informações do usuário
      const allOrders = await db
        .select({
          id: storeOrders.id,
          userId: storeOrders.userId,
          orderNumber: storeOrders.orderNumber,
          status: storeOrders.status,
          paymentMethod: storeOrders.paymentMethod,
          subtotalInCents: storeOrders.subtotalInCents,
          shippingInCents: storeOrders.shippingInCents,
          discountInCents: storeOrders.discountInCents,
          totalInCents: storeOrders.totalInCents,
          pointsUsed: storeOrders.pointsUsed,
          shippingName: storeOrders.shippingName,
          shippingEmail: storeOrders.shippingEmail,
          shippingPhone: storeOrders.shippingPhone,
          shippingAddress: storeOrders.shippingAddress,
          shippingCity: storeOrders.shippingCity,
          shippingState: storeOrders.shippingState,
          shippingZip: storeOrders.shippingZip,
          trackingCode: storeOrders.trackingCode,
          shippedAt: storeOrders.shippedAt,
          deliveredAt: storeOrders.deliveredAt,
          customerNotes: storeOrders.customerNotes,
          internalNotes: storeOrders.internalNotes,
          createdAt: storeOrders.createdAt,
          updatedAt: storeOrders.updatedAt,
          userName: users.name,
          userEmail: users.email,
        })
        .from(storeOrders)
        .leftJoin(users, eq(storeOrders.userId, users.id))
        .orderBy(desc(storeOrders.createdAt));

      // Filtrar
      let filtered = allOrders;
      if (input?.status) {
        filtered = filtered.filter(o => o.status === input.status);
      }
      if (input?.search) {
        const searchLower = input.search.toLowerCase();
        filtered = filtered.filter(o => 
          o.userName?.toLowerCase().includes(searchLower) ||
          o.userEmail?.toLowerCase().includes(searchLower) ||
          o.orderNumber?.toLowerCase().includes(searchLower) ||
          o.shippingName?.toLowerCase().includes(searchLower) ||
          o.trackingCode?.toLowerCase().includes(searchLower)
        );
      }

      const total = filtered.length;
      const paginated = filtered.slice(offset, offset + limit);

      return {
        items: paginated,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Atualizar status do pedido
  updateOrderStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED", "REFUNDED"]),
      trackingNumber: z.string().optional(),
      trackingUrl: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const updates: Record<string, any> = {
        status: input.status,
      };

      if (input.trackingNumber) {
        updates.trackingCode = input.trackingNumber;
      }
      if (input.notes) {
        updates.internalNotes = input.notes;
      }

      await db.update(storeOrders)
        .set(updates)
        .where(eq(storeOrders.id, input.id));

      return { success: true };
    }),

  // Cancelar pedido e devolver pontos se aplicável
  cancelOrder: adminProcedure
    .input(z.object({
      id: z.number(),
      reason: z.string().optional(),
      refundPoints: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Buscar o pedido
      const [order] = await db
        .select()
        .from(storeOrders)
        .where(eq(storeOrders.id, input.id))
        .limit(1);

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pedido não encontrado" });
      }

      if (order.status === "CANCELED" || order.status === "REFUNDED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Pedido já foi cancelado/reembolsado" });
      }

      if (order.status === "DELIVERED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Não é possível cancelar um pedido já entregue" });
      }

      // Devolver pontos ao usuário se aplicável
      let pointsRefunded = 0;
      if (input.refundPoints && order.pointsUsed && order.pointsUsed > 0) {
        await db.update(userGamification)
          .set({
            totalXp: sql`${userGamification.totalXp} + ${order.pointsUsed}`,
          })
          .where(eq(userGamification.userId, order.userId));
        pointsRefunded = order.pointsUsed;
      }

      // Atualizar status
      await db.update(storeOrders)
        .set({
          status: "CANCELED",
          internalNotes: input.reason ? `Cancelado: ${input.reason}` : "Cancelado pelo admin",
        })
        .where(eq(storeOrders.id, input.id));

      return { success: true, pointsRefunded };
    }),

  // ==================== MÉTRICAS ====================

  // Dashboard de métricas da loja
  getStoreMetrics: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    // Total de produtos
    const allProducts = await db.select().from(storeProducts);
    const totalProducts = allProducts.length;
    const activeProducts = allProducts.filter(p => p.isActive).length;

    // Total de pedidos
    const allOrders = await db.select().from(storeOrders);
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(o => o.status === "PENDING").length;
    const paidOrders = allOrders.filter(o => o.status === "PAID").length;
    const processingOrders = allOrders.filter(o => o.status === "PROCESSING").length;
    const shippedOrders = allOrders.filter(o => o.status === "SHIPPED").length;
    const deliveredOrders = allOrders.filter(o => o.status === "DELIVERED").length;
    const canceledOrders = allOrders.filter(o => o.status === "CANCELED").length;

    // Receita total (pedidos não cancelados)
    const totalRevenue = allOrders
      .filter(o => o.status !== "CANCELED" && o.status !== "REFUNDED")
      .reduce((sum, o) => sum + o.totalInCents, 0);

    // Total de pontos usados
    const totalPointsUsed = allOrders
      .filter(o => o.status !== "CANCELED" && o.status !== "REFUNDED")
      .reduce((sum, o) => sum + (o.pointsUsed || 0), 0);

    // Pedidos por mês (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentOrders = allOrders.filter(o => 
      new Date(o.createdAt) >= sixMonthsAgo && o.status !== "CANCELED"
    );

    const ordersByMonth: Record<string, { count: number; revenue: number }> = {};
    recentOrders.forEach(o => {
      const month = new Date(o.createdAt).toISOString().slice(0, 7);
      if (!ordersByMonth[month]) {
        ordersByMonth[month] = { count: 0, revenue: 0 };
      }
      ordersByMonth[month].count++;
      ordersByMonth[month].revenue += o.totalInCents;
    });

    // Produtos com estoque baixo
    const lowStockProducts = allProducts.filter(p => 
      p.isActive && 
      p.trackInventory && 
      p.stock !== null && 
      p.lowStockThreshold !== null &&
      p.stock <= p.lowStockThreshold
    );

    return {
      products: {
        total: totalProducts,
        active: activeProducts,
        inactive: totalProducts - activeProducts,
        lowStock: lowStockProducts.length,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        paid: paidOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        canceled: canceledOrders,
      },
      revenue: {
        totalInCents: totalRevenue,
        totalPointsUsed,
      },
      ordersByMonth: Object.entries(ordersByMonth)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, data]) => ({ month, ...data })),
      lowStockProducts: lowStockProducts.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock: p.stock,
        threshold: p.lowStockThreshold,
      })),
    };
  }),
});
