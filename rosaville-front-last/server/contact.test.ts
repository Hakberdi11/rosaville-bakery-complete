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

describe("contact.submitMessage", () => {
  it("accepts valid contact message data", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submitMessage({
      name: "John Smith",
      email: "john@example.com",
      phone: "5559876543",
      subject: "Inquiry about catering",
      message: "I would like to inquire about catering services for my event.",
    });

    expect(result).toEqual({ success: true });
  });

  it("accepts contact message without phone", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submitMessage({
      name: "Jane Doe",
      email: "jane@example.com",
      subject: "Menu question",
      message: "Do you have any vegan options?",
    });

    expect(result).toEqual({ success: true });
  });

  it("validates required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.contact.submitMessage({
        name: "",
        email: "jane@example.com",
        subject: "Test",
        message: "Test message",
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });
});
