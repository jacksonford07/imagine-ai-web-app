import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatSignedPercent } from "@/lib/format";

export interface PaceBar {
  /** 0–1 fraction of the bar to fill. */
  fraction: number;
  label: string;
}

// Hero KPI card for the CEO pages: a large value plus an optional "vs {period}"
// delta and an optional pace progress bar. Monochrome per Prism — direction is
// shown by a ▲/▼ glyph, not red/green. Null value renders "—", null delta omits
// the delta line entirely (never a fake 0%).
export function DeltaStatCard({
  label,
  value,
  delta,
  deltaLabel,
  hint,
  pace,
}: {
  label: string;
  /** Preformatted display value, e.g. "$321,997" or "2.43×". */
  value: string;
  /** Fractional change vs prior period (0.094 = +9.4%); null hides the line. */
  delta?: number | null;
  /** Period suffix, e.g. "vs Apr". */
  deltaLabel?: string;
  hint?: string;
  pace?: PaceBar | null;
}): React.ReactElement {
  const showDelta = delta !== undefined && delta !== null && !Number.isNaN(delta);
  const Arrow = !showDelta
    ? Minus
    : delta > 0
      ? ArrowUpRight
      : delta < 0
        ? ArrowDownRight
        : Minus;

  return (
    <Card className="border-line bg-glass p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-fg-primary">
        {value}
      </p>
      {showDelta && (
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-fg-muted">
          <Arrow className="h-3 w-3" />
          <span className="tabular-nums">{formatSignedPercent(delta)}</span>
          {deltaLabel !== undefined && (
            <span className="text-fg-subtle">{deltaLabel}</span>
          )}
        </p>
      )}
      {hint !== undefined && (
        <p className="mt-1 text-xs text-fg-subtle">{hint}</p>
      )}
      {pace !== undefined && pace !== null && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-fill-hover">
            <div
              className="h-full rounded-full bg-brand"
              style={{
                width: `${String(Math.max(0, Math.min(100, pace.fraction * 100)))}%`,
              }}
            />
          </div>
          <p className="mt-1 text-xs text-fg-subtle">{pace.label}</p>
        </div>
      )}
    </Card>
  );
}
