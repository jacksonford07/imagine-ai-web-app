import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/widgets/page-header";
import { WindowFilter } from "@/components/widgets/window-filter";
import { LastSynced } from "@/components/widgets/last-synced";
import { RefreshNow } from "@/components/widgets/refresh-now";
import { AffiliateFilter } from "@/components/ceo-overview/affiliate-filter";
import { DeltaStatCard } from "@/components/ceo-dashboard/delta-stat-card";
import { BucketBarsChart } from "@/components/ceo-dashboard/bucket-bars-chart";
import {
  AscensionFunnelCard,
  type FunnelCounts,
} from "@/components/cohorts/ascension-funnel-card";
import {
  getCeoKpis,
  type AffiliateFilter as AffiliateValue,
} from "@/lib/sources/bot/kpis";
import { getAscensionFunnel } from "@/lib/sources/bot/cohorts";
import { getTimeToAscension } from "@/lib/sources/bot/ascensions";
import { deltaFraction, resolveWindow, withPrior } from "@/lib/period";
import { formatCents, formatPercent } from "@/lib/format";
import { formatMetric } from "@/components/ceo-overview/metric-format";
import { single, type RawSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

function asAffiliate(
  value: string | string[] | undefined,
): AffiliateValue | undefined {
  const v = single(value);
  return v === "yes" || v === "no" || v === "both" ? v : undefined;
}

// Largest consecutive drop-off in the funnel, for the insight line.
function biggestDropOff(
  counts: FunnelCounts,
): { from: string; to: string; conversion: number } | null {
  const stages: { key: keyof FunnelCounts; label: string }[] = [
    { key: "feBuyers", label: "FE" },
    { key: "callsBooked", label: "call booked" },
    { key: "callsAttended", label: "attended" },
    { key: "htoCloses", label: "HTO close" },
    { key: "ptoUpsells", label: "PTO upsell" },
  ];
  let worst: { from: string; to: string; conversion: number } | null = null;
  for (let i = 1; i < stages.length; i += 1) {
    const prev = counts[stages[i - 1].key];
    const cur = counts[stages[i].key];
    if (prev === null || cur === null || prev <= 0) continue;
    const conversion = cur / prev;
    if (worst === null || conversion < worst.conversion) {
      worst = { from: stages[i - 1].label, to: stages[i].label, conversion };
    }
  }
  return worst;
}

export default async function AscensionsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}): Promise<React.ReactElement> {
  const sp = await searchParams;
  const affiliate = asAffiliate(sp.affiliate);
  const { current, prior, priorLabel } = withPrior(
    resolveWindow(single(sp.from), single(sp.to)),
  );

  const [cur, prev, funnel, distribution] = await Promise.all([
    getCeoKpis({ from: current.from, to: current.to, affiliate }),
    getCeoKpis({ from: prior.from, to: prior.to, affiliate }),
    getAscensionFunnel({ from: current.from, to: current.to }),
    getTimeToAscension({ from: current.from, to: current.to }),
  ]);

  const be = cur.data?.beEngine;
  const pBe = prev.data?.beEngine;
  const deltaLabel = `vs ${priorLabel}`;

  const funnelCounts: FunnelCounts | null =
    funnel.data === null
      ? null
      : {
          feBuyers: funnel.data.feBuyers ?? null,
          callsBooked: funnel.data.callsBooked ?? null,
          callsAttended: funnel.data.callsAttended ?? null,
          htoCloses: funnel.data.htoCloses ?? null,
          ptoUpsells: funnel.data.ptoUpsells ?? null,
        };

  const drop = funnelCounts !== null ? biggestDropOff(funnelCounts) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ascensions"
        description="Back-end conversion — funnel, timing and BE economics."
        actions={
          <>
            <WindowFilter />
            <AffiliateFilter />
            <LastSynced at={be?.lastSyncedAt ?? funnel.data?.lastSyncedAt ?? null} />
            <RefreshNow tick="all" />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DeltaStatCard
          label="Ascension rate"
          value={formatMetric("percent", be?.ascensionRate.value ?? null)}
          delta={deltaFraction(
            be?.ascensionRate.value ?? null,
            pBe?.ascensionRate.value ?? null,
          )}
          deltaLabel={deltaLabel}
        />
        <DeltaStatCard
          label="Median days to ascend"
          value={formatMetric("days", be?.medianDaysToAscension.value ?? null)}
          delta={deltaFraction(
            be?.medianDaysToAscension.value ?? null,
            pBe?.medianDaysToAscension.value ?? null,
          )}
          deltaLabel={deltaLabel}
        />
        <DeltaStatCard
          label="BE customers · MTD"
          value={formatMetric("count", be?.beNewCustomers.value ?? null)}
          delta={deltaFraction(
            be?.beNewCustomers.value ?? null,
            pBe?.beNewCustomers.value ?? null,
          )}
          deltaLabel={deltaLabel}
        />
        <DeltaStatCard
          label="BE revenue"
          value={formatCents(be?.beRevenueCents.value ?? null)}
          delta={deltaFraction(
            be?.beRevenueCents.value ?? null,
            pBe?.beRevenueCents.value ?? null,
          )}
          deltaLabel={deltaLabel}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        <DeltaStatCard
          label="Mean days to ascend"
          value={formatMetric("days", be?.meanDaysToAscension.value ?? null)}
          delta={deltaFraction(
            be?.meanDaysToAscension.value ?? null,
            pBe?.meanDaysToAscension.value ?? null,
          )}
          deltaLabel={deltaLabel}
        />
        <DeltaStatCard
          label="Days FE → BE"
          value={formatMetric("days", be?.daysFeToBe.value ?? null)}
          delta={deltaFraction(
            be?.daysFeToBe.value ?? null,
            pBe?.daysFeToBe.value ?? null,
          )}
          deltaLabel={deltaLabel}
        />
        <DeltaStatCard
          label="Time to first call"
          value={formatMetric("days", be?.timeToFirstCallDays.value ?? null)}
          delta={deltaFraction(
            be?.timeToFirstCallDays.value ?? null,
            pBe?.timeToFirstCallDays.value ?? null,
          )}
          deltaLabel={deltaLabel}
        />
        <DeltaStatCard
          label="LTV"
          value={formatCents(be?.ltvCents.value ?? null)}
          delta={deltaFraction(
            be?.ltvCents.value ?? null,
            pBe?.ltvCents.value ?? null,
          )}
          deltaLabel={deltaLabel}
        />
        <DeltaStatCard
          label="Payback"
          value={formatMetric("days", be?.paybackDays.value ?? null)}
          delta={deltaFraction(
            be?.paybackDays.value ?? null,
            pBe?.paybackDays.value ?? null,
          )}
          deltaLabel={deltaLabel}
        />
      </div>

      <AscensionFunnelCard counts={funnelCounts} />

      {drop !== null && (
        <Card className="border-line bg-glass p-4">
          <p className="text-sm text-fg-muted">
            <span className="font-medium text-fg-primary">Insight.</span>{" "}
            Biggest drop-off is {drop.from} → {drop.to} (
            {formatPercent(drop.conversion)} conversion). Focus coaching and
            follow-up here to lift overall ascension.
          </p>
        </Card>
      )}

      <BucketBarsChart
        title="Time-to-ascension distribution"
        buckets={(distribution.data?.buckets ?? []).map((b) => ({
          label: b.label,
          count: b.count ?? null,
        }))}
      />
    </div>
  );
}
