import "server-only";
import { z } from "zod";
import type { SourceResult } from "../contract";
import { fetchSource, type DateWindow } from "./client";

// Marketing-page extras over GET /internal/admin/ceo/marketing: the paid vs
// organic split, the lead → close full funnel, and a daily ad-spend series.
// (Headline cards — ad spend, FE sales, FE CPA, blended ROAS — come from the
// existing /ceo/kpis adapter.) Tolerant throughout so any missing piece renders
// "—"/empty until the bot serves it.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const isoOrNull = z
  .string()
  .nullish()
  .transform((v): string | null => v ?? null);

// One row of the paid vs organic split table; values are cents or fractions
// depending on the metric, so each is just a nullable number.
const splitRowSchema = z
  .object({
    metric: z.string(),
    paid: z.number().nullish(),
    organic: z.number().nullish(),
    blended: z.number().nullish(),
  })
  .passthrough();

export type SplitRow = z.infer<typeof splitRowSchema>;

const fullFunnelSchema = z
  .object({
    leads: z.number().nullish(),
    optIns: z.number().nullish(),
    feSales: z.number().nullish(),
    callsBooked: z.number().nullish(),
    closed: z.number().nullish(),
  })
  .passthrough();

export type FullFunnel = z.infer<typeof fullFunnelSchema>;

const adSpendPointSchema = z
  .object({
    date: z.string(),
    spendCents: z.number().nullish(),
  })
  .passthrough();

export type AdSpendPoint = z.infer<typeof adSpendPointSchema>;

const marketingSchema = z
  .object({
    lastSyncedAt: isoOrNull,
    split: z.array(splitRowSchema),
    fullFunnel: fullFunnelSchema.nullable(),
    adSpendDaily: z.array(adSpendPointSchema),
  })
  .passthrough();

export type Marketing = z.infer<typeof marketingSchema>;

function normalize(raw: unknown): unknown {
  if (!isRecord(raw)) {
    return { split: [], fullFunnel: null, adSpendDaily: [], lastSyncedAt: null };
  }
  return {
    ...raw,
    split: Array.isArray(raw.split) ? raw.split : [],
    fullFunnel: isRecord(raw.fullFunnel) ? raw.fullFunnel : null,
    adSpendDaily: Array.isArray(raw.adSpendDaily)
      ? raw.adSpendDaily
      : Array.isArray(raw.spendSeries)
        ? raw.spendSeries
        : [],
  };
}

// NOTE: the preprocess widens the schema's input type; the cast is type-level
// only (fetchSource assumes input and output types match).
const marketingContract = z.preprocess(
  normalize,
  marketingSchema,
) as unknown as z.ZodType<Marketing>;

export function getMarketing(
  window: DateWindow = {},
): Promise<SourceResult<Marketing>> {
  return fetchSource("/internal/admin/ceo/marketing", marketingContract, {
    ...window,
  });
}
