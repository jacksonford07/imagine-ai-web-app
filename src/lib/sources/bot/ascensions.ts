import "server-only";
import { z } from "zod";
import type { SourceResult } from "../contract";
import { fetchSource, type DateWindow } from "./client";

// Time-to-ascension distribution for the Ascensions page over
// GET /internal/admin/ceo/ascensions/distribution. (The headline rate, BE
// customers/revenue, median days, and the funnel itself come from the existing
// /ceo/kpis, /ceo/cohorts and /ceo/funnel adapters.) Tolerant: buckets default
// to empty so the histogram shows its awaiting state instead of failing.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const isoOrNull = z
  .string()
  .nullish()
  .transform((v): string | null => v ?? null);

const bucketSchema = z
  .object({
    /** Bucket label, e.g. "0–7d", "8–14d". */
    label: z.string(),
    count: z.number().nullish(),
  })
  .passthrough();

export type AscensionBucket = z.infer<typeof bucketSchema>;

const distributionSchema = z
  .object({
    lastSyncedAt: isoOrNull,
    buckets: z.array(bucketSchema),
  })
  .passthrough();

export type TimeToAscension = z.infer<typeof distributionSchema>;

function normalize(raw: unknown): unknown {
  if (Array.isArray(raw)) return { buckets: raw, lastSyncedAt: null };
  if (!isRecord(raw)) return { buckets: [], lastSyncedAt: null };
  const buckets = Array.isArray(raw.buckets)
    ? raw.buckets
    : Array.isArray(raw.distribution)
      ? raw.distribution
      : [];
  return { ...raw, buckets };
}

// NOTE: the preprocess widens the schema's input type; the cast is type-level
// only (fetchSource assumes input and output types match).
const distributionContract = z.preprocess(
  normalize,
  distributionSchema,
) as unknown as z.ZodType<TimeToAscension>;

export function getTimeToAscension(
  window: DateWindow = {},
): Promise<SourceResult<TimeToAscension>> {
  return fetchSource(
    "/internal/admin/ceo/ascensions/distribution",
    distributionContract,
    { ...window },
  );
}
