import { getOverview } from "@/lib/sources/bot/client";
import { StatCard } from "@/components/widgets/stat-card";
import { SourceError } from "@/components/widgets/source-error";
import { PageHeader } from "@/components/widgets/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function OverviewPage(): Promise<React.ReactElement> {
  const { data, error, fetchedAt } = await getOverview();

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Activity and health across the bot, last 30 days."
        fetchedAt={fetchedAt}
      />

      {error !== null || data === null ? (
        <SourceError
          message={error ?? "no data returned"}
          fetchedAt={fetchedAt}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Active students"
              value={data.activeStudents}
              hint="messaged in last 7d"
            />
            <StatCard
              label="Quiet students"
              value={data.quietStudents}
              hint="silent 7d+"
            />
            <StatCard label="Open escalations" value={data.openEscalations} />
            <StatCard label="Messages today" value={data.messagesToday} />
            <StatCard label="Messages 7d" value={data.messages7d} />
            <StatCard label="Messages 30d" value={data.messages30d} />
          </div>

          <Card className="p-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              System health
            </p>
            <div className="flex flex-wrap gap-2">
              <HealthBadge
                label="Queue backlog"
                count={data.health.queueBacklog}
              />
              <HealthBadge
                label="Failed webhooks"
                count={data.health.failedWebhooks}
              />
              <HealthBadge
                label="Failed follow-ups"
                count={data.health.failedFollowUps}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function HealthBadge({
  label,
  count,
}: {
  label: string;
  count: number;
}): React.ReactElement {
  return (
    <Badge variant={count > 0 ? "warning" : "success"}>
      {label}: {count}
    </Badge>
  );
}
