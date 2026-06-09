import "server-only";
import { z } from "zod";
import type { SourceResult } from "../contract";
import { fetchSource } from "./client";

// Tolerant contracts for the bot's US-021 report endpoints, which are built
// concurrently: every field is optional/nullable so partial payloads still
// render, and passthrough keeps unknown extra fields from failing validation.

const centsField = z.number().nullable().optional();
const isoField = z.string().nullable().optional();

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

/** Weekly summary: KPIs + deltas vs prior week, cohort movement, watchlist. */
export function getEowReport(week?: string): Promise<SourceResult<EowReport>> {
  return fetchSource("/internal/admin/ceo/reports/eow", eowReportSchema, {
    week,
  });
}

/** Monthly P&L: gross → fees → refunds/chargebacks → net → spend → profit. */
export function getPnlReport(month?: string): Promise<SourceResult<PnlReport>> {
  return fetchSource("/internal/admin/ceo/reports/pnl", pnlReportSchema, {
    month,
  });
}

/** Forensic month pack: overrides, watchlist, unmatched, reconciliation. */
export function getAuditPack(month?: string): Promise<SourceResult<AuditPack>> {
  return fetchSource(
    "/internal/admin/ceo/reports/audit-pack",
    auditPackSchema,
    { month },
  );
}
