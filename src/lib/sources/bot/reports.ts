import "server-only";
import { z } from "zod";
import type { SourceResult } from "../contract";
import { fetchSource } from "./client";

// Tolerant contracts for the bot's US-021 report endpoints. The bot wire
// format is richer than the display shape — EOW carries the full KPI payload
// plus absolute deltas, P&L nests the money lines under `lines`, and the
// audit pack splits sections by table — so each response is normalized into
// the arrays/flat fields the report views render before the tolerant schema
// parses it. Every field stays optional/nullable so partial payloads still
// render, and passthrough keeps unknown extra fields from failing validation.

const centsField = z.number().nullable().optional();
const isoField = z.string().nullable().optional();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Bot lastSyncedAt is a per-source record — collapse to the oldest non-null
 *  sync so the badge warns on the laggard. */
function collapseLastSynced(raw: unknown): string | null {
  if (typeof raw === "string") return raw;
  if (!isRecord(raw)) return null;
  let oldest: string | null = null;
  for (const value of Object.values(raw)) {
    if (typeof value !== "string") continue;
    if (oldest === null || new Date(value) < new Date(oldest)) oldest = value;
  }
  return oldest;
}

/** Bot metrics are number | null | { value, ... } override envelopes. */
function metricNumber(raw: unknown): number | null {
  if (typeof raw === "number") return raw;
  if (isRecord(raw) && typeof raw.value === "number") return raw.value;
  return null;
}

const eowKpiSchema = z
  .object({
    key: z.string().optional(),
    label: z.string().nullable().optional(),
    value: z.number().nullable().optional(),
    /** "cents" | "fraction" | "count" — anything else renders as a plain number. */
    unit: z.string().nullable().optional(),
    /** Fraction vs prior week, e.g. 0.12 = +12%. */
    deltaVsPriorWeek: z.number().nullable().optional(),
  })
  .passthrough();

const cohortMovementRowSchema = z
  .object({
    cohort: z.string().nullable().optional(),
    fromTier: z.string().nullable().optional(),
    toTier: z.string().nullable().optional(),
    customers: z.number().nullable().optional(),
  })
  .passthrough();

const watchlistItemSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    title: z.string().nullable().optional(),
    label: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    openedAt: isoField,
    resolvedAt: isoField,
  })
  .passthrough();

export const eowReportSchema = z
  .object({
    week: z.string().optional(),
    window: z
      .object({
        from: z.string().nullable().optional(),
        to: z.string().nullable().optional(),
      })
      .optional(),
    kpis: z.array(eowKpiSchema).optional(),
    cohortMovement: z.array(cohortMovementRowSchema).optional(),
    watchlist: z.array(watchlistItemSchema).optional(),
    lastSyncedAt: isoField,
  })
  .passthrough();

export type EowReport = z.infer<typeof eowReportSchema>;
export type EowKpi = z.infer<typeof eowKpiSchema>;
export type CohortMovementRow = z.infer<typeof cohortMovementRowSchema>;
export type ReportWatchlistItem = z.infer<typeof watchlistItemSchema>;

// Headline metrics lifted out of the bot's full KPI payload, in render order.
const EOW_KPI_CATALOG: {
  group: string;
  key: string;
  label: string;
  unit: string;
}[] = [
  {
    group: "overview",
    key: "cashCollectedCents",
    label: "Cash collected",
    unit: "cents",
  },
  { group: "overview", key: "grossCents", label: "Gross", unit: "cents" },
  { group: "overview", key: "adSpendCents", label: "Ad spend", unit: "cents" },
  { group: "overview", key: "roas", label: "ROAS", unit: "ratio" },
  { group: "feEngine", key: "feSalesCount", label: "FE sales", unit: "count" },
  { group: "feEngine", key: "feAovCents", label: "FE AOV", unit: "cents" },
  { group: "feEngine", key: "feCpaCents", label: "FE CPA", unit: "cents" },
  {
    group: "feEngine",
    key: "feSalesRevenueCents",
    label: "FE revenue",
    unit: "cents",
  },
  {
    group: "beEngine",
    key: "callsBooked",
    label: "Calls booked",
    unit: "count",
  },
  {
    group: "beEngine",
    key: "beRevenueCents",
    label: "BE revenue",
    unit: "cents",
  },
  {
    group: "beEngine",
    key: "ascensionRate",
    label: "Ascension rate",
    unit: "fraction",
  },
  { group: "pipeline", key: "leads", label: "Leads", unit: "count" },
  { group: "pipeline", key: "cplCents", label: "CPL", unit: "cents" },
  { group: "pipeline", key: "profitCents", label: "Profit", unit: "cents" },
];

// The bot reports absolute deltas (current − prior); the view renders a
// fraction vs prior week, so divide by the reconstructed prior value.
function deltaFraction(value: number | null, delta: unknown): number | null {
  if (value === null || typeof delta !== "number") return null;
  const prior = value - delta;
  return prior > 0 ? delta / prior : null;
}

