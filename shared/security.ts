import { z } from "zod";

export const auditEventSchema = z
  .object({
    actorUserId: z.number().int().positive().nullable().optional(),
    eventType: z.enum([
      "login",
      "logout",
      "note_created",
      "note_updated",
      "note_deleted",
    ]),
    targetType: z.string().trim().max(64).nullable().optional(),
    targetId: z.string().trim().max(64).nullable().optional(),
    metadata: z.string().max(4000).nullable().optional(),
  })
  .strict();

export type AuditEventInput = z.infer<typeof auditEventSchema>;
