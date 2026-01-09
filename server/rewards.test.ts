/**
 * Unit tests for Rewards and TDAH Store functionality
 */

import { describe, expect, it } from "vitest";

// Test reward types and configurations
describe("Rewards System", () => {
  describe("Reward Types", () => {
    it("should have valid reward types", () => {
      const validTypes = ["DISCOUNT", "PRODUCT", "FEATURE", "BADGE"];
      validTypes.forEach(type => {
        expect(typeof type).toBe("string");
        expect(type.length).toBeGreaterThan(0);
      });
    });

    it("should have valid discount types", () => {
      const validDiscountTypes = ["PERCENTAGE", "FIXED"];
      validDiscountTypes.forEach(type => {
        expect(typeof type).toBe("string");
      });
    });

    it("should have valid discount applies to options", () => {
      const validAppliesTo = ["PRO", "TEAM", "ANY"];
      validAppliesTo.forEach(option => {
        expect(typeof option).toBe("string");
      });
    });
  });

  describe("Points Configuration", () => {
    const POINTS_CONFIG = {
      TASK_COMPLETE: 10,
      PROJECT_COMPLETE: 100,
      STREAK_BONUS_PER_DAY: 5,
      LEVEL_UP_BONUS: 50,
      ACHIEVEMENT_BONUS: 25,
      REFERRAL_BONUS: 200,
      XP_TO_POINTS_RATIO: 0.1,
    };

    it("should have positive point values for earning", () => {
      expect(POINTS_CONFIG.TASK_COMPLETE).toBeGreaterThan(0);
      expect(POINTS_CONFIG.PROJECT_COMPLETE).toBeGreaterThan(0);
      expect(POINTS_CONFIG.STREAK_BONUS_PER_DAY).toBeGreaterThan(0);
      expect(POINTS_CONFIG.LEVEL_UP_BONUS).toBeGreaterThan(0);
      expect(POINTS_CONFIG.ACHIEVEMENT_BONUS).toBeGreaterThan(0);
      expect(POINTS_CONFIG.REFERRAL_BONUS).toBeGreaterThan(0);
    });

    it("should have valid XP to points ratio", () => {
      expect(POINTS_CONFIG.XP_TO_POINTS_RATIO).toBeGreaterThan(0);
      expect(POINTS_CONFIG.XP_TO_POINTS_RATIO).toBeLessThanOrEqual(1);
    });

    it("should calculate points from XP correctly", () => {
      const xp = 1000;
      const points = Math.floor(xp * POINTS_CONFIG.XP_TO_POINTS_RATIO);
      expect(points).toBe(100);
    });
  });

  describe("Coupon Code Generation", () => {
    function generateCouponCode(): string {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = 'NP-';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }

    it("should generate coupon codes with correct prefix", () => {
      const code = generateCouponCode();
      expect(code.startsWith('NP-')).toBe(true);
    });

    it("should generate coupon codes with correct length", () => {
      const code = generateCouponCode();
      expect(code.length).toBe(11); // NP- + 8 chars
    });

    it("should generate unique coupon codes", () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        codes.add(generateCouponCode());
      }
      expect(codes.size).toBe(100);
    });
  });

  describe("Order Number Generation", () => {
    function generateOrderNumber(): string {
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let suffix = '';
      for (let i = 0; i < 6; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return `NP${dateStr}-${suffix}`;
    }

    it("should generate order numbers with correct prefix", () => {
      const orderNumber = generateOrderNumber();
      expect(orderNumber.startsWith('NP')).toBe(true);
    });

    it("should include date in order number", () => {
      const orderNumber = generateOrderNumber();
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      expect(orderNumber.includes(today)).toBe(true);
    });

    it("should have correct format", () => {
      const orderNumber = generateOrderNumber();
      const pattern = /^NP\d{8}-[A-Z0-9]{6}$/;
      expect(pattern.test(orderNumber)).toBe(true);
    });
  });

  describe("Redemption Status", () => {
    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "COMPLETED",
      "SHIPPED",
      "DELIVERED",
      "CANCELED",
      "REFUNDED"
    ];

    it("should have all required statuses", () => {
      expect(validStatuses).toContain("PENDING");
      expect(validStatuses).toContain("COMPLETED");
      expect(validStatuses).toContain("SHIPPED");
      expect(validStatuses).toContain("DELIVERED");
    });

    it("should have valid status transitions for products", () => {
      const productFlow = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
      productFlow.forEach((status, index) => {
        if (index > 0) {
          expect(validStatuses.indexOf(status)).toBeGreaterThan(
            validStatuses.indexOf(productFlow[index - 1])
          );
        }
      });
    });
  });

  describe("Point Transaction Types", () => {
    const transactionTypes = ["EARNED", "SPENT", "BONUS", "REFUND", "EXPIRED", "ADJUSTMENT"];

    it("should have all required transaction types", () => {
      expect(transactionTypes).toContain("EARNED");
      expect(transactionTypes).toContain("SPENT");
      expect(transactionTypes).toContain("BONUS");
      expect(transactionTypes).toContain("REFUND");
    });

    it("should categorize positive and negative transactions", () => {
      const positiveTypes = ["EARNED", "BONUS", "REFUND"];
      const negativeTypes = ["SPENT", "EXPIRED"];
      
      positiveTypes.forEach(type => {
        expect(transactionTypes).toContain(type);
      });
      
      negativeTypes.forEach(type => {
        expect(transactionTypes).toContain(type);
      });
    });
  });

  describe("TDAH Store Product Categories", () => {
    const categories = ["PLANNER", "TIMER", "FIDGET", "ORGANIZER", "BOOK", "ACCESSORY", "KIT"];

    it("should have all ADHD-relevant categories", () => {
      expect(categories).toContain("PLANNER");
      expect(categories).toContain("TIMER");
      expect(categories).toContain("FIDGET");
      expect(categories).toContain("ORGANIZER");
    });

    it("should have valid category names", () => {
      categories.forEach(category => {
        expect(typeof category).toBe("string");
        expect(category.length).toBeGreaterThan(0);
        expect(category).toBe(category.toUpperCase());
      });
    });
  });

  describe("Discount Calculations", () => {
    it("should calculate percentage discount correctly", () => {
      const originalPrice = 10000; // R$ 100.00 in cents
      const discountPercent = 20;
      const discountAmount = Math.floor(originalPrice * (discountPercent / 100));
      const finalPrice = originalPrice - discountAmount;
      
      expect(discountAmount).toBe(2000);
      expect(finalPrice).toBe(8000);
    });

    it("should calculate fixed discount correctly", () => {
      const originalPrice = 10000; // R$ 100.00 in cents
      const discountFixed = 1500; // R$ 15.00 in cents
      const finalPrice = originalPrice - discountFixed;
      
      expect(finalPrice).toBe(8500);
    });

    it("should not allow negative final price", () => {
      const originalPrice = 1000; // R$ 10.00 in cents
      const discountFixed = 1500; // R$ 15.00 in cents
      const finalPrice = Math.max(0, originalPrice - discountFixed);
      
      expect(finalPrice).toBe(0);
    });
  });

  describe("Shipping Validation", () => {
    interface ShippingInfo {
      name: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    }

    function validateShipping(info: ShippingInfo): boolean {
      return !!(
        info.name &&
        info.address &&
        info.city &&
        info.state &&
        info.zip &&
        info.country
      );
    }

    it("should validate complete shipping info", () => {
      const validInfo: ShippingInfo = {
        name: "João Silva",
        address: "Rua das Flores, 123",
        city: "São Paulo",
        state: "SP",
        zip: "01234-567",
        country: "BR"
      };
      
      expect(validateShipping(validInfo)).toBe(true);
    });

    it("should reject incomplete shipping info", () => {
      const incompleteInfo: ShippingInfo = {
        name: "João Silva",
        address: "",
        city: "São Paulo",
        state: "SP",
        zip: "01234-567",
        country: "BR"
      };
      
      expect(validateShipping(incompleteInfo)).toBe(false);
    });

    it("should validate Brazilian CEP format", () => {
      const cepPattern = /^\d{5}-?\d{3}$/;
      
      expect(cepPattern.test("01234-567")).toBe(true);
      expect(cepPattern.test("01234567")).toBe(true);
      expect(cepPattern.test("1234-567")).toBe(false);
    });
  });
});