function flattenEowKpis(
  kpis: Record<string, unknown>,
  deltas: unknown,
): unknown[] {
  const deltaGroups = isRecord(deltas) ? deltas : {};
  return EOW_KPI_CATALOG.map(({ group, key, label, unit }) => {
    const groupPayload = kpis[group];
    const metrics =
      isRecord(groupPayload) && isRecord(groupPayload.metrics)
        ? groupPayload.metrics
        : {};
    const value = metricNumber(metrics[key]);
    const groupDeltas = deltaGroups[group];
    const delta = isRecord(groupDeltas) ? groupDeltas[key] : null;
    return {
      key: `${group}.${key}`,
      label,
      value,
      unit,
      deltaVsPriorWeek: deltaFraction(value, delta),
    };
  });
}

// Weekly cohort rows → movement rows: ascension (US-017) is an LTO buyer
// moving into the back-end, so customers = size × ascensionRate.
function toMovementRow(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  const size = typeof raw.size === "number" ? raw.size : null;
  const rate = typeof raw.ascensionRate === "number" ? raw.ascensionRate : null;
  return {
    cohort: typeof raw.cohortStart === "string" ? raw.cohortStart : null,
    fromTier: "LTO",
    toTier: "BE",
    customers: size !== null && rate !== null ? Math.round(size * rate) : null,
  };
}

// The bot's EOW watchlist is a summary ({ openTotal, openByKind,
// resolvedInWindow }); synthesize one row per open kind plus a resolved line.
function summaryToWatchlistRows(summary: Record<string, unknown>): unknown[] {
  const rows: unknown[] = [];
  if (isRecord(summary.openByKind)) {
    for (const [kind, count] of Object.entries(summary.openByKind)) {
      rows.push({
        id: kind,
        title: `${kind} — ${String(count)} open`,
        status: "open",
      });
    }
  }
  const resolved = summary.resolvedInWindow;
  if (typeof resolved === "number" && resolved > 0) {
    rows.push({
      id: "resolved-in-window",
      title: `${String(resolved)} resolved this week`,
      status: "resolved",
    });
  }
  return rows;
}

function normalizeEowReport(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  const out: Record<string, unknown> = { ...raw };
  if (isRecord(raw.kpis)) {
    out.kpis = flattenEowKpis(raw.kpis, raw.deltas);
  }
  if (out.cohortMovement === undefined && Array.isArray(raw.cohorts)) {
    out.cohortMovement = raw.cohorts.map(toMovementRow);
  }
  if (isRecord(raw.watchlist)) {
    out.watchlist = summaryToWatchlistRows(raw.watchlist);
  }
  if (typeof out.lastSyncedAt !== "string") {
    out.lastSyncedAt = collapseLastSynced(out.lastSyncedAt);
  }
  return out;
}

// NOTE: the preprocess widens the schema's input type; the cast is type-level
// only (fetchSource assumes input and output types match).
const eowReportContract = z.preprocess(
  normalizeEowReport,
  eowReportSchema,
) as unknown as z.ZodType<EowReport>;

export const pnlReportSchema = z
  .object({
    month: z.string().optional(),
    grossCents: centsField,
    processorFeeCents: centsField,
    financingFeeCents: centsField,
    refundsCents: centsField,
    chargebacksCents: centsField,
    netCents: centsField,
    adSpendCents: centsField,
    commissionAccrualCents: centsField,
    profitCents: centsField,
    lastSyncedAt: isoField,
  })
  .passthrough();

export type PnlReport = z.infer<typeof pnlReportSchema>;

// The bot nests the money lines under `lines` (with refundCents /
// chargebackCents singulars) and sends a per-source lastSyncedAt record.
function normalizePnlReport(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  const lines = isRecord(raw.lines) ? raw.lines : {};
  return {
    ...raw,
    ...lines,
    refundsCents:
      lines.refundCents !== undefined ? lines.refundCents : raw.refundsCents,
    chargebacksCents:
      lines.chargebackCents !== undefined
        ? lines.chargebackCents
        : raw.chargebacksCents,
    lastSyncedAt: collapseLastSynced(raw.lastSyncedAt),
  };
}

const pnlReportContract = z.preprocess(
  normalizePnlReport,
  pnlReportSchema,
) as unknown as z.ZodType<PnlReport>;

const overrideEntrySchema = z
  .object({
    target: z.string().nullable().optional(),
    value: z.union([z.string(), z.number()]).nullable().optional(),
    reason: z.string().nullable().optional(),
    author: z.string().nullable().optional(),
    createdAt: isoField,
  })
  .passthrough();

const unmatchedEntrySchema = z
  .object({
    /** "product" | "customer" */
    kind: z.string().nullable().optional(),
    reference: z.string().nullable().optional(),
    source: z.string().nullable().optional(),
    occurredAt: isoField,
  })
  .passthrough();

