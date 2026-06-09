import { LastSynced } from "@/components/widgets/last-synced";
import type { MetricValue } from "@/lib/sources/bot/kpis";
import { KpiStatCard } from "./kpi-stat-card";
import type { MetricKind } from "./metric-format";

export interface KpiCardDef {
  label: string;
  kind: MetricKind;
  metric: MetricValue;
  hint?: string;
}

// One sheet group (Overview / FE engine / BE engine / Pipeline): heading,
// the group's own last-synced badge (amber when stale), and the stat grid.
export function KpiSection({
  title,
  lastSyncedAt,
  cards,
  overrideHref,
  children,
}: {
  title: string;
  lastSyncedAt: string | null;
  cards: KpiCardDef[];
  overrideHref: string;
  children?: React.ReactNode;
}): React.ReactElement {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-fg-muted">
          {title}
        </h2>
        <LastSynced at={lastSyncedAt} />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <KpiStatCard
            key={card.label}
            label={card.label}
            kind={card.kind}
            metric={card.metric}
            hint={card.hint}
            neverSynced={lastSyncedAt === null}
            overrideHref={overrideHref}
          />
        ))}
      </div>
      {children}
    </section>
  );
}
