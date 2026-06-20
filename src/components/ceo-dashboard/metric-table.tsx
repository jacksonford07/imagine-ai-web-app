import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LastSynced } from "@/components/widgets/last-synced";
import { formatSignedPercent } from "@/lib/format";

export interface MetricRow {
  label: string;
  /** Preformatted display value, e.g. "$64,975" or "31.4%". */
  value: string;
  /** Fractional change vs prior period; null hides the delta. */
  delta?: number | null;
}

// Label → value (→ optional ▲/▼ delta) list inside a titled card. Used for the
// Overview Marketing/Sales/Fulfillment columns, the paid-vs-organic split, and
// the refund/chargeback detail panels. Monochrome — no red/green.
export function MetricTable({
  title,
  rows,
  lastSyncedAt,
  href,
  hrefLabel = "Details",
}: {
  title: string;
  rows: MetricRow[];
  lastSyncedAt?: string | null;
  href?: string;
  hrefLabel?: string;
}): React.ReactElement {
  return (
    <Card className="border-line bg-glass p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-fg-muted">
          {title}
        </h2>
        {href !== undefined ? (
          <Link
            href={href}
            className="text-xs text-fg-muted transition-colors hover:text-fg-primary"
          >
            {hrefLabel} ›
          </Link>
        ) : (
          lastSyncedAt !== undefined && <LastSynced at={lastSyncedAt} />
        )}
      </div>
      <dl className="divide-y divide-line">
        {rows.map((row) => {
          const showDelta =
            row.delta !== undefined &&
            row.delta !== null &&
            !Number.isNaN(row.delta);
          return (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 py-2"
            >
              <dt className="text-sm text-fg-secondary">{row.label}</dt>
              <dd className="flex items-center gap-2">
                <span className="text-sm font-medium tabular-nums text-fg-primary">
                  {row.value}
                </span>
                {showDelta && (
                  <span className="inline-flex items-center gap-0.5 text-xs tabular-nums text-fg-subtle">
                    {row.delta! >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {formatSignedPercent(row.delta!)}
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </Card>
  );
}
