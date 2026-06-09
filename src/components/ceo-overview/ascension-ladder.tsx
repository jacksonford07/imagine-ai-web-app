import Link from "next/link";
import { ChevronRight, PenLine } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { MetricValue } from "@/lib/sources/bot/kpis";
import { formatMetric } from "./metric-format";

export interface LadderRung {
  key: string;
  short: string;
  name: string;
  caption: string;
  metric: MetricValue;
}

// The ascension-ladder concept from the old /ceo scaffold, rebuilt on the
// Prism tokens: new customers flowing up LTO → MTO → HTO → PTO in the
// selected window. Counts come from the FE/BE engine groups of the KPI
// endpoint; nulls render "—" so a half-wired ladder never shows zeros.
export function AscensionLadder({
  rungs,
  neverSynced,
  overrideHref,
}: {
  rungs: LadderRung[];
  neverSynced: boolean;
  overrideHref: string;
}): React.ReactElement {
  return (
    <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
      {rungs.map((rung, i) => (
        <div
          key={rung.key}
          className="flex flex-1 items-center gap-2 lg:flex-none lg:grow lg:basis-0"
        >
          <Card className="flex-1 border-line bg-glass p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-soft">
                {rung.short}
              </span>
              {rung.metric.overridden && (
                <Link
                  href={overrideHref}
                  aria-label={`${rung.name} is overridden — open transactions drill-down`}
                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand-soft transition-colors duration-confirm hover:bg-brand/25"
                >
                  <PenLine className="h-3 w-3" />
                </Link>
              )}
            </div>
            <p className="mt-1 text-sm font-medium leading-tight text-fg-secondary">
              {rung.name}
            </p>
            <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-fg-primary">
              {formatMetric("count", rung.metric.value)}
            </p>
            <p className="mt-0.5 text-xs text-fg-subtle">
              {rung.metric.value === null && neverSynced
                ? "awaiting integration"
                : rung.caption}
            </p>
          </Card>
          {i < rungs.length - 1 && (
            <ChevronRight className="hidden h-5 w-5 shrink-0 text-fg-subtle lg:block" />
          )}
        </div>
      ))}
    </div>
  );
}
