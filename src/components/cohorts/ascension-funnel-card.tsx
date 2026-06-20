import { Card } from "@/components/ui/card";
import { formatPercent } from "@/lib/format";

export interface FunnelCounts {
  feBuyers: number | null;
  callsBooked: number | null;
  callsAttended: number | null;
  htoCloses: number | null;
  ptoUpsells: number | null;
}

const STAGES: { key: keyof FunnelCounts; label: string }[] = [
  { key: "feBuyers", label: "FE buyers" },
  { key: "callsBooked", label: "Calls booked" },
  { key: "callsAttended", label: "Calls attended" },
  { key: "htoCloses", label: "HTO closes" },
  { key: "ptoUpsells", label: "PTO upsells" },
];

// Monochrome brand ramp, strongest at the top of the funnel — single accent
// per Prism, no traffic-light staging.
const STAGE_ALPHA = [0.85, 0.68, 0.52, 0.38, 0.26];

export function AscensionFunnelCard({
  counts,
}: {
  counts: FunnelCounts | null;
}): React.ReactElement {
  const hasData = counts !== null && STAGES.some((s) => counts[s.key] !== null);
  const base = counts?.feBuyers ?? null;

  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Ascension funnel
      </p>
      {hasData ? (
        <div className="mt-4 space-y-2">
          {STAGES.map((stage, i) => {
            const count = counts[stage.key];
            const prev = i > 0 ? counts[STAGES[i - 1].key] : null;
            const width =
              count !== null && base !== null && base > 0
                ? Math.max((count / base) * 100, 1.5)
                : 0;
            const conversion =
              count !== null && prev !== null && prev > 0 ? count / prev : null;
            return (
              <div
                key={stage.key}
                className="grid grid-cols-[5rem_1fr_3.5rem] items-center gap-2 sm:grid-cols-[8.5rem_1fr_4.5rem_4rem] sm:gap-3"
              >
                <span className="truncate text-xs text-muted-foreground sm:text-sm">
                  {stage.label}
                </span>
                <div className="h-7 overflow-hidden rounded-md bg-fill-hover">
                  {count !== null && (
                    <div
                      className="h-full rounded-md"
                      style={{
                        width: `${String(width)}%`,
                        backgroundColor: `hsl(var(--brand) / ${String(STAGE_ALPHA[i])})`,
                      }}
                    />
                  )}
                </div>
                <span className="text-right text-xs font-medium tabular-nums sm:text-sm">
                  {count === null ? "—" : count.toLocaleString()}
                </span>
                <span className="hidden text-right text-xs tabular-nums text-muted-foreground sm:block">
                  {i === 0 ? "" : formatPercent(conversion)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
          Funnel populates once call and transaction data sync.
        </div>
      )}
    </Card>
  );
}
