import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/widgets/page-header";
import { WindowFilter } from "@/components/widgets/window-filter";
import { LastSynced } from "@/components/widgets/last-synced";
import { RefreshNow } from "@/components/widgets/refresh-now";
import { AffiliateFilter } from "@/components/ceo-overview/affiliate-filter";
import { AscensionLadder } from "@/components/ceo-overview/ascension-ladder";
import {
  KpiSection,
  type KpiCardDef,
} from "@/components/ceo-overview/kpi-section";
import {
  MoneyMixChart,
  type MoneyBar,
} from "@/components/ceo-overview/money-mix-chart";
import {
  RatesChart,
  type RateBar,
} from "@/components/ceo-overview/rates-chart";
import {
  ceoKpisSchema,
  getCeoKpis,
  type AffiliateFilter as AffiliateValue,
  type CeoKpis,
} from "@/lib/sources/bot/kpis";
import { single, type RawSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

// Renders the full sheet structure with null metrics ("—") whenever the bot
// endpoint is missing or partial — the page never blanks or shows zeros.
const EMPTY_KPIS: CeoKpis = ceoKpisSchema.parse({});

function asAffiliate(
  value: string | string[] | undefined,
): AffiliateValue | undefined {
  const v = single(value);
  return v === "yes" || v === "no" || v === "both" ? v : undefined;
}

/** Oldest non-null group sync — the page-level badge warns on the laggard. */
function oldestSync(times: (string | null)[]): string | null {
  let oldest: string | null = null;
  for (const t of times) {
    if (t === null) continue;
    if (oldest === null || new Date(t) < new Date(oldest)) oldest = t;
  }
  return oldest;
}

export default async function CeoOverviewPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}): Promise<React.ReactElement> {
  const sp = await searchParams;
  const from = single(sp.from);
  const to = single(sp.to);
  const affiliate = asAffiliate(sp.affiliate);

  const { data, error } = await getCeoKpis({ from, to, affiliate });
  const kpis = data ?? EMPTY_KPIS;
  const { overview, feEngine, beEngine, pipeline } = kpis;

  const drillParams = new URLSearchParams();
  if (from !== undefined) drillParams.set("from", from);
  if (to !== undefined) drillParams.set("to", to);
  if (affiliate !== undefined) drillParams.set("affiliate", affiliate);
  const drillQs = drillParams.toString();
  const overrideHref = `/ceo/transactions${drillQs !== "" ? `?${drillQs}` : ""}`;

  const overviewCards: KpiCardDef[] = [
    { label: "Ad spend", kind: "cents", metric: overview.adSpendCents },
    {
      label: "Cash collected",
      kind: "cents",
      metric: overview.cashCollectedCents,
    },
    { label: "FE CPA", kind: "cents", metric: overview.feCpaCents },
    { label: "FE AOV", kind: "cents", metric: overview.feAovCents },
    { label: "Bump rate", kind: "percent", metric: overview.bumpRate },
    { label: "OTO rate", kind: "percent", metric: overview.otoRate },
    { label: "Gross", kind: "cents", metric: overview.grossCents },
    { label: "ROAS", kind: "ratio", metric: overview.roas },
    {
      label: "FE conversion",
      kind: "percent",
      metric: overview.feConversionRate,
    },
  ];

  const feCards: KpiCardDef[] = [
    { label: "FE sales", kind: "count", metric: feEngine.feSalesCount },
    { label: "FE AOV", kind: "cents", metric: feEngine.feAovCents },
    {
      label: "FE sales revenue",
      kind: "cents",
      metric: feEngine.feSalesRevenueCents,
    },
    { label: "FE CPA", kind: "cents", metric: feEngine.feCpaCents },
    { label: "FE ROAS", kind: "ratio", metric: feEngine.feRoas },
  ];

  const beCards: KpiCardDef[] = [
    { label: "Calls booked", kind: "count", metric: beEngine.callsBooked },
    { label: "BE revenue", kind: "cents", metric: beEngine.beRevenueCents },
    {
      label: "BE new customers",
      kind: "count",
      metric: beEngine.beNewCustomers,
    },
    {
      label: "Ascension rate",
      kind: "percent",
      metric: beEngine.ascensionRate,
    },
    { label: "HTO AOV", kind: "cents", metric: beEngine.htoAovCents },
    { label: "New MTO", kind: "count", metric: beEngine.newMtoCustomers },
    { label: "New HTO", kind: "count", metric: beEngine.newHtoCustomers },
    { label: "New PTO", kind: "count", metric: beEngine.newPtoCustomers },
  ];

  const pipelineCards: KpiCardDef[] = [
    { label: "Leads", kind: "count", metric: pipeline.leads },
    { label: "CPL", kind: "cents", metric: pipeline.cplCents },
    {
      label: "Cost per call booked",
      kind: "cents",
      metric: pipeline.costPerCallBookedCents,
    },
    {
      label: "Cash per lead",
      kind: "cents",
      metric: pipeline.cashPerLeadCents,
    },
    { label: "Profit", kind: "cents", metric: pipeline.profitCents },
  ];

  const moneyBars: MoneyBar[] = [
    { label: "Gross", cents: overview.grossCents.value, chart: 1 },
    {
      label: "Collected",
      cents: overview.cashCollectedCents.value,
      chart: 2,
    },
    {
      label: "FE revenue",
      cents: feEngine.feSalesRevenueCents.value,
      chart: 4,
    },
    { label: "BE revenue", cents: beEngine.beRevenueCents.value, chart: 5 },
    { label: "Ad spend", cents: overview.adSpendCents.value, chart: 3 },
    { label: "Profit", cents: pipeline.profitCents.value, chart: 2 },
  ];

  const rateBars: RateBar[] = [
    { label: "Bump rate", fraction: overview.bumpRate.value },
    { label: "OTO rate", fraction: overview.otoRate.value },
    { label: "FE conversion", fraction: overview.feConversionRate.value },
    { label: "Ascension rate", fraction: beEngine.ascensionRate.value },
  ];

  const ladderNeverSynced =
    feEngine.lastSyncedAt === null && beEngine.lastSyncedAt === null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="CEO Overview"
        description="Live KPI sheet — defaults to this month to date."
        actions={
          <>
            <WindowFilter />
            <AffiliateFilter />
            <LastSynced
              at={oldestSync([
                overview.lastSyncedAt,
                feEngine.lastSyncedAt,
                beEngine.lastSyncedAt,
                pipeline.lastSyncedAt,
              ])}
            />
            <RefreshNow tick="all" />
          </>
        }
      />

      {error !== null && (
        <Card className="flex items-start gap-3 border-line bg-glass p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-soft" />
          <div className="text-sm">
            <p className="font-medium text-fg-primary">Awaiting KPI data</p>
            <p className="mt-1 text-fg-muted">
              The KPI endpoint isn&apos;t serving data yet — metrics populate as
              soon as the bot pipeline lands. ({error})
            </p>
          </div>
        </Card>
      )}

      <KpiSection
        title="Overview"
        lastSyncedAt={overview.lastSyncedAt}
        cards={overviewCards}
        overrideHref={overrideHref}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <MoneyMixChart title="Revenue & spend" data={moneyBars} />
        <RatesChart title="Funnel rates" data={rateBars} />
      </div>

      <KpiSection
        title="FE engine"
        lastSyncedAt={feEngine.lastSyncedAt}
        cards={feCards}
        overrideHref={overrideHref}
      />

      <KpiSection
        title="BE engine"
        lastSyncedAt={beEngine.lastSyncedAt}
        cards={beCards}
        overrideHref={overrideHref}
      >
        <div className="pt-1">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-fg-subtle">
            Ascension ladder — new customers this window
          </p>
          <AscensionLadder
            rungs={[
              {
                key: "LTO",
                short: "LTO",
                name: "Low Ticket Offer",
                caption: "front-end buyers",
                metric: feEngine.feSalesCount,
              },
              {
                key: "MTO",
                short: "MTO",
                name: "Mid Ticket Offer",
                caption: "new customers",
                metric: beEngine.newMtoCustomers,
              },
              {
                key: "HTO",
                short: "HTO",
                name: "High Ticket Offer",
                caption: "new customers",
                metric: beEngine.newHtoCustomers,
              },
              {
                key: "PTO",
                short: "PTO",
                name: "Premium Ticket Offer",
                caption: "new customers",
                metric: beEngine.newPtoCustomers,
              },
            ]}
            neverSynced={ladderNeverSynced}
            overrideHref={overrideHref}
          />
        </div>
      </KpiSection>

      <KpiSection
        title="Pipeline & unit economics"
        lastSyncedAt={pipeline.lastSyncedAt}
        cards={pipelineCards}
        overrideHref={overrideHref}
      />
    </div>
  );
}
