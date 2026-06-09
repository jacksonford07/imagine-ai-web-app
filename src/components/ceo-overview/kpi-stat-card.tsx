import Link from "next/link";
import { PenLine } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MetricValue } from "@/lib/sources/bot/kpis";
import { formatMetric, type MetricKind } from "./metric-format";

// StatCard sized for the dense four-group KPI sheet. Null values render "—"
// (plus an "awaiting integration" hint when the group has never synced);
// overridden values get a brand indicator linking to the transactions
// drill-down (US-029).
export function KpiStatCard({
  label,
  kind,
  metric,
  hint,
  neverSynced,
  overrideHref,
}: {
  label: string;
  kind: MetricKind;
  metric: MetricValue;
  hint?: string;
  /** True when the group's sources have never synced — drives the null hint. */
  neverSynced: boolean;
  /** Transactions drill-down link used when the value is overridden. */
  overrideHref: string;
}): React.ReactElement {
  const awaiting = metric.value === null && neverSynced;
  const subline = awaiting ? "awaiting integration" : hint;

  return (
    <Card className="border-line bg-glass p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-fg-muted">
          {label}
        </p>
        {metric.overridden && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={overrideHref}
                aria-label={`${label} is overridden — open transactions drill-down`}
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand-soft transition-colors duration-confirm hover:bg-brand/25"
              >
                <PenLine className="h-3 w-3" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top">
              Overridden
              {metric.author !== null ? ` by ${metric.author}` : ""}
              {metric.reason !== null ? ` — ${metric.reason}` : ""}. Click to
              trace in transactions.
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-fg-primary">
        {formatMetric(kind, metric.value)}
      </p>
      {subline !== undefined && (
        <p className="mt-1 text-xs text-fg-subtle">{subline}</p>
      )}
    </Card>
  );
}
