import "server-only";
import { z } from "zod";
import type { SourceResult } from "../contract";
import { fetchSource } from "./client";

// US-029 domain adapter for GET /internal/admin/ceo/transactions. The bot
// wraps the page as { transactions, nextCursor } and uses productName /
// isAffiliate / issuedAt / overriddenAt; the response is normalized to the
// shape the table and drawer consume before the tolerant schema parses it
// (every value nullable/optional, unknown extra keys pass through).

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeAdjustment(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  return { ...raw, createdAt: raw.createdAt ?? raw.issuedAt };
}

function normalizeOverride(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  return { ...raw, createdAt: raw.createdAt ?? raw.overriddenAt };
}

function normalizeRow(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  return {
    ...raw,
    product: raw.product ?? raw.productName,
    affiliate: raw.affiliate ?? raw.isAffiliate,
    adjustments: Array.isArray(raw.adjustments)
      ? raw.adjustments.map(normalizeAdjustment)
      : raw.adjustments,
    appliedOverrides: Array.isArray(raw.appliedOverrides)
      ? raw.appliedOverrides.map(normalizeOverride)
      : raw.appliedOverrides,
  };
}

function normalizePage(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  const rows = Array.isArray(raw.rows)
    ? raw.rows
    : Array.isArray(raw.transactions)
      ? raw.transactions
      : [];
  return { ...raw, rows: rows.map(normalizeRow) };
}

const adjustmentSchema = z
  .object({
    id: z.string().nullish(),
    type: z.string().nullish(),
    label: z.string().nullish(),
    amountCents: z.number().nullish(),
    reason: z.string().nullish(),
    createdAt: z.string().nullish(),
  })
  .passthrough();
export type TransactionAdjustment = z.infer<typeof adjustmentSchema>;

const appliedOverrideSchema = z
  .object({
    id: z.string().nullish(),
    field: z.string().nullish(),
    value: z.number().nullish(),
    reason: z.string().nullish(),
    author: z.string().nullish(),
    createdAt: z.string().nullish(),
  })
  .passthrough();
export type AppliedOverride = z.infer<typeof appliedOverrideSchema>;

const transactionRowSchema = z
  .object({
    id: z.string(),
    occurredAt: z.string().nullish(),
    entity: z.string().nullish(),
    customerName: z.string().nullish(),
    customerEmail: z.string().nullish(),
    product: z.string().nullish(),
    source: z.string().nullish(),
    tier: z.string().nullish(),
    status: z.string().nullish(),
    affiliate: z.boolean().nullish(),
    grossCents: z.number().nullish(),
    processorFeeCents: z.number().nullish(),
    financingFeeCents: z.number().nullish(),
    netCents: z.number().nullish(),
    adjustments: z.array(adjustmentSchema).nullish(),
    appliedOverrides: z.array(appliedOverrideSchema).nullish(),
    rawEventId: z.string().nullish(),
    lastSyncedAt: z.string().nullish(),
  })
  .passthrough();
export type TransactionRow = z.infer<typeof transactionRowSchema>;

const transactionPageSchema = z
  .object({
    rows: z.array(transactionRowSchema),
    nextCursor: z.string().nullish(),
  })
  .passthrough();
export type TransactionPage = z.infer<typeof transactionPageSchema>;

// NOTE: the preprocess widens the schema's input type; the cast is type-level
// only (fetchSource assumes input and output types match).
const transactionPageContract = z.preprocess(
  normalizePage,
  transactionPageSchema,
) as unknown as z.ZodType<TransactionPage>;

export interface TransactionFilters {
  source?: string;
  tier?: string;
  status?: string;
  affiliate?: string;
  from?: string;
  to?: string;
  limit?: number;
  cursor?: string;
}

export function listCeoTransactions(
  filters: TransactionFilters = {},
): Promise<SourceResult<TransactionPage>> {
  return fetchSource(
    "/internal/admin/ceo/transactions",
    transactionPageContract,
    {
      ...filters,
    },
  );
}
