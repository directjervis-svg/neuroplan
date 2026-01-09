/**
 * Testes unitários para o painel admin da TDAH Store
 */

import { describe, expect, it } from "vitest";

// Tipos para os testes
interface StoreProduct {
  id: number;
  name: string;
  description: string;
  pointsCost: number;
  category: "physical" | "discount" | "digital";
  stock: number;
  isActive: boolean;
  imageUrl: string | null;
}

interface StoreOrder {
  id: number;
  userId: number;
  productId: number;
  pointsSpent: number;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "canceled";
  shippingAddress: string | null;
  trackingCode: string | null;
  createdAt: Date;
}

interface StoreMetrics {
  products: {
    total: number;
    active: number;
    inactive: number;
    lowStock: number;
  };
  orders: {
    total: number;
    pending: number;
    paid: number;
    processing: number;
    shipped: number;
    delivered: number;
    canceled: number;
  };
  revenue: {
    totalInCents: number;
    totalPointsUsed: number;
  };
}

// Funções auxiliares para testes
function validateProduct(product: Partial<StoreProduct>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!product.name || product.name.trim().length === 0) {
    errors.push("Nome é obrigatório");
  }
  
  if (!product.description || product.description.trim().length === 0) {
    errors.push("Descrição é obrigatória");
  }
  
  if (product.pointsCost === undefined || product.pointsCost < 0) {
    errors.push("Custo em pontos deve ser maior ou igual a zero");
  }
  
  if (product.stock !== undefined && product.stock < 0) {
    errors.push("Estoque não pode ser negativo");
  }
  
  if (product.category && !["physical", "discount", "digital"].includes(product.category)) {
    errors.push("Categoria inválida");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

function validateOrderStatusTransition(
  currentStatus: StoreOrder["status"],
  newStatus: StoreOrder["status"]
): boolean {
  const validTransitions: Record<StoreOrder["status"], StoreOrder["status"][]> = {
    pending: ["paid", "canceled"],
    paid: ["processing", "canceled"],
    processing: ["shipped", "canceled"],
    shipped: ["delivered"],
    delivered: [],
    canceled: []
  };
  
  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}

function calculateMetrics(products: StoreProduct[], orders: StoreOrder[]): StoreMetrics {
  const activeProducts = products.filter(p => p.isActive);
  const lowStockProducts = products.filter(p => p.isActive && p.stock <= 5);
  
  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalPointsUsed = orders
    .filter(o => o.status !== "canceled")
    .reduce((sum, o) => sum + o.pointsSpent, 0);
  
  return {
    products: {
      total: products.length,
      active: activeProducts.length,
      inactive: products.length - activeProducts.length,
      lowStock: lowStockProducts.length
    },
    orders: {
      total: orders.length,
      pending: ordersByStatus.pending || 0,
      paid: ordersByStatus.paid || 0,
      processing: ordersByStatus.processing || 0,
      shipped: ordersByStatus.shipped || 0,
      delivered: ordersByStatus.delivered || 0,
      canceled: ordersByStatus.canceled || 0
    },
    revenue: {
      totalInCents: 0, // Seria calculado com base em preços reais
      totalPointsUsed
    }
  };
}

function filterOrders(
  orders: StoreOrder[],
  filters: { status?: StoreOrder["status"]; userId?: number }
): StoreOrder[] {
  return orders.filter(order => {
    if (filters.status && order.status !== filters.status) return false;
    if (filters.userId && order.userId !== filters.userId) return false;
    return true;
  });
}

describe("Admin Store - Validação de Produtos", () => {
  it("deve validar produto com dados corretos", () => {
    const product: Partial<StoreProduct> = {
      name: "Planner TDAH",
      description: "Planner físico para organização",
      pointsCost: 500,
      category: "physical",
      stock: 10
    };
    
    const result = validateProduct(product);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it("deve rejeitar produto sem nome", () => {
    const product: Partial<StoreProduct> = {
      name: "",
      description: "Descrição válida",
      pointsCost: 100
    };
    
    const result = validateProduct(product);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Nome é obrigatório");
  });
  
  it("deve rejeitar produto com pontos negativos", () => {
    const product: Partial<StoreProduct> = {
      name: "Produto Teste",
      description: "Descrição",
      pointsCost: -50
    };
    
    const result = validateProduct(product);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Custo em pontos deve ser maior ou igual a zero");
  });
  
  it("deve rejeitar produto com estoque negativo", () => {
    const product: Partial<StoreProduct> = {
      name: "Produto Teste",
      description: "Descrição",
      pointsCost: 100,
      stock: -5
    };
    
    const result = validateProduct(product);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Estoque não pode ser negativo");
  });
  
  it("deve rejeitar categoria inválida", () => {
    const product = {
      name: "Produto Teste",
      description: "Descrição",
      pointsCost: 100,
      category: "invalid" as StoreProduct["category"]
    };
    
    const result = validateProduct(product);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Categoria inválida");
  });
});

describe("Admin Store - Transições de Status de Pedidos", () => {
  it("deve permitir transição de pending para paid", () => {
    expect(validateOrderStatusTransition("pending", "paid")).toBe(true);
  });
  
  it("deve permitir transição de pending para canceled", () => {
    expect(validateOrderStatusTransition("pending", "canceled")).toBe(true);
  });
  
  it("deve permitir transição de paid para processing", () => {
    expect(validateOrderStatusTransition("paid", "processing")).toBe(true);
  });
  
  it("deve permitir transição de processing para shipped", () => {
    expect(validateOrderStatusTransition("processing", "shipped")).toBe(true);
  });
  
  it("deve permitir transição de shipped para delivered", () => {
    expect(validateOrderStatusTransition("shipped", "delivered")).toBe(true);
  });
  
  it("deve rejeitar transição de delivered para qualquer outro status", () => {
    expect(validateOrderStatusTransition("delivered", "pending")).toBe(false);
    expect(validateOrderStatusTransition("delivered", "canceled")).toBe(false);
  });
  
  it("deve rejeitar transição de canceled para qualquer outro status", () => {
    expect(validateOrderStatusTransition("canceled", "pending")).toBe(false);
    expect(validateOrderStatusTransition("canceled", "processing")).toBe(false);
  });
  
  it("deve rejeitar transição inválida de pending para shipped", () => {
    expect(validateOrderStatusTransition("pending", "shipped")).toBe(false);
  });
});

describe("Admin Store - Cálculo de Métricas", () => {
  const mockProducts: StoreProduct[] = [
    { id: 1, name: "Produto 1", description: "Desc", pointsCost: 100, category: "physical", stock: 10, isActive: true, imageUrl: null },
    { id: 2, name: "Produto 2", description: "Desc", pointsCost: 200, category: "physical", stock: 3, isActive: true, imageUrl: null },
    { id: 3, name: "Produto 3", description: "Desc", pointsCost: 50, category: "discount", stock: 0, isActive: false, imageUrl: null },
    { id: 4, name: "Produto 4", description: "Desc", pointsCost: 150, category: "digital", stock: 999, isActive: true, imageUrl: null }
  ];
  
  const mockOrders: StoreOrder[] = [
    { id: 1, userId: 1, productId: 1, pointsSpent: 100, status: "delivered", shippingAddress: null, trackingCode: null, createdAt: new Date() },
    { id: 2, userId: 2, productId: 2, pointsSpent: 200, status: "pending", shippingAddress: null, trackingCode: null, createdAt: new Date() },
    { id: 3, userId: 1, productId: 1, pointsSpent: 100, status: "processing", shippingAddress: null, trackingCode: null, createdAt: new Date() },
    { id: 4, userId: 3, productId: 4, pointsSpent: 150, status: "canceled", shippingAddress: null, trackingCode: null, createdAt: new Date() },
    { id: 5, userId: 2, productId: 1, pointsSpent: 100, status: "shipped", shippingAddress: null, trackingCode: null, createdAt: new Date() }
  ];
  
  it("deve calcular total de produtos corretamente", () => {
    const metrics = calculateMetrics(mockProducts, mockOrders);
    expect(metrics.products.total).toBe(4);
  });
  
  it("deve calcular produtos ativos corretamente", () => {
    const metrics = calculateMetrics(mockProducts, mockOrders);
    expect(metrics.products.active).toBe(3);
    expect(metrics.products.inactive).toBe(1);
  });
  
  it("deve identificar produtos com estoque baixo", () => {
    const metrics = calculateMetrics(mockProducts, mockOrders);
    expect(metrics.products.lowStock).toBe(1); // Produto 2 com stock 3
  });
  
  it("deve calcular total de pedidos por status", () => {
    const metrics = calculateMetrics(mockProducts, mockOrders);
    expect(metrics.orders.total).toBe(5);
    expect(metrics.orders.pending).toBe(1);
    expect(metrics.orders.processing).toBe(1);
    expect(metrics.orders.shipped).toBe(1);
    expect(metrics.orders.delivered).toBe(1);
    expect(metrics.orders.canceled).toBe(1);
  });
  
  it("deve calcular pontos usados excluindo cancelados", () => {
    const metrics = calculateMetrics(mockProducts, mockOrders);
    // 100 + 200 + 100 + 100 = 500 (exclui o cancelado de 150)
    expect(metrics.revenue.totalPointsUsed).toBe(500);
  });
});

describe("Admin Store - Filtros de Pedidos", () => {
  const mockOrders: StoreOrder[] = [
    { id: 1, userId: 1, productId: 1, pointsSpent: 100, status: "delivered", shippingAddress: null, trackingCode: null, createdAt: new Date() },
    { id: 2, userId: 2, productId: 2, pointsSpent: 200, status: "pending", shippingAddress: null, trackingCode: null, createdAt: new Date() },
    { id: 3, userId: 1, productId: 1, pointsSpent: 100, status: "pending", shippingAddress: null, trackingCode: null, createdAt: new Date() },
    { id: 4, userId: 3, productId: 4, pointsSpent: 150, status: "canceled", shippingAddress: null, trackingCode: null, createdAt: new Date() }
  ];
  
  it("deve filtrar pedidos por status", () => {
    const filtered = filterOrders(mockOrders, { status: "pending" });
    expect(filtered).toHaveLength(2);
    expect(filtered.every(o => o.status === "pending")).toBe(true);
  });
  
  it("deve filtrar pedidos por usuário", () => {
    const filtered = filterOrders(mockOrders, { userId: 1 });
    expect(filtered).toHaveLength(2);
    expect(filtered.every(o => o.userId === 1)).toBe(true);
  });
  
  it("deve combinar filtros de status e usuário", () => {
    const filtered = filterOrders(mockOrders, { status: "pending", userId: 1 });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(3);
  });
  
  it("deve retornar todos os pedidos sem filtros", () => {
    const filtered = filterOrders(mockOrders, {});
    expect(filtered).toHaveLength(4);
  });
  
  it("deve retornar array vazio para filtro sem correspondência", () => {
    const filtered = filterOrders(mockOrders, { status: "shipped" });
    expect(filtered).toHaveLength(0);
  });
});
