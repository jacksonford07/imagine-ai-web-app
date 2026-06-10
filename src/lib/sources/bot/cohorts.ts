import "server-only";
import { z } from "zod";
import type { SourceResult } from "../contract";
import { fetchSource, type DateWindow } from "./client";

// Cohorts & ascension domain adapter (US-028). The bot wire format differs
// from the display shape — it sends { cohorts: [...] } with cohortStart /
// medianDaysToNextTier / paybackWeeks / matrix[{ weekOffset }] — so the
// response is normalized before the tolerant schema parses it. Every metric
// stays nullish and rows passthrough unknown fields, so gaps render as "—"
// instead of failing the page.

export type Granularity = "week" | "month";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeMatrixCell(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  return { ...raw, week: raw.week ?? raw.weekOffset };
}

function normalizeCohortRow(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  const paybackWeeks = raw.paybackWeeks;
  return {
    ...raw,
    key: raw.key ?? raw.cohortStart,
    startDate: raw.startDate ?? raw.cohortStart,
    medianDaysToAscension:
      raw.medianDaysToAscension ?? raw.medianDaysToNextTier,
    paybackDays:
      raw.paybackDays ??
      (typeof paybackWeeks === "number" ? paybackWeeks * 7 : null),
    matrix: Array.isArray(raw.matrix)
      ? raw.matrix.map(normalizeMatrixCell)
      : raw.matrix,
  };
}

function normalizeCohortsResponse(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  const rows = Array.isArray(raw.rows)
    ? raw.rows
    : Array.isArray(raw.cohorts)
      ? raw.cohorts
      : [];
  return { ...raw, rows: rows.map(normalizeCohortRow) };
}

const matrixCellSchema = z
  .object({
    /** Weeks since acquisition, 0-indexed. */
    week: z.number(),
    cumulativeRevenueCents: z.number().nullish(),
    /** 0–1 fraction of the cohort that has ascended by this week. */
    ascensionRate: z.number().nullish(),
  })
  .passthrough();

export type MatrixCell = z.infer<typeof matrixCellSchema>;

const cohortRowSchema = z
  .object({
    /** Cohort key, e.g. "2026-W18" (week) or "2026-05" (month). */
    key: z.string(),
    label: z.string().nullish(),
    startDate: z.string().nullish(),
    size: z.number().nullish(),
    ascensionRate: z.number().nullish(),
    closeRate: z.number().nullish(),
    medianDaysToAscension: z.number().nullish(),
    ltvCents: z.number().nullish(),
    cacCents: z.number().nullish(),
    paybackDays: z.number().nullish(),
    /** Tier key → 0–1 fraction of cohort revenue (or customers) per tier. */
    tierMix: z.record(z.string(), z.number()).nullish(),
    matrix: z.array(matrixCellSchema).nullish(),
  })
  .passthrough();

export type CohortMatrixRow = z.infer<typeof cohortRowSchema>;

const cohortsResponseSchema = z
  .object({
    window: z.object({ from: z.string(), to: z.string() }).nullish(),
    granularity: z.enum(["week", "month"]).nullish(),
    lastSyncedAt: z.string().nullish(),
    rows: z.array(cohortRowSchema),
  })
  .passthrough();

export type CohortsResponse = z.infer<typeof cohortsResponseSchema>;

// NOTE: the preprocess widens the schema's input type; the cast is type-level
// only (fetchSource assumes input and output types match).
const cohortsContract = z.preprocess(
  normalizeCohortsResponse,
  cohortsResponseSchema,
) as unknown as z.ZodType<CohortsResponse>;

const funnelSchema = z
  .object({
    feBuyers: z.number().nullish(),
    callsBooked: z.number().nullish(),
    callsAttended: z.number().nullish(),
    htoCloses: z.number().nullish(),
    ptoUpsells: z.number().nullish(),
    lastSyncedAt: z.string().nullish(),
  })
  .passthrough();

export type AscensionFunnel = z.infer<typeof funnelSchema>;

export interface CohortFilters extends DateWindow {
  granularity?: Granularity;
}

export function getCohorts(
  filters: CohortFilters = {},
): Promise<SourceResult<CohortsResponse>> {
  return fetchSource("/internal/admin/ceo/cohorts", cohortsContract, {
    ...filters,
  });
}

export function getAscensionFunnel(
  window: DateWindow = {},
): Promise<SourceResult<AscensionFunnel>> {
  return fetchSource("/internal/admin/ceo/funnel", funnelSchema, {
    ...window,
  });
}
