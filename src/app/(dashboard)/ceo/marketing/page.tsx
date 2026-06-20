import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/widgets/page-header";
import { WindowFilter } from "@/components/widgets/window-filter";
import { LastSynced } from "@/components/widgets/last-synced";
import { RefreshNow } from "@/components/widgets/refresh-now";
import { AffiliateFilter } from "@/components/ceo-overview/affiliate-filter";
import { DeltaStatCard } from "@/components/ceo-dashboard/delta-stat-card";
import {
  MetricTable,
  type MetricRow,
} from "@/components/ceo-dashboard/metric-table";
import { FunnelBars } from "@/components/ceo-dashboard/funnel-bars";
import { DailyBarsChart } from "@/components/ceo-dashboard/daily-bars-chart";
import {
  getCeoKpis,
  type AffiliateFilter as AffiliateValue,
} from "@/lib/sources/bot/kpis";
import {
  getMarketing,
  type ChannelSpend,
  type SplitRow,
} from "@/lib/sources/bot/marketing";
import { deltaFraction, resolveWindow, withPrior } from "@/lib/period";
import { formatCents, formatCompactCents } from "@/lib/format";
import {
  formatMetric,
  type MetricKind,
} from "@/components/ceo-overview/metric-format";
import { single, type RawSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

function asAffiliate(
  value: string | string[] | undefined,
): AffiliateValue | undefined {
  const v = single(value);
  return v === "yes" || v === "no" || v === "both" ? v : undefined;
}

// Each split metric formats differently; map by the metric label the bot sends.
const SPLIT_KIND: Record<string, MetricKind> = {
  "FE sales": "count",
  "FE revenue": "cents",
  "FE AOV": "cents",
  "FE ROAS": "ratio",
  "Bump rate": "percent",
  "OTO rate": "percent",
};

function splitCell(metric: string, value: number | null | undefined): string {
  return formatMetric(SPLIT_KIND[metric] ?? "count", value ?? null);
}

export default async function MarketingPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}): Promise<React.ReactElement> {
  const sp = await searchParams;
  const affiliate = asAffiliate(sp.affiliate);
  const { current, prior, priorLabel } = withPrior(
    resolveWindow(single(sp.from), single(sp.to)),
  );

  const [cur, prev, marketing] = await Promise.all([
    getCeoKpis({ from: current.from, to: current.to, affiliate }),
    getCeoKpis({ from: prior.from, to: prior.to, affiliate }),
    getMarketing({ from: current.from, to: current.to }),
  ]);

  const o = cur.data?.overview;
  const fe = cur.data?.feEngine;
  const pipeline = cur.data?.pipeline;
  const pPipeline = prev.data?.pipeline;
  const be = cur.data?.beEngine;
  const pO = prev.data?.overview;
  const pFe = prev.data?.feEngine;
  const deltaLabel = `vs ${priorLabel}`;

  const split: SplitRow[] = marketing.data?.split ?? [];
  const funnel = marketing.data?.fullFunnel;
  const channels: ChannelSpend[] = marketing.data?.spendByChannel ?? [];
  const budget = marketing.data?.budgetTargetCents ?? null;
  const adSpend = o?.adSpendCents.value ?? null;

  const spendPace =
    adSpend !== null && budget !== null && budget > 0
      ? {
          fraction: adSpend / budget,
          label: `${formatCompactCents(adSpend)} of ${formatCompactCents(budget)} target`,
        }
      : null;

  const unitEconomics: MetricRow[] = [
    {
      label: "CAC (FE CPA)",
      value: formatCents(fe?.feCpaCents.value ?? null),
      delta: deltaFraction(
        fe?.feCpaCents.value ?? null,
        pFe?.feCpaCents.value ?? null,
      ),
    },
    {
      label: "Cost per lead",
      value: formatCents(pipeline?.cplCents.value ?? null),
      delta: deltaFraction(
        pipeline?.cplCents.value ?? null,
        pPipeline?.cplCents.value ?? null,
      ),
    },
    {
      label: "Cost per call booked",
      value: formatCents(pipeline?.costPerCallBookedCents.value ?? null),
      delta: deltaFraction(
        pipeline?.costPerCallBookedCents.value ?? null,
        pPipeline?.costPerCallBookedCents.value ?? null,
      ),
    },
    {
      label: "Cash per lead",
      value: formatCents(pipeline?.cashPerLeadCents.value ?? null),
      delta: deltaFraction(
        pipeline?.cashPerLeadCents.value ?? null,
        pPipeline?.cashPerLeadCents.value ?? null,
      ),
    },
  ];

  const adSpendPoints = (marketing.data?.adSpendDaily ?? []).map((pt) => ({
    label: pt.date.slice(5),
    spendCents: pt.spendCents ?? null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketing"
        description="Front-end acquisition — spend, sales, CPA and ROAS."
        actions={
          <>
            <WindowFilter />
            <AffiliateFilter />
            <LastSynced at={fe?.lastSyncedAt ?? marketing.data?.lastSyncedAt ?? null} />
            <RefreshNow tick="all" />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DeltaStatCard
          label="Ad spend · MTD"
          value={formatCents(adSpend)}
          delta={deltaFraction(adSpend, pO?.adSpendCents.value ?? null)}
          deltaLabel={deltaLabel}
          pace={spendPace}
        />
        <DeltaStatCard
          label="FE sales"
          value={formatMetric("count", fe?.feSalesCount.value ?? null)}
          delta={deltaFraction(
            fe?.feSalesCount.value ?? null,
            pFe?.feSalesCount.value ?? null,
          )}
          deltaLabel={deltaLabel}
        />
        <DeltaStatCard
          label="FE CPA (blended)"
          value={formatCents(fe?.feCpaCents.value ?? null)}
          delta={deltaFraction(
            fe?.feCpaCents.value ?? null,
            pFe?.feCpaCents.value ?? null,
          )}
          deltaLabel={deltaLabel}
        />
        <DeltaStatCard
          label="Blended ROAS"
          value={formatMetric("ratio", o?.roas.value ?? null)}
          delta={deltaFraction(o?.roas.value ?? null, pO?.roas.value ?? null)}
          deltaLabel={deltaLabel}
        />
      </div>

      <Card className="flex items-start gap-3 border-line bg-glass p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-soft" />
        <p className="text-sm text-fg-muted">
          <span className="font-medium text-fg-primary">FE ROAS context.</span>{" "}
          Front-end ROAS is engineered to recover acquisition cost; profit is
          realised in back-end ascension. Read blended ROAS alongside ascension
          rate, not in isolation.
        </p>
      </Card>

      <Card className="border-line bg-glass p-5">
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-fg-muted">
          Paid vs organic split
        </p>
        {split.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Organic</TableHead>
                <TableHead className="text-right">Blended</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {split.map((r) => (
                <TableRow key={r.metric}>
                  <TableCell className="text-fg-secondary">{r.metric}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {splitCell(r.metric, r.paid)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {splitCell(r.metric, r.organic)}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {splitCell(r.metric, r.blended)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex h-[160px] items-center justify-center text-sm text-fg-muted">
            Paid vs organic split populates once attribution data syncs
          </div>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-line bg-glass p-5">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-fg-muted">
            Spend by channel
          </p>
          {channels.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                  <TableHead className="text-right">CPA</TableHead>
                  <TableHead className="text-right">ROAS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((ch) => (
                  <TableRow key={ch.channel}>
                    <TableCell className="text-fg-secondary">
                      {ch.channel}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCents(ch.spendCents ?? null)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCents(ch.cpaCents ?? null)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {ch.roas === null || ch.roas === undefined
                        ? "—"
                        : `${ch.roas.toFixed(2)}×`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex h-[160px] items-center justify-center text-sm text-fg-muted">
              Channel-level spend populates once attribution data syncs
            </div>
          )}
        </Card>
        <MetricTable title="Unit economics" rows={unitEconomics} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FunnelBars
          title="Full funnel · MTD"
          stages={[
            { label: "Leads", value: pipeline?.leads.value ?? null },
            { label: "Opt-ins", value: funnel?.optIns ?? null },
            { label: "FE sales", value: fe?.feSalesCount.value ?? null },
            { label: "Calls booked", value: be?.callsBooked.value ?? null },
            { label: "Closed", value: funnel?.closed ?? null },
          ]}
        />
        <DailyBarsChart
          title="Ad spend daily · MTD"
          data={adSpendPoints}
          series={[{ key: "spendCents", label: "Spend", chart: 3 }]}
        />
      </div>
    </div>
  );
}