const reconciliationDeltaSchema = z
  .object({
    source: z.string().nullable().optional(),
    expectedCents: centsField,
    actualCents: centsField,
    deltaCents: centsField,
  })
  .passthrough();

export const auditPackSchema = z
  .object({
    month: z.string().optional(),
    overrides: z.array(overrideEntrySchema).optional(),
    watchlist: z.array(watchlistItemSchema).optional(),
    unmatched: z.array(unmatchedEntrySchema).optional(),
    reconciliation: z.array(reconciliationDeltaSchema).optional(),
    lastSyncedAt: isoField,
  })
  .passthrough();

export type AuditPack = z.infer<typeof auditPackSchema>;
export type OverrideEntry = z.infer<typeof overrideEntrySchema>;
export type UnmatchedEntry = z.infer<typeof unmatchedEntrySchema>;
export type ReconciliationDelta = z.infer<typeof reconciliationDeltaSchema>;

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

// Bot override rows carry createdBy plus a split target
// (targetTable/targetId/targetField or metric+period).
function normalizeOverrideEntry(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  const tableTarget = [raw.targetTable, raw.targetId, raw.targetField]
    .map(asString)
    .filter((part): part is string => part !== null)
    .join(":");
  const metricTarget =
    asString(raw.metric) !== null
      ? [raw.metric, raw.period]
          .map(asString)
          .filter((part): part is string => part !== null)
          .join(" @ ")
      : null;
  const value = raw.value;
  return {
    ...raw,
    target:
      raw.target ?? metricTarget ?? (tableTarget !== "" ? tableTarget : null),
    author: raw.author ?? raw.createdBy,
    value:
      typeof value === "string" || typeof value === "number" || value === null
        ? value
        : JSON.stringify(value),
  };
}

function normalizePackWatchlistItem(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  return {
    ...raw,
    title: raw.title ?? raw.label ?? raw.kind,
    label: raw.label ?? raw.targetRef,
    openedAt: raw.openedAt ?? raw.createdAt,
  };
}

function toUnmatchedEntry(kind: "product" | "customer", raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  return {
    ...raw,
    kind,
    reference:
      raw.reference ??
      raw.target ??
      raw.email ??
      raw.sourceCustomerId ??
      raw.id,
    occurredAt: raw.occurredAt ?? raw.createdAt,
  };
}

// Bot reconciliation deltas are adjustment-level (type/amount/source of the
// original txn) — surface them as per-source delta lines; expected/actual
// totals are not part of the bot payload and render as "—".
function toReconciliationRow(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  return {
    ...raw,
    source: raw.source ?? raw.txnSource,
    deltaCents: raw.deltaCents ?? raw.amountCents,
  };
}

function normalizeAuditPack(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  const out: Record<string, unknown> = { ...raw };
  if (Array.isArray(raw.overrides)) {
    out.overrides = raw.overrides.map(normalizeOverrideEntry);
  }
  if (out.watchlist === undefined && Array.isArray(raw.watchlistItems)) {
    out.watchlist = raw.watchlistItems.map(normalizePackWatchlistItem);
  }
  if (out.unmatched === undefined) {
    const products = Array.isArray(raw.unmatchedProducts)
      ? raw.unmatchedProducts
      : [];
    const customers = Array.isArray(raw.unmatchedCustomers)
      ? raw.unmatchedCustomers
      : [];
    if (products.length > 0 || customers.length > 0) {
      out.unmatched = [
        ...products.map((entry) => toUnmatchedEntry("product", entry)),
        ...customers.map((entry) => toUnmatchedEntry("customer", entry)),
      ];
    }
  }
  if (
    out.reconciliation === undefined &&
    Array.isArray(raw.reconciliationDeltas)
  ) {
    out.reconciliation = raw.reconciliationDeltas.map(toReconciliationRow);
  }
  if (typeof out.lastSyncedAt !== "string") {
    out.lastSyncedAt = collapseLastSynced(out.lastSyncedAt);
  }
  return out;
}

const auditPackContract = z.preprocess(
  normalizeAuditPack,
  auditPackSchema,
) as unknown as z.ZodType<AuditPack>;

/** Weekly summary: KPIs + deltas vs prior week, cohort movement, watchlist. */
export function getEowReport(week?: string): Promise<SourceResult<EowReport>> {
  return fetchSource("/internal/admin/ceo/reports/eow", eowReportContract, {
    week,
  });
}

/** Monthly P&L: gross → fees → refunds/chargebacks → net → spend → profit. */
export function getPnlReport(month?: string): Promise<SourceResult<PnlReport>> {
  return fetchSource("/internal/admin/ceo/reports/pnl", pnlReportContract, {
    month,
  });
}

/** Forensic month pack: overrides, watchlist, unmatched, reconciliation. */
export function getAuditPack(month?: string): Promise<SourceResult<AuditPack>> {
  return fetchSource(
    "/internal/admin/ceo/reports/audit-pack",
    auditPackContract,
    { month },
  );
}
