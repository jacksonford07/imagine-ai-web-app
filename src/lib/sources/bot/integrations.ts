import "server-only";
import { z } from "zod";
import type { SourceResult } from "../contract";
import { fetchSource } from "./client";

// Mirrors the bot's /internal/admin/ceo/sync-status payload
// (imagine-ai-bot: src/server/routes/admin-sync-status.ts). Tolerant by
// design — the endpoint ships concurrently, so unknown values degrade to
// safe defaults instead of failing the whole page.

export const connectorStateSchema = z
  .enum(["missing_key", "ok", "error", "running", "never_ran"])
  .catch("never_ran");
export type ConnectorState = z.infer<typeof connectorStateSchema>;

export const backfillStatusSchema = z
  .object({
    status: z.enum(["pending", "running", "done", "error"]).catch("pending"),
    percentComplete: z.number().catch(0),
    windowStart: z.string().nullish().catch(null),
    windowEnd: z.string().nullish().catch(null),
    lastError: z.string().nullish().catch(null),
  })
  .nullish()
  .catch(null);

export const connectorStatusSchema = z.object({
  name: z.string(),
  state: connectorStateSchema,
  requiredEnvVars: z.array(z.string()).catch([]),
  missingEnvVars: z.array(z.string()).catch([]),
  lastSyncedAt: z.string().nullish().catch(null),
  lastError: z.string().nullish().catch(null),
  recordCounts: z.record(z.string(), z.number()).catch({}),
  backfill: backfillStatusSchema,
});
export type ConnectorStatus = z.infer<typeof connectorStatusSchema>;

export const syncStatusSchema = z.object({
  connectors: z.array(connectorStatusSchema),
});
export type SyncStatus = z.infer<typeof syncStatusSchema>;

export function getSyncStatus(): Promise<SourceResult<SyncStatus>> {
  // `.catch()` widens the schema's *input* type to unknown, which trips
  // fetchSource's `z.ZodType<T>` (input = output) constraint; the output
  // type is exactly SyncStatus, so this assertion is sound.
  return fetchSource(
    "/internal/admin/ceo/sync-status",
    syncStatusSchema as z.ZodType<SyncStatus>,
  );
}
