import "server-only";
import { z } from "zod";
import type { SourceResult } from "../contract";
import { fetchSource, type DateWindow } from "./client";

// Payments-page detail over GET /internal/admin/ceo/payments: processor mix,
// refund detail, chargeback detail, and pending payment-plan value. (Gross,
// fees, refund and chargeback totals also come from the monthly /ceo/reports/pnl
// adapter, which the page uses for its headline cards.) Tolerant throughout so
// each section renders "—"/empty until the bot serves it.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const isoOrNull = z
  .string()
  .nullish()
  .transform((v): string | null => v ?? null);

const processorRowSchema = z
  .object({
    label: z.string(),
    valueCents: z.number().nullish(),
    count: z.number().nullish(),
    share: z.number().nullish(),
  })
  .passthrough();

export type ProcessorRow = z.infer<typeof processorRowSchema>;

const refundDetailSchema = z
  .object({
    count: z.number().nullish(),
    valueCents: z.number().nullish(),
    rate: z.number().nullish(),
    pendingRequests: z.number().nullish(),
    topReason: z.string().nullish(),
  })
  .passthrough();

export type RefundDetail = z.infer<typeof refundDetailSchema>;

const chargebackDetailSchema = z
  .object({
    count: z.number().nullish(),
    valueCents: z.number().nullish(),
    rate: z.number().nullish(),
    disputesInProgress: z.number().nullish(),
    winRate90d: z.number().nullish(),
    thresholdRate: z.number().nullish(),
  })
  .passthrough();

export type ChargebackDetail = z.infer<typeof chargebackDetailSchema>;

const paymentsSchema = z
  .object({
    lastSyncedAt: isoOrNull,
    processorMix: z.array(processorRowSchema),
    refunds: refundDetailSchema.nullable(),
    chargebacks: chargebackDetailSchema.nullable(),
    pendingPaymentPlansCents: z.number().nullish(),
  })
  .passthrough();

export type Payments = z.infer<typeof paymentsSchema>;

function normalize(raw: unknown): unknown {
  if (!isRecord(raw)) {
    return {
      processorMix: [],
      refunds: null,
      chargebacks: null,
      lastSyncedAt: null,
    };
  }
  return {
    ...raw,
    processorMix: Array.isArray(raw.processorMix)
      ? raw.processorMix
      : Array.isArray(raw.processors)
        ? raw.processors
        : [],
    refunds: isRecord(raw.refunds) ? raw.refunds : null,
    chargebacks: isRecord(raw.chargebacks) ? raw.chargebacks : null,
  };
}

// NOTE: the preprocess widens the schema's input type; the cast is type-level
// only (fetchSource assumes input and output types match).
const paymentsContract = z.preprocess(
  normalize,
  paymentsSchema,
) as unknown as z.ZodType<Payments>;

export function getPayments(
  window: DateWindow = {},
): Promise<SourceResult<Payments>> {
  return fetchSource("/internal/admin/ceo/payments", paymentsContract, {
    ...window,
  });
}
