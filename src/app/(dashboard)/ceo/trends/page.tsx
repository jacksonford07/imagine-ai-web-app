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
import { LastSynced } from "@/components/widgets/last-synced";
import { RefreshNow } from "@/components/widgets/refresh-now";
import { LineTrendChart } from "@/components/ceo-dashboard/line-trend-chart";
import { getTrends, type MonthPoint } from "@/lib/sources/bot/trends";
import { deltaFraction } from "@/lib/period";
import {
  formatCents,
  formatPercent,
  formatSignedPercent,
} from "@/lib/format";

export const dynamic = "force-dynamic";

function ratioText(v: number | null | undefined): string {
  return v === null || v === undefined ? "—" : `${v.toFixed(2)}×`;
}

export default async function TrendsPage(): Promise<React.ReactElement> {
  const trends = await getTrends(6);
  const months: MonthPoint[] = trends.data?.months ?? [];

  const chartData = months.map((m) => ({
    label: m.month,
    cashCents: m.cashCents ?? null,
    spendCents: m.spendCents ?? null,
    roas: m.roas ?? null,
    ascensionRate: m.ascensionRate ?? null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trends"
        description="Six-month view of cash, spend, ROAS and ascension."
        actions={
          <>
            <LastSynced at={trends.data?.lastSyncedAt ?? null} />
            <RefreshNow tick="all" />
          </>
        }
      />

      <LineTrendChart
        title="Cash & spend · 6 months"
        data={chartData}
        unit="cents"
        series={[
          { key: "cashCents", label: "Cash", chart: 1 },
          { key: "spendCents", label: "Spend", chart: 3 },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <LineTrendChart
          title="Blended ROAS · 6 months"
          data={chartData}
          unit="ratio"
          series={[{ key: "roas", label: "ROAS", chart: 1 }]}
        />
        <LineTrendChart
          title="Ascension rate · 6 months"
          data={chartData}
          unit="percent"
          series={[{ key: "ascensionRate", label: "Ascension rate", chart: 1 }]}
        />
      </div>

      <Card className="border-line bg-glass p-5">
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-fg-muted">
          Month-over-month summary
        </p>
        {months.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Cash</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">ROAS</TableHead>
                <TableHead className="text-right">HTO closes</TableHead>
                <TableHead className="text-right">Asc %</TableHead>
                <TableHead className="text-right">MoM Δ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {months.map((m, i) => {
                const prevCash = i > 0 ? (months[i - 1].cashCents ?? null) : null;
                const mom = deltaFraction(m.cashCents ?? null, prevCash);
                return (
                  <TableRow key={m.month}>
                    <TableCell className="font-medium text-fg-primary">
                      {m.month}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCents(m.cashCents ?? null)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCents(m.spendCents ?? null)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {ratioText(m.roas)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {m.htoCloses === null || m.htoCloses === undefined
                        ? "—"
                        : m.htoCloses.toLocaleString("en-US")}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPercent(m.ascensionRate ?? null)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-fg-muted">
                      {i === 0 ? "—" : formatSignedPercent(mom)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex h-[160px] items-center justify-center text-sm text-fg-muted">
            Monthly history populates once the trends rollup syncs
          </div>
        )}
      </Card>
    </div>
  );
}
