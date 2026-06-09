import { Info } from "lucide-react";
import {
  getAscensionFunnel,
  getCohorts,
  type CohortsResponse,
  type Granularity,
} from "@/lib/sources/bot/cohorts";
import { PageHeader } from "@/components/widgets/page-header";
import { WindowFilter } from "@/components/widgets/window-filter";
import { LastSynced } from "@/components/widgets/last-synced";
import { RefreshNow } from "@/components/widgets/refresh-now";
import { Card } from "@/components/ui/card";
import {
  AscensionFunnelCard,
  type FunnelCounts,
} from "@/components/cohorts/ascension-funnel-card";
import { CohortExplorer } from "@/components/cohorts/cohort-explorer";
import { GranularityToggle } from "@/components/cohorts/granularity-toggle";
import type { CohortDisplayRow } from "@/components/cohorts/types";
import { single, type RawSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

function asGranularity(value: string | undefined): Granularity {
  return value === "month" ? "month" : "week";
}

function toDisplayRows(data: CohortsResponse | null): CohortDisplayRow[] {
  return (data?.rows ?? []).map((r) => ({
    key: r.key,
    label: r.label ?? r.key,
    size: r.size ?? null,
    ascensionRate: r.ascensionRate ?? null,
    closeRate: r.closeRate ?? null,
    medianDaysToAscension: r.medianDaysToAscension ?? null,
    ltvCents: r.ltvCents ?? null,
    cacCents: r.cacCents ?? null,
    paybackDays: r.paybackDays ?? null,
    tierMix: r.tierMix ?? null,
    cells: (r.matrix ?? []).map((c) => ({
      week: c.week,
      cumulativeRevenueCents: c.cumulativeRevenueCents ?? null,
      ascensionRate: c.ascensionRate ?? null,
    })),
  }));
}

export default async function CohortsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}): Promise<React.ReactElement> {
  const sp = await searchParams;
  const window = { from: single(sp.from), to: single(sp.to) };
  const granularity = asGranularity(single(sp.granularity));

  const [cohorts, funnel] = await Promise.all([
    getCohorts({ ...window, granularity }),
    getAscensionFunnel(window),
  ]);

  const rows = toDisplayRows(cohorts.data);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cohorts"
        description="Acquisition cohorts, ascension economics, and the LTO → PTO funnel."
        actions={
          <>
            <GranularityToggle />
            <WindowFilter />
            <LastSynced
              at={
                cohorts.data !== null
                  ? (cohorts.data.lastSyncedAt ?? cohorts.fetchedAt)
                  : null
              }
            />
            <RefreshNow tick="all" />
          </>
        }
      />

      {cohorts.error !== null && funnel.error !== null && (
        <Card className="flex items-start gap-3 border-primary/20 bg-primary/5 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium">Awaiting data wiring</p>
            <p className="mt-1 text-muted-foreground">
              The cohort matrix, funnel, and detail views are live; metrics
              populate once the nightly cohort recompute lands in the bot
              database. ({cohorts.error})
            </p>
          </div>
        </Card>
      )}

      <AscensionFunnelCard counts={funnelCounts} />

      <CohortExplorer rows={rows} />
    </div>
  );
}
