import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/widgets/stat-card";
import { formatCents, formatDateTime, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  CohortMovementRow,
  EowKpi,
  EowReport,
  ReportWatchlistItem,
} from "@/lib/sources/bot/reports";

function kpiValue(kpi: EowKpi): string {
  const value = kpi.value ?? null;
  if (value === null) return "—";
  if (kpi.unit === "cents") return formatCents(value);
  if (kpi.unit === "fraction") return formatPercent(value);
  return value.toLocaleString("en-US");
}

function kpiDelta(kpi: EowKpi): string | undefined {
  const delta = kpi.deltaVsPriorWeek ?? null;
  if (delta === null) return undefined;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${(delta * 100).toFixed(1)}% vs prior week`;
}

function watchlistLabel(item: ReportWatchlistItem): string {
  return item.title ?? item.label ?? "Untitled item";
}

function movementLabel(row: CohortMovementRow): string {
  if (row.fromTier != null && row.toTier != null) {
    return `${row.fromTier} → ${row.toTier}`;
  }
  return row.fromTier ?? row.toTier ?? "—";
}

export function EowReportView({
  data,
}: {
  data: EowReport;
}): React.ReactElement {
  const kpis = data.kpis ?? [];
  const movement = data.cohortMovement ?? [];
  const watchlist = data.watchlist ?? [];

  return (
    <div className="space-y-6">
      {kpis.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
          {kpis.map((kpi, i) => (
            <StatCard
              key={kpi.key ?? kpi.label ?? String(i)}
              label={kpi.label ?? kpi.key ?? "Metric"}
              value={kpiValue(kpi)}
              hint={kpiDelta(kpi)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            No KPIs reported for this week.
          </p>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Cohort movement</CardTitle>
          <CardDescription>
            Customers that changed tier during the week.
          </CardDescription>
        </CardHeader>
        {movement.length > 0 ? (
          <div className="px-6 pb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cohort</TableHead>
                  <TableHead>Movement</TableHead>
                  <TableHead className="text-right">Customers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movement.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row.cohort ?? "—"}</TableCell>
                    <TableCell>{movementLabel(row)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.customers?.toLocaleString("en-US") ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="px-6 pb-6 text-sm text-muted-foreground">
            No cohort movement recorded for this week.
          </p>
        )}
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Watchlist</CardTitle>
          <CardDescription>
            Open and recently-resolved alerts in this window.
          </CardDescription>
        </CardHeader>
        {watchlist.length > 0 ? (
          <div className="px-6 pb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Opened</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {watchlist.map((item, i) => (
                  <TableRow key={item.id ?? i}>
                    <TableCell>{watchlistLabel(item)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          item.status === "open"
                            ? "text-warning"
                            : "text-muted-foreground",
                        )}
                      >
                        {item.status ?? "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDateTime(item.openedAt ?? null)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="px-6 pb-6 text-sm text-muted-foreground">
            Watchlist is clear for this week.
          </p>
        )}
      </Card>
    </div>
  );
}
