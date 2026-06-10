// Net-revenue logic, hard-coded per audit precedent. These are the exact
// adjustments the manual forensic audits have been catching:
//
//   net = gross − processor fees (Whop/Fanbasis) − financing fees at source
//                                                  (ClarityPay/Splitit)
//
// Financing fees are surfaced as their own line, never buried inside the
// processor-fee figure. All amounts are integer cents to avoid float drift.

export interface TransactionAmounts {
  /** Gross sale amount in cents. */
  grossCents: number;
  /** Processor fees withheld by Whop/Fanbasis, in cents. */
  processorFeeCents: number;
  /** Financing fees deducted at source by ClarityPay/Splitit, in cents. */
  financingFeeCents: number;
}

export function netRevenueCents(t: TransactionAmounts): number {
  return t.grossCents - t.processorFeeCents - t.financingFeeCents;
}

export interface RevenueBreakdown extends TransactionAmounts {
  netCents: number;
}

export function buildBreakdown(t: TransactionAmounts): RevenueBreakdown {
  return { ...t, netCents: netRevenueCents(t) };
}

/** Total fee load as a fraction of gross (0–1). Returns null when gross is 0. */
export function feeRate(t: TransactionAmounts): number | null {
  if (t.grossCents <= 0) return null;
  return (t.processorFeeCents + t.financingFeeCents) / t.grossCents;
}
