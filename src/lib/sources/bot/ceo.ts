import "server-only";
import { z } from "zod";
import type { SourceResult } from "../contract";
import { fetchSource, type DateWindow } from "./client";

// Mirrors what the bot's /internal/admin/ceo/* endpoints will return once the
// CEO entries land in Render Postgres. Until then these calls resolve to a
// SourceResult error and the UI renders its scaffold with "—" metrics.

const tierKeySchema = z.enum(["LTO", "MTO", "HTO", "PTO", "OTHER"]);

const moneySchema = z.object({
  grossCents: z.number(),
  processorFeeCents: z.number(),
  financingFeeCents: z.number(),
  netCents: z.number(),
});

const tierStatSchema = z.object({
  key: tierKeySchema,
  customers: z.number(),
  grossCents: z.number(),
  netCents: z.number(),
});

export const ceoOverviewSchema = z.object({
  window: z.object({ from: z.string(), to: z.string() }),
  totals: moneySchema.extend({ adSpendCents: z.number() }),
  tiers: z.array(tierStatSchema),
});

export type CeoOverview = z.infer<typeof ceoOverviewSchema>;
export type TierStat = z.infer<typeof tierStatSchema>;

const cohortRowSchema = z.object({
  key: tierKeySchema,
  customers: z.number(),
  grossCents: z.number(),
  netCents: z.number(),
  /** Fraction (0–1) of this tier's customers that ascended to the next rung. */
  ascensionRate: z.number().nullable(),
});

export const ceoCohortsSchema = z.object({
  window: z.object({ from: z.string(), to: z.string() }),
  rows: z.array(cohortRowSchema),
});

export type CeoCohorts = z.infer<typeof ceoCohortsSchema>;
export type CohortRow = z.infer<typeof cohortRowSchema>;

export function getCeoOverview(
  window: DateWindow = {},
): Promise<SourceResult<CeoOverview>> {
  return fetchSource("/internal/admin/ceo/overview", ceoOverviewSchema, {
    ...window,
  });
}

export function getCeoCohorts(
  window: DateWindow = {},
): Promise<SourceResult<CeoCohorts>> {
  return fetchSource("/internal/admin/ceo/cohorts", ceoCohortsSchema, {
    ...window,
  });
}
