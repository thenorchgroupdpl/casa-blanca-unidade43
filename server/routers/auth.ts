import { z } from "zod";
import bcrypt from "bcryptjs";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import * as db from "../db";
import { sdk } from "../_core/sdk";

export const emailAuthRouter = router({
  // Login with email/password
  login: publicProcedure
    .input(z.object({
      email: z.string().email("Email inválido"),
      password: z.string().min(1, "Senha é obrigatória"),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await db.getUserByEmail(input.email);
      
      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
      
      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      // Create session token using the SDK (same format as OAuth)
      // Use email as openId for email-based auth (email is unique identifier)
      const openId = user.openId || `email:${user.email}`;
      const token = await sdk.createSessionToken(openId, {
        name: user.name || user.email || "User",
        expiresInMs: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Update last signed in
      await db.upsertUser({
        openId: user.openId,
        lastSignedIn: new Date(),
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
        },
      };
    }),

  // Register new user (for testing purposes)
  register: publicProcedure
    .input(z.object({
      email: z.string().email("Email inválido"),
      password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
      name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
      role: z.enum(["user", "client_admin"]).default("user"),
      tenantId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      // Check if email already exists
      const existingUser = await db.getUserByEmail(input.email);
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Este email já está em uso",
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Create user
      const userId = await db.createUserWithPassword({
        email: input.email,
        passwordHash,
        name: input.name,
        role: input.role,
        tenantId: input.tenantId,
      });

      return {
        success: true,
        userId,
      };
    }),

  // Check if user is authenticated
  check: publicProcedure.query(({ ctx }) => {
    if (!ctx.user) {
      return { authenticated: false, user: null };
    }

    return {
      authenticated: true,
      user: {
        id: ctx.user.id,
        email: ctx.user.email,
        name: ctx.user.name,
        role: ctx.user.role,
        tenantId: ctx.user.tenantId,
      },
    };
  }),
});
