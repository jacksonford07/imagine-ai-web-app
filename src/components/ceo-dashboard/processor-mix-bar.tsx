import { Card } from "@/components/ui/card";
import { formatCents, formatPercent } from "@/lib/format";
import type { ProcessorRow } from "@/lib/sources/bot/payments";

// Single proportional bar of the payment-processor mix plus a legend table.
// Monochrome navy ramp (chart-1..5, cycled). Shares are taken from the row when
// the bot provides them, else derived from value totals. Renders an awaiting
// state until at least one processor carries a value.
const RAMP = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function ProcessorMixBar({
  rows,
}: {
  rows: ProcessorRow[];
}): React.ReactElement {
  const total = rows.reduce((sum, r) => sum + (r.valueCents ?? 0), 0);
  const present = rows.filter((r) => (r.valueCents ?? 0) > 0);
  const hasData = present.length > 0;

  const share = (row: ProcessorRow): number | null => {
    if (row.share !== null && row.share !== undefined) return row.share;
    if (total > 0 && row.valueCents !== null && row.valueCents !== undefined) {
      return row.valueCents / total;
    }
    return null;
  };

  return (
    <Card className="border-line bg-glass p-5">
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-fg-muted">
        Payment processor mix
      </p>
      {hasData ? (
        <>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-fill-hover">
            {present.map((row, i) => {
              const s = share(row) ?? 0;
              return (
                <div
                  key={row.label}
                  style={{
                    width: `${String(s * 100)}%`,
                    backgroundColor: RAMP[i % RAMP.length],
                  }}
                />
              );
            })}
          </div>
          <dl className="mt-4 divide-y divide-line">
            {present.map((row, i) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 py-2"
              >
                <dt className="flex items-center gap-2 text-sm text-fg-secondary">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: RAMP[i % RAMP.length] }}
                  />
                  {row.label}
                </dt>
                <dd className="flex items-center gap-3 tabular-nums">
                  <span className="text-sm font-medium text-fg-primary">
                    {formatCents(row.valueCents ?? null)}
                  </span>
                  <span className="w-12 text-right text-xs text-fg-subtle">
                    {formatPercent(share(row))}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <div className="flex h-[160px] items-center justify-center text-sm text-fg-muted">
          Processor mix populates once payment data syncs
        </div>
      )}
    </Card>
  );
}
