import "server-only";
import { z } from "zod";
import type { SourceResult } from "../contract";
import { fetchSource, type DateWindow } from "./client";

// Daily cash & spend series for the CEO Overview chart, over the bot's
// GET /internal/admin/ceo/overview/daily. Tolerant on top: the bot may send a
// bare array, { points: [...] }, or { series: [...] }, and each point's metrics
// may be absent — all normalize so the chart renders "—"/empty until the bot
// pipeline lands the daily rollup, never failing the page.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const dailyPointSchema = z
  .object({
    date: z.string(),
    cashCents: z.number().nullish(),
    spendCents: z.number().nullish(),
  })
  .passthrough();

export type DailyPoint = z.infer<typeof dailyPointSchema>;

const overviewDailySchema = z
  .object({
    lastSyncedAt: z
      .string()
      .nullish()
      .transform((v): string | null => v ?? null),
    points: z.array(dailyPointSchema),
  })
  .passthrough();

export type OverviewDaily = z.infer<typeof overviewDailySchema>;

function normalize(raw: unknown): unknown {
  if (Array.isArray(raw)) return { points: raw, lastSyncedAt: null };
  if (!isRecord(raw)) return { points: [], lastSyncedAt: null };
  const points = Array.isArray(raw.points)
    ? raw.points
    : Array.isArray(raw.series)
      ? raw.series
      : [];
  return { ...raw, points };
}

// NOTE: the preprocess widens the schema's input type; the cast is type-level
// only (fetchSource assumes input and output types match).
const overviewDailyContract = z.preprocess(
  normalize,
  overviewDailySchema,
) as unknown as z.ZodType<OverviewDaily>;

export function getCeoOverviewDaily(
  window: DateWindow = {},
): Promise<SourceResult<OverviewDaily>> {
  return fetchSource(
    "/internal/admin/ceo/overview/daily",
    overviewDailyContract,
    { ...window },
  );
}
