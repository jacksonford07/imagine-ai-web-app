import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/widgets/page-header";
import { WindowFilter } from "@/components/widgets/window-filter";
import { LastSynced } from "@/components/widgets/last-synced";
import { RefreshNow } from "@/components/widgets/refresh-now";
import { AffiliateFilter } from "@/components/ceo-overview/affiliate-filter";
import {
  DeltaStatCard,
  type PaceBar,
} from "@/components/ceo-dashboard/delta-stat-card";
import {
  MetricTable,
  type MetricRow,
} from "@/components/ceo-dashboard/metric-table";
import { AttentionBanner } from "@/components/ceo-dashboard/attention-banner";
import { DailyBarsChart } from "@/components/ceo-dashboard/daily-bars-chart";
import {
  getCeoKpis,
  type AffiliateFilter as AffiliateValue,
  type MetricValue,
} from "@/lib/sources/bot/kpis";
import { getCeoOverviewDaily } from "@/lib/sources/bot/overview";
import { getReviewQueueCount } from "@/lib/sources/bot/review-queue";
import {
  deltaFraction,
  monthElapsedFraction,
  projectEndOfMonth,
  resolveWindow,
  withPrior,
} from "@/lib/period";
import { formatCents, formatCompactCents } from "@/lib/format";
import { formatMetric, type MetricKind } from "@/components/ceo-overview/metric-format";
import { single, type RawSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

function asAffiliate(
  value: string | string[] | undefined,
): AffiliateValue | undefined {
  const v = single(value);
  return v === "yes" || v === "no" || v === "both" ? v : undefined;
}

function oldestSync(times: (string | null)[]): string | null {
  let oldest: string | null = null;
  for (const t of times) {
    if (t === null) continue;
    if (oldest === null || new Date(t) < new Date(oldest)) oldest = t;
  }
  return oldest;
}

/** A label → value (→ delta) row from a current/prior metric pair. */
function row(
  label: string,
  kind: MetricKind,
  cur?: MetricValue,
  prior?: MetricValue,
): MetricRow {
  return {
    label,
    value: formatMetric(kind, cur?.value ?? null),
    delta:
      cur !== undefined && prior !== undefined
        ? deltaFraction(cur.value, prior.value)
        : undefined,
  };
}

export default async function CeoOverviewPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}): Promise<React.ReactElement> {
  const sp = await searchParams;
  const fromParam = single(sp.from);
  const toParam = single(sp.to);
  const affiliate = asAffiliate(sp.affiliate);
  const isMtd = fromParam === undefined && toParam === undefined;

  const { current, prior, priorLabel } = withPrior(
    resolveWindow(fromParam, toParam),
  );

  const [cur, prev, daily, reviewQueue] = await Promise.all([
    getCeoKpis({ from: current.from, to: current.to, affiliate }),
    getCeoKpis({ from: prior.from, to: prior.to, affiliate }),
    getCeoOverviewDaily({ from: current.from, to: current.to }),
    getReviewQueueCount(),
  ]);

  const c = cur.data;
  const p = prev.data;
  const deltaLabel = `vs ${priorLabel}`;

  const overview = c?.overview;
  const fe = c?.feEngine;
  const be = c?.beEngine;
  const pOverview = p?.overview;
  const pFe = p?.feEngine;
  const pBe = p?.beEngine;

  // Cash collected pace: only project when the window is the live month to date.
  const cashValue = overview?.cashCollectedCents.value ?? null;
  const pace: PaceBar | null =
    isMtd && cashValue !== null
      ? {
          fraction: monthElapsedFraction(),
          label: `${formatCompactCents(projectEndOfMonth(cashValue))} EOM pace`,
        }
      : null;

  const marketingRows: MetricRow[] = [
    row("FE sales", "count", fe?.feSalesCount, pFe?.feSalesCount),
    row("FE revenue", "cents", fe?.feSalesRevenueCents, pFe?.feSalesRevenueCents),
    row("FE CPA (blended)", "cents", fe?.feCpaCents, pFe?.feCpaCents),
    row("FE AOV", "cents", fe?.feAovCents, pFe?.feAovCents),
    row("FE ROAS", "ratio", fe?.feRoas, pFe?.feRoas),
    row("Bump rate", "percent", overview?.bumpRate, pOverview?.bumpRate),
    row("OTO rate", "percent", overview?.otoRate, pOverview?.otoRate),
    row(
      "FE click → sale",
      "percent",
      overview?.feClickToSaleRate,
      pOverview?.feClickToSaleRate,
    ),
  ];

  const salesRows: MetricRow[] = [
    row("Calls booked", "count", be?.callsBooked, pBe?.callsBooked),
    row("Calls held", "count", be?.callsHeld, pBe?.callsHeld),
    row("Show rate", "percent", be?.showRate, pBe?.showRate),
    row("BE revenue", "cents", be?.beRevenueCents, pBe?.beRevenueCents),
    row("HTO AOV", "cents", be?.htoAovCents, pBe?.htoAovCents),
    row("Ascension rate", "percent", be?.ascensionRate, pBe?.ascensionRate),
    row("Close rate (held)", "percent", be?.closeRateHeld, pBe?.closeRateHeld),
    row("Days FE → BE", "days", be?.daysFeToBe, pBe?.daysFeToBe),
  ];

  const fulfillmentRows: MetricRow[] = [
    row("New LTO", "count", fe?.feSalesCount, pFe?.feSalesCount),
    row("New MTO", "count", be?.newMtoCustomers, pBe?.newMtoCustomers),
    row("New HTO", "count", be?.newHtoCustomers, pBe?.newHtoCustomers),
    row("New PTO", "count", be?.newPtoCustomers, pBe?.newPtoCustomers),
    row("Active customers", "count", be?.activeCustomers, pBe?.activeCustomers),
    row("BE revenue", "cents", be?.beRevenueCents, pBe?.beRevenueCents),
    row("Refund rate", "percent", overview?.refundRate, pOverview?.refundRate),
    row(
      "Chargeback rate",
      "percent",
      overview?.chargebackRate,
      pOverview?.chargebackRate,
    ),
  ];

  const dailyPoints = (daily.data?.points ?? []).map((pt) => ({
    label: pt.date.slice(5),
    cashCents: pt.cashCents ?? null,
    spendCents: pt.spendCents ?? null,
  }));

  const attention: string[] = [];
  if (reviewQueue.data !== null && reviewQueue.data.count > 0) {
    attention.push(
      `${String(reviewQueue.data.count)} customer records awaiting manual review`,
    );
  }

  const everythingDown =
    cur.error !== null && prev.error !== null && daily.error !== null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Live KPI sheet — defaults to this month to date."
        actions={
          <>
            <WindowFilter />
            <AffiliateFilter />
            <LastSynced
              at={oldestSync([
                overview?.lastSyncedAt ?? null,
                fe?.lastSyncedAt ?? null,
                be?.lastSyncedAt ?? null,
              ])}
            />
            <RefreshNow tick="all" />
          </>
        }
      />

      {everythingDown && (
        <Card className="flex items-start gap-3 border-line bg-glass p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-soft" />
          <div className="text-sm">
            <p className="font-medium text-fg-primary">Awaiting KPI data</p>
            <p className="mt-1 text-fg-muted">
              The KPI endpoints aren&apos;t serving data yet — metrics populate
              as soon as the bot pipeline lands. ({cur.error})
            </p>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <DeltaStatCard
            label="Cash collected · MTD"
            value={formatCents(cashValue)}
            delta={deltaFraction(
              cashValue,
              pOverview?.cashCollectedCents.value ?? null,
            )}
            deltaLabel={deltaLabel}
            pace={pace}
          />
        </div>
        <DeltaStatCard
          label="Blended ROAS"
          value={formatMetric("ratio", overview?.roas.value ?? null)}
          delta={deltaFraction(
            overview?.roas.value ?? null,
            pOverview?.roas.value ?? null,
          )}
          deltaLabel={deltaLabel}
        />
        <DeltaStatCard
          label="Ad spend · MTD"
          value={formatCents(overview?.adSpendCents.value ?? null)}
          delta={deltaFraction(
            overview?.adSpendCents.value ?? null,
            pOverview?.adSpendCents.value ?? null,
          )}
          deltaLabel={deltaLabel}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <DeltaStatCard
            label="Profit estimate"
            value={formatCents(c?.pipeline.profitCents.value ?? null)}
            delta={deltaFraction(
              c?.pipeline.profitCents.value ?? null,
              p?.pipeline.profitCents.value ?? null,
            )}
            deltaLabel={deltaLabel}
          />
        </div>
        <DeltaStatCard
          label="Gross"
          value={formatCents(overview?.grossCents.value ?? null)}
          delta={deltaFraction(
            overview?.grossCents.value ?? null,
            pOverview?.grossCents.value ?? null,
          )}
          deltaLabel={deltaLabel}
        />
        <DeltaStatCard
          label="FE conversion"
          value={formatMetric("percent", overview?.feConversionRate.value ?? null)}
          delta={deltaFraction(
            overview?.feConversionRate.value ?? null,
            pOverview?.feConversionRate.value ?? null,
          )}
          deltaLabel={deltaLabel}
        />
      </div>

      <AttentionBanner items={attention} />

      <div className="grid gap-4 lg:grid-cols-3">
        <MetricTable
          title="Marketing"
          rows={marketingRows}
          href="/ceo/marketing"
        />
        <MetricTable title="Sales" rows={salesRows} href="/ceo/ascensions" />
        <MetricTable
          title="Fulfillment"
          rows={fulfillmentRows}
          href="/ceo/payments"
        />
      </div>

      <DailyBarsChart
        title="Daily cash & spend"
        data={dailyPoints}
        series={[
          { key: "cashCents", label: "Cash", chart: 1 },
          { key: "spendCents", label: "Spend", chart: 3 },
        ]}
      />
    </div>
  );
}
