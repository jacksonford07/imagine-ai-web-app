import Link from "next/link";
import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Overview } from "@/lib/sources/bot/schema";

function HealthRow({
  label,
  value,
}: {
  label: string;
  value: number;
}): React.ReactElement {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          value > 0 ? "text-warning" : "text-muted-foreground",
        )}
      >
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export function HealthSummaryCard({
  health,
}: {
  health: Overview["health"];
}): React.ReactElement {
  const issueCount =
    health.queueBacklog + health.failedWebhooks + health.failedFollowUps;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          System health
        </p>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </div>
      <p
        className={cn(
          "mt-2 text-3xl font-semibold tabular-nums tracking-tight",
          issueCount > 0 && "text-warning",
        )}
      >
        {issueCount === 0 ? "OK" : issueCount.toLocaleString()}
      </p>
      <div className="mt-2 divide-y divide-border/60">
        <HealthRow label="Queue backlog" value={health.queueBacklog} />
        <HealthRow label="Failed webhooks" value={health.failedWebhooks} />
        <HealthRow label="Failed follow-ups" value={health.failedFollowUps} />
      </div>
      <Link
        href="/fulfillment/health"
        className="mt-2 inline-block text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
      >
        View health details
      </Link>
    </Card>
  );
}
