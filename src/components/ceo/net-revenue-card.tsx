import { Card } from "@/components/ui/card";
import { formatCents } from "@/lib/format";

interface Line {
  label: string;
  cents: number | null;
  /** Rendered as a deduction (minus sign, muted). */
  deduction?: boolean;
  hint?: string;
}

// The exact net-revenue waterfall the audits enforce: gross, less processor
// fees, less financing fees surfaced separately, equals net.
export function NetRevenueCard({
  grossCents,
  processorFeeCents,
  financingFeeCents,
  netCents,
}: {
  grossCents: number | null;
  processorFeeCents: number | null;
  financingFeeCents: number | null;
  netCents: number | null;
}): React.ReactElement {
  const lines: Line[] = [
    { label: "Gross sales", cents: grossCents },
    {
      label: "Processor fees",
      cents: processorFeeCents,
      deduction: true,
      hint: "Whop / Fanbasis",
    },
    {
      label: "Financing fees",
      cents: financingFeeCents,
      deduction: true,
      hint: "ClarityPay / Splitit, deducted at source",
    },
  ];

  return (
    <Card className="p-5">
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Net revenue
      </p>
      <div className="space-y-3">
        {lines.map((line) => (
          <div key={line.label} className="flex items-baseline justify-between">
            <div>
              <p className="text-sm">{line.label}</p>
              {line.hint !== undefined && (
                <p className="text-xs text-muted-foreground">{line.hint}</p>
              )}
            </div>
            <p
              className={`text-sm tabular-nums ${
                line.deduction === true ? "text-muted-foreground" : ""
              }`}
            >
              {line.deduction === true && line.cents !== null ? "− " : ""}
              {formatCents(line.cents)}
            </p>
          </div>
        ))}
        <div className="flex items-baseline justify-between border-t pt-3">
          <p className="text-sm font-semibold">Net revenue</p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCents(netCents)}
          </p>
        </div>
      </div>
    </Card>
  );
}
