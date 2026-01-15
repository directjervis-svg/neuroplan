import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// Mock Stripe
vi.mock("./stripe/stripe", () => ({
  stripe: {
    checkout: { sessions: { create: vi.fn() } },
    customers: { list: vi.fn(), create: vi.fn() },
    subscriptions: { retrieve: vi.fn(), cancel: vi.fn() },
    billingPortal: { sessions: { create: vi.fn() } },
    webhooks: { constructEvent: vi.fn() },
  },
  createCheckoutSession: vi.fn(),
  getOrCreateCustomer: vi.fn(),
  getSubscription: vi.fn(),
  cancelSubscription: vi.fn(),
  createPortalSession: vi.fn(),
  verifyWebhookSignature: vi.fn(),
}));

// Mock ENV
vi.mock("./_core/env", () => ({
  ENV: {
    stripeSecretKey: "sk_test_mock",
    stripeWebhookSecret: "whsec_mock",
    openAiApiKey: "sk-mock",
    databaseUrl: "mysql://mock",
    jwtSecret: "mock-secret",
  },
}));

// Mock getDb
vi.mock("./db", () => ({
  getDb: vi.fn(() => Promise.resolve({
    query: {},
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  })),
}));

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });
  });
});
