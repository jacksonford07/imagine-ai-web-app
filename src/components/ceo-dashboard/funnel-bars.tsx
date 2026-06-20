import { Card } from "@/components/ui/card";
import { formatPercent } from "@/lib/format";

export interface FunnelStage {
  label: string;
  value: number | null;
}

// Generic horizontal funnel: bar width is each stage as a share of the first
// stage, with that share printed on the right. Monochrome brand ramp, strongest
// at the top — mirrors AscensionFunnelCard but takes arbitrary stages (used for
// the Marketing full funnel: Leads → Opt-ins → FE sales → Calls booked → Closed).
const STAGE_ALPHA = [0.85, 0.68, 0.52, 0.38, 0.26, 0.2];

export function FunnelBars({
  title,
  stages,
}: {
  title: string;
  stages: FunnelStage[];
}): React.ReactElement {
  const base = stages.find((s) => s.value !== null)?.value ?? null;
  const hasData = stages.some((s) => s.value !== null);

  return (
    <Card className="border-line bg-glass p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
        {title}
      </p>
      {hasData ? (
        <div className="mt-4 space-y-2">
          {stages.map((stage, i) => {
            const ofBase =
              stage.value !== null && base !== null && base > 0
                ? stage.value / base
                : null;
            const width =
              ofBase !== null ? Math.max(ofBase * 100, 1.5) : 0;
            return (
              <div
                key={stage.label}
                className="grid grid-cols-[7.5rem_1fr_5rem_3.5rem] items-center gap-3"
              >
                <span className="text-sm text-fg-secondary">{stage.label}</span>
                <div className="h-7 overflow-hidden rounded-md bg-fill-hover">
                  {stage.value !== null && (
                    <div
                      className="h-full rounded-md"
                      style={{
                        width: `${String(width)}%`,
                        backgroundColor: `hsl(var(--brand) / ${String(
                          STAGE_ALPHA[Math.min(i, STAGE_ALPHA.length - 1)],
                        )})`,
                      }}
                    />
                  )}
                </div>
                <span className="text-right text-sm font-medium tabular-nums text-fg-primary">
                  {stage.value === null
                    ? "—"
                    : stage.value.toLocaleString("en-US")}
                </span>
                <span className="text-right text-xs tabular-nums text-fg-subtle">
                  {i === 0 ? "100%" : formatPercent(ofBase)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-[180px] items-center justify-center text-sm text-fg-muted">
          Funnel populates once lead and sales data sync
        </div>
      )}
    </Card>
  );
}
