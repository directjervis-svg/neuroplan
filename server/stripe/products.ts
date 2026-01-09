/**
 * NeuroPlan Subscription Products
 * Centralized product and price configuration for Stripe integration
 */

export const NEUROPLAN_PRODUCTS = {
  FREE: {
    id: "free",
    name: "Gratuito",
    description: "Perfeito para começar",
    features: [
      "1 projeto ativo",
      "Timer de foco progressivo",
      "Quick Ideas ilimitadas",
      "Registro 'Onde Parei'",
      "Sistema 3+1 de tarefas",
    ],
    limitations: [
      "Sem IA para decomposição",
      "Sem relatórios avançados",
    ],
    price: {
      amount: 0,
      currency: "brl",
      interval: "month" as const,
    },
    // No Stripe price ID for free tier
    stripePriceId: null,
  },
  PRO: {
    id: "pro",
    name: "Pro",
    description: "Para quem quer mais produtividade",
    features: [
      "Projetos ilimitados",
      "IA para decomposição de tarefas",
      "Coach Socrático com IA",
      "Entregáveis A-B-C",
      "Relatórios de progresso",
      "Exportação de dados",
      "Suporte prioritário",
    ],
    price: {
      amount: 2900, // R$ 29,00 in cents
      currency: "brl",
      interval: "month" as const,
    },
    // Will be created dynamically or set via env
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || null,
  },
  TEAM: {
    id: "team",
    name: "Equipe",
    description: "Para times e empresas",
    features: [
      "Tudo do Pro",
      "Até 10 membros",
      "Projetos compartilhados",
      "Dashboard de equipe",
      "Integrações (Slack, Teams)",
      "API de acesso",
      "Onboarding dedicado",
    ],
    price: {
      amount: 7900, // R$ 79,00 in cents
      currency: "brl",
      interval: "month" as const,
    },
    // Will be created dynamically or set via env
    stripePriceId: process.env.STRIPE_TEAM_PRICE_ID || null,
  },
} as const;

export type ProductId = keyof typeof NEUROPLAN_PRODUCTS;
export type Product = typeof NEUROPLAN_PRODUCTS[ProductId];

/**
 * Get product by ID
 */
export function getProduct(productId: ProductId): Product {
  return NEUROPLAN_PRODUCTS[productId];
}

/**
 * Get all products as array
 */
export function getAllProducts(): Product[] {
  return Object.values(NEUROPLAN_PRODUCTS);
}

/**
 * Check if a plan has AI features
 */
export function hasAIFeatures(productId: ProductId): boolean {
  return productId === "PRO" || productId === "TEAM";
}

/**
 * Get project limit for a plan
 */
export function getProjectLimit(productId: ProductId): number {
  switch (productId) {
    case "FREE":
      return 1;
    case "PRO":
    case "TEAM":
      return Infinity;
    default:
      return 1;
  }
}
