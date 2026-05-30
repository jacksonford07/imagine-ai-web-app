import { Info } from "lucide-react";
import { getCeoCohorts } from "@/lib/sources/bot/ceo";
import type { CohortRow } from "@/lib/sources/bot/ceo";
import { PageHeader } from "@/components/widgets/page-header";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TIERS, getTier } from "@/lib/ceo/taxonomy";
import type { TierKey } from "@/lib/ceo/taxonomy";
import { formatCents, formatPercent } from "@/lib/format";

export const dynamic = "force-dynamic";

const CHART_BG: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "bg-chart-1",
  2: "bg-chart-2",
  3: "bg-chart-3",
  4: "bg-chart-4",
  5: "bg-chart-5",
};

export default async function CohortsPage(): Promise<React.ReactElement> {
  const { data, error, fetchedAt } = await getCeoCohorts();
  const rowsByKey = new Map<TierKey, CohortRow>(
    (data?.rows ?? []).map((r) => [r.key, r]),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cohorts"
        description="Customers, revenue, and ascension rate per ladder tier."
        fetchedAt={fetchedAt}
      />

      {error !== null && (
        <Card className="flex items-start gap-3 border-primary/20 bg-primary/5 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium">Awaiting data wiring</p>
            <p className="mt-1 text-muted-foreground">
              Tier definitions are live; cohort metrics populate once CEO
              entries land in the bot database. ({error})
            </p>
          </div>
        </Card>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tier</TableHead>
            <TableHead className="text-right">Customers</TableHead>
            <TableHead className="text-right">Gross</TableHead>
            <TableHead className="text-right">Net</TableHead>
            <TableHead className="text-right">Ascension</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {TIERS.map((tier) => {
            const row = rowsByKey.get(tier.key);
            const def = getTier(tier.key);
            return (
              <TableRow key={tier.key}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${CHART_BG[def.chart]}`}
                    />
                    <span className="font-medium">{def.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {def.short}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row === undefined ? "—" : row.customers}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCents(row?.grossCents ?? null)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCents(row?.netCents ?? null)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {tier.onLadder
                    ? formatPercent(row?.ascensionRate ?? null)
                    : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
