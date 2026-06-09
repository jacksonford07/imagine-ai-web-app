import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCents } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PnlReport } from "@/lib/sources/bot/reports";

type RowKind = "start" | "deduction" | "subtotal" | "total";

interface WaterfallRow {
  label: string;
  kind: RowKind;
  amountCents: number | null;
  runningCents: number | null;
}

// Builds the gross → profit waterfall. The running balance only advances
// while every step is known; endpoint-provided subtotals (net/profit) re-seed
// it so a single missing fee line doesn't blank the rest of the statement.
function buildRows(data: PnlReport): WaterfallRow[] {
  const rows: WaterfallRow[] = [];
  let running: number | null = data.grossCents ?? null;

  rows.push({
    label: "Gross revenue",
    kind: "start",
    amountCents: data.grossCents ?? null,
    runningCents: running,
  });

  const deduct = (label: string, cents: number | null | undefined): void => {
    const amount = cents ?? null;
    running = running !== null && amount !== null ? running - amount : null;
    rows.push({
      label,
      kind: "deduction",
      amountCents: amount,
      runningCents: running,
    });
  };

  deduct("Processor fees", data.processorFeeCents);
  deduct("Financing fees", data.financingFeeCents);
  deduct("Refunds", data.refundsCents);
  deduct("Chargebacks", data.chargebacksCents);

  running = data.netCents ?? running;
  rows.push({
    label: "Net revenue",
    kind: "subtotal",
    amountCents: running,
    runningCents: running,
  });

  deduct("Ad spend", data.adSpendCents);
  deduct("Commission accrual", data.commissionAccrualCents);

  running = data.profitCents ?? running;
  rows.push({
    label: "Profit",
    kind: "total",
    amountCents: running,
    runningCents: running,
  });

  return rows;
}

function amountText(row: WaterfallRow): string {
  if (row.amountCents === null) return "—";
  if (row.kind === "deduction") return `− ${formatCents(row.amountCents)}`;
  return formatCents(row.amountCents);
}

export function PnlWaterfall({
  data,
}: {
  data: PnlReport;
}): React.ReactElement {
  const rows = buildRows(data);
  const gross = data.grossCents ?? null;

  const barWidth = (cents: number | null): number => {
    if (cents === null || gross === null || gross <= 0) return 0;
    return Math.max(0, Math.min(100, (cents / gross) * 100));
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Profit &amp; loss</CardTitle>
        <CardDescription>
          Gross to profit, every deduction on its own line.
        </CardDescription>
      </CardHeader>
      <div className="px-6 pb-6">
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                  Line item
                </th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                  Running balance
                </th>
                <th
                  className="w-[30%] px-4 py-2.5 print:hidden"
                  aria-hidden="true"
                />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const emphasized =
                  row.kind === "subtotal" || row.kind === "total";
                return (
                  <tr
                    key={row.label}
                    className={cn(
                      "border-b last:border-0",
                      emphasized && "border-t bg-muted/20",
                    )}
                  >
                    <td
                      className={cn(
                        "px-4 py-2.5",
                        row.kind === "deduction" &&
                          "pl-8 text-muted-foreground",
                        emphasized && "font-semibold",
                        row.kind === "total" && "text-brand-soft",
                      )}
                    >
                      {row.label}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right tabular-nums",
                        row.kind === "deduction" && "text-muted-foreground",
                        emphasized && "font-semibold",
                        row.kind === "total" && "text-brand-soft",
                      )}
                    >
                      {amountText(row)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right tabular-nums text-muted-foreground",
                        emphasized && "font-semibold text-foreground",
                      )}
                    >
                      {formatCents(row.runningCents)}
                    </td>
                    <td className="px-4 py-2.5 print:hidden">
                      <div className="h-1.5 w-full rounded-full bg-fill-hover">
                        <div
                          className={cn(
                            "h-1.5 rounded-full",
                            emphasized ? "bg-brand" : "bg-brand/35",
                          )}
                          style={{
                            width: `${String(barWidth(row.runningCents))}%`,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
