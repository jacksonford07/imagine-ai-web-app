import "server-only";
import { z } from "zod";
import type { SourceResult } from "../contract";
import { fetchSource } from "./client";

// US-029 domain adapter for GET /internal/admin/ceo/transactions. The bot
// endpoint lands concurrently (Phase 3), so the schemas stay tolerant:
// every value is nullable/optional and unknown extra keys pass through.

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
    transactionPageSchema,
    {
      ...filters,
    },
  );
}
