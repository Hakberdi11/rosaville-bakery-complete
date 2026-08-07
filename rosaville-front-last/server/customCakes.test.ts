import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("customCakes.submitOrder", () => {
  it("accepts valid custom cake order data", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.customCakes.submitOrder({
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "5551234567",
      occasion: "birthday",
      cakeSize: "8-inch",
      flavor: "chocolate",
      customRequests: "No nuts please",
      preferredDate: "2026-08-15",
    });

    expect(result).toEqual({ success: true });
  });

  it("validates required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.customCakes.submitOrder({
        name: "",
        email: "jane@example.com",
        phone: "5551234567",
        occasion: "birthday",
        cakeSize: "8-inch",
        flavor: "chocolate",
        customRequests: "",
        preferredDate: "2026-08-15",
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });
});
