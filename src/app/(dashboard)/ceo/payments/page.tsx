import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/widgets/page-header";
import { WindowFilter } from "@/components/widgets/window-filter";
import { LastSynced } from "@/components/widgets/last-synced";
import { RefreshNow } from "@/components/widgets/refresh-now";
import { AffiliateFilter } from "@/components/ceo-overview/affiliate-filter";
import { DeltaStatCard } from "@/components/ceo-dashboard/delta-stat-card";
import { ProcessorMixBar } from "@/components/ceo-dashboard/processor-mix-bar";
import { getPnlReport } from "@/lib/sources/bot/reports";
import { getPayments } from "@/lib/sources/bot/payments";
import { deltaFraction, resolveWindow } from "@/lib/period";
import { formatCents, formatPercent } from "@/lib/format";
import { single, type RawSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

/** "YYYY-MM" for the given month offset from the window's end month. */
function monthKey(toIso: string, offset: number): string {
  const base = new Date(`${toIso}T00:00:00Z`);
  const d = new Date(
    Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + offset, 1),
  );
  return d.toISOString().slice(0, 7);
}

function monthLabel(key: string): string {
  const d = new Date(`${key}-01T00:00:00Z`);
  return d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
}

function sumCents(a: number | null, b: number | null): number | null {
  if (a === null && b === null) return null;
  return (a ?? 0) + (b ?? 0);
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}): Promise<React.ReactElement> {
  const sp = await searchParams;
  const window = resolveWindow(single(sp.from), single(sp.to));
  const curMonth = monthKey(window.to, 0);
  const prevMonth = monthKey(window.to, -1);
  const deltaLabel = `vs ${monthLabel(prevMonth)}`;

  const [pnl, pnlPrev, payments] = await Promise.all([
    getPnlReport(curMonth),
    getPnlReport(prevMonth),
    getPayments(window),
  ]);

  const cur = pnl.data;
  const prev = pnlPrev.data;

  const platformFees = sumCents(
    cur?.processorFeeCents ?? null,
    cur?.financingFeeCents ?? null,
  );
  const platformFeesPrev = sumCents(
    prev?.processorFeeCents ?? null,
    prev?.financingFeeCents ?? null,
  );

  const refunds = payments.data?.refunds;
  const chargebacks = payments.data?.chargebacks;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Collected revenue, processor mix, refunds and chargebacks."
        actions={
          <>
            <WindowFilter />
            <AffiliateFilter />
            <LastSynced
              at={cur?.lastSyncedAt ?? payments.data?.lastSyncedAt ?? null}
            />
            <RefreshNow tick="all" />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DeltaStatCard
          label="Gross collected"
          value={formatCents(cur?.grossCents ?? null)}
          delta={deltaFraction(cur?.grossCents ?? null, prev?.grossCents ?? null)}
          deltaLabel={deltaLabel}
        />
        <DeltaStatCard
          label="Platform fees"
          value={formatCents(platformFees)}
          delta={deltaFraction(platformFees, platformFeesPrev)}
          deltaLabel={deltaLabel}
          hint="processor + financing"
        />
        <DeltaStatCard
          label="Refunds issued"
          value={formatCents(cur?.refundsCents ?? null)}
          delta={deltaFraction(
            cur?.refundsCents ?? null,
            prev?.refundsCents ?? null,
          )}
          deltaLabel={deltaLabel}
          hint={
            refunds?.pendingRequests != null
              ? `${String(refunds.pendingRequests)} pending requests`
              : undefined
          }
        />
        <DeltaStatCard
          label="Pending / payment plans"
          value={formatCents(payments.data?.pendingPaymentPlansCents ?? null)}
          hint="expected within 30d"
        />
      </div>

      <ProcessorMixBar rows={payments.data?.processorMix ?? []} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-line bg-glass p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-fg-muted">
            Refunds
          </p>
          <dl className="divide-y divide-line">
            {[
              { label: "Count", value: refunds?.count ?? null, fmt: "count" },
              {
                label: "Value",
                value: refunds?.valueCents ?? null,
                fmt: "cents",
              },
              { label: "Rate", value: refunds?.rate ?? null, fmt: "percent" },
              {
                label: "Pending requests",
                value: refunds?.pendingRequests ?? null,
                fmt: "count",
              },
            ].map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between py-2"
              >
                <dt className="text-sm text-fg-secondary">{r.label}</dt>
                <dd className="text-sm font-medium tabular-nums text-fg-primary">
                  {r.value === null
                    ? "—"
                    : r.fmt === "cents"
                      ? formatCents(r.value)
                      : r.fmt === "percent"
                        ? formatPercent(r.value)
                        : r.value.toLocaleString("en-US")}
                </dd>
              </div>
            ))}
            <div className="flex items-center justify-between py-2">
              <dt className="text-sm text-fg-secondary">Top reason</dt>
              <dd className="text-sm font-medium text-fg-primary">
                {refunds?.topReason ?? "—"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="border-line bg-glass p-5">
          <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-fg-muted">
            <Info className="h-3.5 w-3.5" /> Chargebacks
          </p>
          <dl className="divide-y divide-line">
            {[
              { label: "Count", value: chargebacks?.count ?? null, fmt: "count" },
              {
                label: "Value",
                value: chargebacks?.valueCents ?? null,
                fmt: "cents",
              },
              { label: "Rate", value: chargebacks?.rate ?? null, fmt: "percent" },
              {
                label: "Disputes in progress",
                value: chargebacks?.disputesInProgress ?? null,
                fmt: "count",
              },
              {
                label: "Win rate (90d)",
                value: chargebacks?.winRate90d ?? null,
                fmt: "percent",
              },
            ].map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between py-2"
              >
                <dt className="text-sm text-fg-secondary">{r.label}</dt>
                <dd className="text-sm font-medium tabular-nums text-fg-primary">
                  {r.value === null
                    ? "—"
                    : r.fmt === "cents"
                      ? formatCents(r.value)
                      : r.fmt === "percent"
                        ? formatPercent(r.value)
                        : r.value.toLocaleString("en-US")}
                </dd>
              </div>
            ))}
          </dl>
          {chargebacks?.rate != null && chargebacks.thresholdRate != null && (
            <div className="mt-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-fill-hover">
                <div
                  className="h-full rounded-full bg-warning"
                  style={{
                    width: `${String(
                      Math.max(
                        0,
                        Math.min(
                          100,
                          (chargebacks.rate / chargebacks.thresholdRate) * 100,
                        ),
                      ),
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-fg-subtle">
                {formatPercent(chargebacks.rate)} of{" "}
                {formatPercent(chargebacks.thresholdRate)} threshold
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
