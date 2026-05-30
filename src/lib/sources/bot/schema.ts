import { z } from "zod";

// Mirrors the bot's /internal/admin/* response contracts exactly
// (imagine-ai-bot: src/db/admin-*.ts).

export const overviewSchema = z.object({
  activeStudents: z.number(),
  quietStudents: z.number(),
  messagesToday: z.number(),
  messages7d: z.number(),
  messages30d: z.number(),
  openEscalations: z.number(),
  health: z.object({
    queueBacklog: z.number(),
    failedWebhooks: z.number(),
    failedFollowUps: z.number(),
  }),
});
export type Overview = z.infer<typeof overviewSchema>;

export const chatThreadSchema = z.object({
  studentExternalId: z.string(),
  studentName: z.string().nullable(),
  coach: z.string().nullable(),
  cohort: z.string().nullable(),
  lastMessageAt: z.string(),
  lastDirection: z.enum(["in", "out"]),
  inCount: z.number(),
  outCount: z.number(),
  openEscalation: z.boolean(),
});
export type ChatThread = z.infer<typeof chatThreadSchema>;

export const chatThreadPageSchema = z.object({
  threads: z.array(chatThreadSchema),
  nextCursor: z.string().nullable(),
});
export type ChatThreadPage = z.infer<typeof chatThreadPageSchema>;

export const chatMessageSchema = z.object({
  at: z.string(),
  direction: z.enum(["in", "out"]),
  content: z.string(),
  model: z.string().nullable(),
  toneHint: z.string().nullable(),
  edited: z.boolean(),
});

export const chatThreadDetailSchema = z.object({
  studentExternalId: z.string(),
  studentName: z.string().nullable(),
  summary: z.string().nullable(),
  messages: z.array(chatMessageSchema),
  escalations: z.array(
    z.object({
      id: z.string(),
      at: z.string(),
      status: z.string(),
      triggeredBy: z.string(),
    }),
  ),
});
export type ChatThreadDetail = z.infer<typeof chatThreadDetailSchema>;

export const escalationRowSchema = z.object({
  id: z.string(),
  studentExternalId: z.string(),
  studentName: z.string().nullable(),
  coach: z.string().nullable(),
  triggeredBy: z.string(),
  triggerDetail: z.string().nullable(),
  status: z.enum(["open", "acknowledged", "resolved"]),
  createdAt: z.string(),
  acknowledgedAt: z.string().nullable(),
  resolvedAt: z.string().nullable(),
  timeToAckSeconds: z.number().nullable(),
  timeToResolveSeconds: z.number().nullable(),
});
export type EscalationRow = z.infer<typeof escalationRowSchema>;
export const escalationsSchema = z.array(escalationRowSchema);

export const healthSchema = z.object({
  queue: z.object({
    pending: z.number(),
    oldestPendingAt: z.string().nullable(),
    recentErrors: z.array(z.object({ at: z.string(), error: z.string() })),
  }),
  webhooks: z.object({
    failedCount: z.number(),
    byOutcome: z.record(z.string(), z.number()),
  }),
  followUps: z.object({
    failedCount: z.number(),
    recentFailures: z.array(
      z.object({ at: z.string(), reason: z.string().nullable() }),
    ),
  }),
  stuckThemes: z.number(),
});
export type Health = z.infer<typeof healthSchema>;
