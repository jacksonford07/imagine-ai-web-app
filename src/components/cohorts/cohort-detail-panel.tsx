import { Card } from "@/components/ui/card";
import { TIERS } from "@/lib/ceo/taxonomy";
import { formatCents, formatPercent } from "@/lib/format";
import type { CohortDisplayRow } from "./types";

// Literal classes so Tailwind's JIT scanner picks them up.
const CHART_BG: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "bg-chart-1",
  2: "bg-chart-2",
  3: "bg-chart-3",
  4: "bg-chart-4",
  5: "bg-chart-5",
};

function formatDays(days: number | null): string {
  if (days === null || Number.isNaN(days)) return "—";
  return `${String(Math.round(days))}d`;
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.ReactElement {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
}

export function CohortDetailPanel({
  row,
}: {
  row: CohortDisplayRow | null;
}): React.ReactElement {
  const mix = row?.tierMix ?? null;
  const mixEntries = TIERS.map((tier) => ({
    tier,
    value: mix?.[tier.key] ?? 0,
  })).filter((e) => e.value > 0);
  const mixTotal = mixEntries.reduce((sum, e) => sum + e.value, 0);

  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Cohort detail
      </p>
      {row === null ? (
        <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
          Select a cohort row to inspect it.
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm font-medium">{row.label}</p>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
            <Stat
              label="Size"
              value={row.size === null ? "—" : row.size.toLocaleString()}
            />
            <Stat label="Ascension" value={formatPercent(row.ascensionRate)} />
            <Stat label="Close rate" value={formatPercent(row.closeRate)} />
            <Stat
              label="Median time to ascension"
              value={formatDays(row.medianDaysToAscension)}
            />
            <Stat label="LTV" value={formatCents(row.ltvCents)} />
            <Stat label="CAC" value={formatCents(row.cacCents)} />
            <Stat label="Payback" value={formatDays(row.paybackDays)} />
          </div>
          <div className="mt-5">
            <p className="text-xs text-muted-foreground">Tier mix</p>
            {mixTotal > 0 ? (
              <>
                <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-fill-hover">
                  {mixEntries.map(({ tier, value }) => (
                    <div
                      key={tier.key}
                      className={CHART_BG[tier.chart]}
                      style={{
                        width: `${String((value / mixTotal) * 100)}%`,
                      }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {mixEntries.map(({ tier, value }) => (
                    <span
                      key={tier.key}
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${CHART_BG[tier.chart]}`}
                      />
                      {tier.short} {formatPercent(value / mixTotal)}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No tier mix data yet.
              </p>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
