import "server-only";
import { z } from "zod";
import type { SourceResult } from "../contract";
import { fetchSource } from "./client";

// Domain adapter for the /ceo overview page (US-027) over the bot's
// GET /internal/admin/ceo/kpis. The bot nests each group's values under
// `metrics` and reports lastSyncedAt per source; flattenGroup normalizes both
// to the flat shape the page consumes. The schema stays tolerant on top of
// that: every metric may arrive as a bare number, null, an override envelope
// ({ value, overridden, reason, author }), or be absent entirely — all of
// which normalize to MetricValue so the page renders "—" instead of failing.

export type AffiliateFilter = "yes" | "no" | "both";

export interface MetricValue {
  value: number | null;
  overridden: boolean;
  reason: string | null;
  author: string | null;
}

const NULL_METRIC: MetricValue = {
  value: null,
  overridden: false,
  reason: null,
  author: null,
};

const metricSchema = z
  .union([
    z.number(),
    z.object({
      value: z.number().nullable(),
      overridden: z.boolean().optional(),
      reason: z.string().nullable().optional(),
      author: z.string().nullable().optional(),
    }),
  ])
  .nullish()
  .transform((raw): MetricValue => {
    if (raw === null || raw === undefined) return NULL_METRIC;
    if (typeof raw === "number") {
      return { value: raw, overridden: false, reason: null, author: null };
    }
    return {
      value: raw.value,
      overridden: raw.overridden ?? false,
      reason: raw.reason ?? null,
      author: raw.author ?? null,
    };
  });

const isoOrNullSchema = z
  .string()
  .nullish()
  .transform((v): string | null => v ?? null);

const overviewGroupSchema = z
  .object({
    lastSyncedAt: isoOrNullSchema,
    adSpendCents: metricSchema,
    cashCollectedCents: metricSchema,
    feCpaCents: metricSchema,
    feAovCents: metricSchema,
    bumpRate: metricSchema,
    otoRate: metricSchema,
    grossCents: metricSchema,
    roas: metricSchema,
    feConversionRate: metricSchema,
  })
  .passthrough();

const feEngineGroupSchema = z
  .object({
    lastSyncedAt: isoOrNullSchema,
    feSalesCount: metricSchema,
    feAovCents: metricSchema,
    feSalesRevenueCents: metricSchema,
    feCpaCents: metricSchema,
    feRoas: metricSchema,
  })
  .passthrough();

const beEngineGroupSchema = z
  .object({
    lastSyncedAt: isoOrNullSchema,
    callsBooked: metricSchema,
    beRevenueCents: metricSchema,
    beNewCustomers: metricSchema,
    ascensionRate: metricSchema,
    htoAovCents: metricSchema,
    newMtoCustomers: metricSchema,
    newHtoCustomers: metricSchema,
    newPtoCustomers: metricSchema,
  })
  .passthrough();

const pipelineGroupSchema = z
  .object({
    lastSyncedAt: isoOrNullSchema,
    leads: metricSchema,
    cplCents: metricSchema,
    costPerCallBookedCents: metricSchema,
    cashPerLeadCents: metricSchema,
    profitCents: metricSchema,
  })
  .passthrough();

// Oldest non-null sync among the group's sources — the group badge warns on
// the laggard, matching the page-level oldestSync.
function collapseLastSynced(raw: unknown): string | null {
  if (typeof raw === "string") return raw;
  if (raw === null || raw === undefined || typeof raw !== "object") {
    return null;
  }
  let oldest: string | null = null;
  for (const value of Object.values(raw)) {
    if (typeof value !== "string") continue;
    if (oldest === null || new Date(value) < new Date(oldest)) oldest = value;
  }
  return oldest;
}

// Normalizes a bot KpiGroup ({ lastSyncedAt: Record<source, iso|null>,
// metrics: {...} }) — or an already-flat group — to the flat shape the page
// reads. Also folds the bot's conversionRateFe spelling into feConversionRate.
function flattenGroup(raw: unknown): Record<string, unknown> {
  if (raw === null || raw === undefined || typeof raw !== "object") {
    return { lastSyncedAt: null };
  }
  const group = raw as Record<string, unknown>;
  const metrics =
    typeof group.metrics === "object" && group.metrics !== null
      ? (group.metrics as Record<string, unknown>)
      : group;
  const flat: Record<string, unknown> = {
    ...metrics,
    lastSyncedAt: collapseLastSynced(group.lastSyncedAt),
  };
  if (flat.feConversionRate === undefined && "conversionRateFe" in flat) {
    flat.feConversionRate = flat.conversionRateFe;
  }
  return flat;
}

// A missing or null group still parses (every metric inside normalizes to
// the null MetricValue) so a partially-built bot payload never breaks the page.
function tolerantGroup<T extends z.ZodTypeAny>(
  schema: T,
): z.ZodEffects<T, z.output<T>, unknown> {
  return z.preprocess(flattenGroup, schema);
}

export const ceoKpisSchema = z.object({
  window: z
    .object({ from: z.string(), to: z.string() })
    .nullish()
    .transform((v): { from: string; to: string } | null => v ?? null),
  overview: tolerantGroup(overviewGroupSchema),
  feEngine: tolerantGroup(feEngineGroupSchema),
  beEngine: tolerantGroup(beEngineGroupSchema),
  pipeline: tolerantGroup(pipelineGroupSchema),
});

export type CeoKpis = z.infer<typeof ceoKpisSchema>;
export type OverviewGroup = CeoKpis["overview"];
export type FeEngineGroup = CeoKpis["feEngine"];
export type BeEngineGroup = CeoKpis["beEngine"];
export type PipelineGroup = CeoKpis["pipeline"];

export interface KpiFilters {
  from?: string;
  to?: string;
  affiliate?: AffiliateFilter;
}

// NOTE: fetchSource's `z.ZodType<T>` assumes the schema's input and output
// types match; the tolerant transforms above intentionally widen the input,
// so this cast is type-level only — runtime parsing is unchanged.
const kpisContract = ceoKpisSchema as unknown as z.ZodType<CeoKpis>;

export function getCeoKpis(
  filters: KpiFilters = {},
): Promise<SourceResult<CeoKpis>> {
  return fetchSource("/internal/admin/ceo/kpis", kpisContract, {
    from: filters.from,
    to: filters.to,
    affiliate: filters.affiliate,
  });
}
