import { describe, expect, it, vi, beforeEach } from "vitest";
import { NEUROPLAN_PRODUCTS, getProduct, getAllProducts, hasAIFeatures, getProjectLimit } from "./stripe/products";

describe("Stripe Products", () => {
  describe("NEUROPLAN_PRODUCTS", () => {
    it("has three subscription tiers", () => {
      expect(Object.keys(NEUROPLAN_PRODUCTS)).toHaveLength(3);
      expect(NEUROPLAN_PRODUCTS.FREE).toBeDefined();
      expect(NEUROPLAN_PRODUCTS.PRO).toBeDefined();
      expect(NEUROPLAN_PRODUCTS.TEAM).toBeDefined();
    });

    it("FREE tier has correct properties", () => {
      const free = NEUROPLAN_PRODUCTS.FREE;
      expect(free.id).toBe("free");
      expect(free.name).toBe("Gratuito");
      expect(free.price.amount).toBe(0);
      expect(free.price.currency).toBe("brl");
      expect(free.stripePriceId).toBeNull();
    });

    it("PRO tier has correct properties", () => {
      const pro = NEUROPLAN_PRODUCTS.PRO;
      expect(pro.id).toBe("pro");
      expect(pro.name).toBe("Pro");
      expect(pro.price.amount).toBe(2900); // R$ 29,00 in cents
      expect(pro.price.currency).toBe("brl");
      expect(pro.price.interval).toBe("month");
    });

    it("TEAM tier has correct properties", () => {
      const team = NEUROPLAN_PRODUCTS.TEAM;
      expect(team.id).toBe("team");
      expect(team.name).toBe("Equipe");
      expect(team.price.amount).toBe(7900); // R$ 79,00 in cents
      expect(team.price.currency).toBe("brl");
      expect(team.price.interval).toBe("month");
    });
  });

  describe("getProduct", () => {
    it("returns correct product by ID", () => {
      expect(getProduct("FREE")).toBe(NEUROPLAN_PRODUCTS.FREE);
      expect(getProduct("PRO")).toBe(NEUROPLAN_PRODUCTS.PRO);
      expect(getProduct("TEAM")).toBe(NEUROPLAN_PRODUCTS.TEAM);
    });
  });

  describe("getAllProducts", () => {
    it("returns all products as array", () => {
      const products = getAllProducts();
      expect(products).toHaveLength(3);
      expect(products).toContain(NEUROPLAN_PRODUCTS.FREE);
      expect(products).toContain(NEUROPLAN_PRODUCTS.PRO);
      expect(products).toContain(NEUROPLAN_PRODUCTS.TEAM);
    });
  });

  describe("hasAIFeatures", () => {
    it("returns false for FREE tier", () => {
      expect(hasAIFeatures("FREE")).toBe(false);
    });

    it("returns true for PRO tier", () => {
      expect(hasAIFeatures("PRO")).toBe(true);
    });

    it("returns true for TEAM tier", () => {
      expect(hasAIFeatures("TEAM")).toBe(true);
    });
  });

  describe("getProjectLimit", () => {
    it("returns 1 for FREE tier", () => {
      expect(getProjectLimit("FREE")).toBe(1);
    });

    it("returns Infinity for PRO tier", () => {
      expect(getProjectLimit("PRO")).toBe(Infinity);
    });

    it("returns Infinity for TEAM tier", () => {
      expect(getProjectLimit("TEAM")).toBe(Infinity);
    });
  });
});
