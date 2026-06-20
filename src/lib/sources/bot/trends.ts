import "server-only";
import { z } from "zod";
import type { SourceResult } from "../contract";
import { fetchSource } from "./client";

// Multi-month history for the Trends page over GET /internal/admin/ceo/trends.
// Each row is one calendar month; metrics are nullable so a partially-built
// history still renders, and the rows array defaults to empty so the charts
// show their "no history yet" state instead of failing.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const isoOrNull = z
  .string()
  .nullish()
  .transform((v): string | null => v ?? null);

const monthPointSchema = z
  .object({
    /** Month key/label, e.g. "2026-05" or "May '26". */
    month: z.string(),
    cashCents: z.number().nullish(),
    spendCents: z.number().nullish(),
    roas: z.number().nullish(),
    htoCloses: z.number().nullish(),
    ascensionRate: z.number().nullish(),
  })
  .passthrough();

export type MonthPoint = z.infer<typeof monthPointSchema>;

const trendsSchema = z
  .object({
    lastSyncedAt: isoOrNull,
    months: z.array(monthPointSchema),
  })
  .passthrough();

export type Trends = z.infer<typeof trendsSchema>;

function normalize(raw: unknown): unknown {
  if (Array.isArray(raw)) return { months: raw, lastSyncedAt: null };
  if (!isRecord(raw)) return { months: [], lastSyncedAt: null };
  const months = Array.isArray(raw.months)
    ? raw.months
    : Array.isArray(raw.rows)
      ? raw.rows
      : [];
  return { ...raw, months };
}

// NOTE: the preprocess widens the schema's input type; the cast is type-level
// only (fetchSource assumes input and output types match).
const trendsContract = z.preprocess(
  normalize,
  trendsSchema,
) as unknown as z.ZodType<Trends>;

export function getTrends(months = 6): Promise<SourceResult<Trends>> {
  return fetchSource("/internal/admin/ceo/trends", trendsContract, { months });
}
