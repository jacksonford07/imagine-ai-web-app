import { Info, DollarSign, Wallet, Megaphone, Percent } from "lucide-react";
import { getCeoOverview } from "@/lib/sources/bot/ceo";
import type { TierStat } from "@/lib/sources/bot/ceo";
import { PageHeader } from "@/components/widgets/page-header";
import { WindowFilter } from "@/components/widgets/window-filter";
import { LastSynced } from "@/components/widgets/last-synced";
import { RefreshNow } from "@/components/widgets/refresh-now";
import { StatCard } from "@/components/widgets/stat-card";
import { Card } from "@/components/ui/card";
import {
  AscensionLadder,
  type TierMetric,
} from "@/components/ceo/ascension-ladder";
import { NetRevenueCard } from "@/components/ceo/net-revenue-card";
import { TierRevenueChart } from "@/components/ceo/tier-revenue-chart";
import { TIERS, getTier } from "@/lib/ceo/taxonomy";
import type { TierKey } from "@/lib/ceo/taxonomy";
import { formatCents, formatPercent } from "@/lib/format";
import { single, type RawSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

function toMetricMap(tiers: TierStat[]): Partial<Record<TierKey, TierMetric>> {
  const map: Partial<Record<TierKey, TierMetric>> = {};
  for (const t of tiers) {
    map[t.key] = { customers: t.customers, netCents: t.netCents };
  }
  return map;
}

export default async function CeoOverviewPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}): Promise<React.ReactElement> {
  const sp = await searchParams;
  const { data, error, fetchedAt } = await getCeoOverview({
    from: single(sp.from),
    to: single(sp.to),
  });
  const totals = data?.totals ?? null;
  const metrics = data === null ? undefined : toMetricMap(data.tiers);
  const feeRate =
    totals !== null && totals.grossCents > 0
      ? (totals.processorFeeCents + totals.financingFeeCents) /
        totals.grossCents
      : null;
  const other = getTier("OTHER");
  const chartData = TIERS.map((t) => ({
    label: t.short,
    netCents: metrics?.[t.key]?.netCents ?? 0,
    chart: t.chart,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="CEO Dashboard"
        description="Cohort ascension and net revenue across the LTO → MTO → HTO → PTO ladder."
        actions={
          <>
            <WindowFilter />
            <LastSynced at={data !== null ? fetchedAt : null} />
            <RefreshNow tick="all" />
          </>
        }
      />

      {error !== null && (
        <Card className="flex items-start gap-3 border-primary/20 bg-primary/5 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium">Awaiting data wiring</p>
            <p className="mt-1 text-muted-foreground">
              The taxonomy and net-revenue logic are live; metrics populate once
              CEO entries land in the bot database. ({error})
            </p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Gross sales"
          value={formatCents(totals?.grossCents ?? null)}
          icon={DollarSign}
        />
        <StatCard
          label="Net revenue"
          value={formatCents(totals?.netCents ?? null)}
          hint="after all fees"
          icon={Wallet}
        />
        <StatCard
          label="Ad spend"
          value={formatCents(totals?.adSpendCents ?? null)}
          icon={Megaphone}
        />
        <StatCard
          label="Fee rate"
          value={formatPercent(feeRate)}
          hint="of gross"
          icon={Percent}
        />
      </div>

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Ascension ladder
        </p>
        <AscensionLadder metrics={metrics} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <NetRevenueCard
          grossCents={totals?.grossCents ?? null}
          processorFeeCents={totals?.processorFeeCents ?? null}
          financingFeeCents={totals?.financingFeeCents ?? null}
          netCents={totals?.netCents ?? null}
        />
        <TierRevenueChart data={chartData} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-chart-3" />
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {other.name}
            </p>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {other.description}
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {other.products.map((p) => (
              <li key={p} className="text-muted-foreground">
                {p}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
