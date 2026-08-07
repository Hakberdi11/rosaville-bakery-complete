import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createCustomCakeOrder, getMenuItems, getMenuItemsByCategory, getTeamMembers, createContactMessage } from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  customCakes: router({
    submitOrder: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(10),
        occasion: z.string().min(1),
        cakeSize: z.string().min(1),
        flavor: z.string().min(1),
        customRequests: z.string().optional(),
        preferredDate: z.string().min(1),
        inspirationImageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          await createCustomCakeOrder({
            name: input.name,
            email: input.email,
            phone: input.phone,
            occasion: input.occasion,
            cakeSize: input.cakeSize,
            flavor: input.flavor,
            customRequests: input.customRequests || null,
            preferredDate: input.preferredDate,
            inspirationImageUrl: input.inspirationImageUrl || null,
          });
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to submit custom cake order",
          });
        }
      }),
  }),

  contact: router({
    submitMessage: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        subject: z.string().min(1),
        message: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          await createContactMessage({
            name: input.name,
            email: input.email,
            phone: input.phone || null,
            subject: input.subject,
            message: input.message,
          });
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to submit contact message",
          });
        }
      }),
  }),

  menu: router({
    getAll: publicProcedure.query(async () => {
      try {
        return await getMenuItems();
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch menu items",
        });
      }
    }),
    getByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        try {
          return await getMenuItemsByCategory(input.category);
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch menu items by category",
          });
        }
      }),
  }),

  team: router({
    getAll: publicProcedure.query(async () => {
      try {
        return await getTeamMembers();
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch team members",
        });
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
