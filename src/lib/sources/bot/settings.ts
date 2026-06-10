import "server-only";
import { z } from "zod";
import type { SourceResult } from "../contract";
import { fetchSource } from "./client";

// US-033 settings domain: alert thresholds, watchlist, commission config.
// The bot endpoints are built concurrently (Phase 3), so schemas are tolerant:
// unknown fields pass through, expected fields are nullish, and unit variants
// (rate as 0–1 fraction vs 0–100 percent) are normalized here.

const rawAlertConfigSchema = z
  .object({
    roasFloor: z.number().nullish(),
    cpaCeilingCents: z.number().nullish(),
    stalenessHours: z.number().nullish(),
    slackWebhookTarget: z.string().nullish(),
    slackChannel: z.string().nullish(),
    updatedAt: z.string().nullish(),
    updatedBy: z.string().nullish(),
  })
  .passthrough();

export interface AlertConfig {
  roasFloor: number | null;
  cpaCeilingCents: number | null;
  stalenessHours: number | null;
  /** Display-only Slack routing target (never the webhook secret itself). */
  slackTarget: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export async function getAlertConfig(): Promise<SourceResult<AlertConfig>> {
  const result = await fetchSource(
    "/internal/admin/ceo/alert-config",
    rawAlertConfigSchema,
  );
  return {
    ...result,
    data:
      result.data !== null
        ? {
            roasFloor: result.data.roasFloor ?? null,
            cpaCeilingCents: result.data.cpaCeilingCents ?? null,
            stalenessHours: result.data.stalenessHours ?? null,
            slackTarget:
              result.data.slackWebhookTarget ??
              result.data.slackChannel ??
              null,
            updatedAt: result.data.updatedAt ?? null,
            updatedBy: result.data.updatedBy ?? null,
          }
        : null,
  };
}

export const WATCHLIST_STATUSES = ["open", "acknowledged", "resolved"] as const;
export type WatchlistStatus = (typeof WATCHLIST_STATUSES)[number];

const rawWatchlistItemSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    title: z.string().nullish(),
    label: z.string().nullish(),
    /** Free text, or the bot's structured JSONB detail object. */
    detail: z.unknown().optional(),
    reason: z.string().nullish(),
    status: z.unknown().optional(),
    kind: z.string().nullish(),
    /** Bot reference like 'kpi:roas' or 'source:meta'. */
    targetRef: z.string().nullish(),
    createdAt: z.string().nullish(),
    updatedAt: z.string().nullish(),
  })
  .passthrough();

// The bot wraps the list as { count, items }; bare arrays and { rows } are
// kept for tolerance. Unwrapped before parsing so the schema output is
// always the item array.
const rawWatchlistSchema = z.preprocess((raw) => {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return raw;
  }
  const wrapper = raw as Record<string, unknown>;
  if (Array.isArray(wrapper.items)) return wrapper.items;
  if (Array.isArray(wrapper.rows)) return wrapper.rows;
  return raw;
}, z.array(rawWatchlistItemSchema));

export interface WatchlistItem {
  id: string;
  title: string;
  detail: string | null;
  status: WatchlistStatus;
  kind: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// The bot's detail is a structured JSONB object (threshold, observed value…);
// render it as compact text rather than dropping it.
function detailText(detail: unknown): string | null {
  if (typeof detail === "string") return detail;
  if (detail === null || detail === undefined) return null;
  try {
    return JSON.stringify(detail);
  } catch {
    return null;
  }
}

function toWatchlistItem(
  raw: z.infer<typeof rawWatchlistItemSchema>,
): WatchlistItem {
  const status =
    typeof raw.status === "string" &&
    (WATCHLIST_STATUSES as readonly string[]).includes(raw.status)
      ? (raw.status as WatchlistStatus)
      : "open";
  return {
    id: String(raw.id),
    title: raw.title ?? raw.label ?? raw.targetRef ?? `Item ${String(raw.id)}`,
    detail: detailText(raw.detail) ?? raw.reason ?? null,
    status,
    kind: raw.kind ?? null,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
}

export async function getWatchlist(): Promise<SourceResult<WatchlistItem[]>> {
  // NOTE: the preprocess widens the schema's input type; the cast is
  // type-level only (fetchSource assumes input and output types match).
  const result = await fetchSource(
    "/internal/admin/ceo/watchlist",
    rawWatchlistSchema as unknown as z.ZodType<
      z.infer<typeof rawWatchlistItemSchema>[]
    >,
  );
  return {
    ...result,
    data: result.data !== null ? result.data.map(toWatchlistItem) : null,
  };
}

const rawCommissionConfigSchema = z
  .object({
    rate: z.number().nullish(),
    ratePercent: z.number().nullish(),
    minEarnedCents: z.number().nullish(),
    reason: z.string().nullish(),
    updatedAt: z.string().nullish(),
    updatedBy: z.string().nullish(),
    effectiveFrom: z.string().nullish(),
  })
  .passthrough();

export interface CommissionConfig {
  /** Whole percent, 0–100 (normalized from fraction or percent payloads). */
  ratePercent: number | null;
  minEarnedCents: number | null;
  reason: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  effectiveFrom: string | null;
}

function normalizeRatePercent(
  rate: number | null | undefined,
  ratePercent: number | null | undefined,
): number | null {
  if (typeof ratePercent === "number") return Math.round(ratePercent);
  if (typeof rate === "number") {
    // Convention says 0–1 fractions, but tolerate a percent slipping through.
    return Math.round(rate <= 1 ? rate * 100 : rate);
  }
  return null;
}

export async function getCommissionConfig(): Promise<
  SourceResult<CommissionConfig>
> {
  const result = await fetchSource(
    "/internal/admin/ceo/commission-config",
    rawCommissionConfigSchema,
  );
  return {
    ...result,
    data:
      result.data !== null
        ? {
            ratePercent: normalizeRatePercent(
              result.data.rate,
              result.data.ratePercent,
            ),
            minEarnedCents: result.data.minEarnedCents ?? null,
            reason: result.data.reason ?? null,
            updatedAt: result.data.updatedAt ?? null,
            updatedBy: result.data.updatedBy ?? null,
            effectiveFrom: result.data.effectiveFrom ?? null,
          }
        : null,
  };
}
