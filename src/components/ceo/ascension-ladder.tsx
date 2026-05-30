import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LADDER_TIERS, getTier } from "@/lib/ceo/taxonomy";
import type { TierKey } from "@/lib/ceo/taxonomy";
import { formatCents } from "@/lib/format";

export interface TierMetric {
  customers: number;
  netCents: number;
}

// Literal classes so Tailwind's JIT scanner picks them up.
const CHART_BG: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "bg-chart-1",
  2: "bg-chart-2",
  3: "bg-chart-3",
  4: "bg-chart-4",
  5: "bg-chart-5",
};

function TierCard({
  tierKey,
  metric,
}: {
  tierKey: TierKey;
  metric?: TierMetric;
}): React.ReactElement {
  const tier = getTier(tierKey);
  return (
    <Card className="flex-1 p-4">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${CHART_BG[tier.chart]}`} />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {tier.short}
        </span>
      </div>
      <p className="mt-2 text-sm font-medium leading-tight">{tier.name}</p>
      <div className="mt-3 space-y-0.5">
        <p className="text-2xl font-semibold tabular-nums tracking-tight">
          {metric === undefined ? "—" : metric.customers}
        </p>
        <p className="text-xs text-muted-foreground">customers</p>
      </div>
      <p className="mt-3 text-sm font-medium tabular-nums">
        {formatCents(metric?.netCents ?? null)}
        <span className="ml-1 text-xs font-normal text-muted-foreground">
          net
        </span>
      </p>
    </Card>
  );
}

export function AscensionLadder({
  metrics,
}: {
  metrics?: Partial<Record<TierKey, TierMetric>>;
}): React.ReactElement {
  return (
    <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
      {LADDER_TIERS.map((tier, i) => (
        <div
          key={tier.key}
          className="flex flex-1 items-center gap-2 lg:flex-none lg:basis-0 lg:grow"
        >
          <TierCard tierKey={tier.key} metric={metrics?.[tier.key]} />
          {i < LADDER_TIERS.length - 1 && (
            <ChevronRight className="hidden h-5 w-5 shrink-0 text-muted-foreground/50 lg:block" />
          )}
        </div>
      ))}
    </div>
  );
}
