import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import {
  createAuditLog,
  createNote,
  deleteNoteOwned,
  getAllUsers,
  getAuditLogs,
  getNoteByIdOwned,
  getNotesByUserId,
  updateNoteOwned,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      if (ctx.user) {
        await createAuditLog({
          actorUserId: ctx.user.id,
          eventType: "logout",
        });
      }
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  notes: router({
    list: protectedProcedure.query(({ ctx }) => getNotesByUserId(ctx.user.id)),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().trim().min(1).max(160),
          content: z.string().trim().min(1).max(10000),
        }).strict(),
      )
      .mutation(async ({ ctx, input }) => {
        const note = await createNote({ ...input, userId: ctx.user.id });
        if (!note) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await createAuditLog({
          actorUserId: ctx.user.id,
          eventType: "note_created",
          targetType: "note",
          targetId: String(note.id),
        });
        return note;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          title: z.string().trim().min(1).max(160),
          content: z.string().trim().min(1).max(10000),
        }).strict(),
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await getNoteByIdOwned(input.id, ctx.user.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
        const note = await updateNoteOwned(input.id, ctx.user.id, {
          title: input.title,
          content: input.content,
        });
        await createAuditLog({
          actorUserId: ctx.user.id,
          eventType: "note_updated",
          targetType: "note",
          targetId: String(input.id),
        });
        return note;
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }).strict())
      .mutation(async ({ ctx, input }) => {
        const existing = await getNoteByIdOwned(input.id, ctx.user.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
        await deleteNoteOwned(input.id, ctx.user.id);
        await createAuditLog({
          actorUserId: ctx.user.id,
          eventType: "note_deleted",
          targetType: "note",
          targetId: String(input.id),
        });
        return { success: true } as const;
      }),
  }),

  admin: router({
    users: adminProcedure.query(() => getAllUsers()),
    auditLogs: adminProcedure.query(() => getAuditLogs()),
  }),
});

export type AppRouter = typeof appRouter;
