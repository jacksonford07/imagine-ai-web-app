import { getHealth } from "@/lib/sources/bot/client";
import { PageHeader } from "@/components/widgets/page-header";
import { LastSynced } from "@/components/widgets/last-synced";
import { RefreshNow } from "@/components/widgets/refresh-now";
import { SourceError } from "@/components/widgets/source-error";
import { StatCard } from "@/components/widgets/stat-card";
import { Card } from "@/components/ui/card";
import { formatDateTime, formatRelative } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HealthPage(): Promise<React.ReactElement> {
  const { data, error, fetchedAt } = await getHealth();

  return (
    <div>
      <PageHeader
        title="Health"
        description="Queue, webhook, follow-up and theme health (DB-derived)."
        actions={
          <>
            <LastSynced at={data !== null ? fetchedAt : null} />
            <RefreshNow />
          </>
        }
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
              label="Queue pending"
              value={data.queue.pending}
              hint={
                data.queue.oldestPendingAt !== null
                  ? `oldest ${formatRelative(data.queue.oldestPendingAt)}`
                  : undefined
              }
            />
            <StatCard
              label="Failed webhooks"
              value={data.webhooks.failedCount}
            />
            <StatCard
              label="Failed follow-ups"
              value={data.followUps.failedCount}
            />
            <StatCard label="Stuck themes" value={data.stuckThemes} />
          </div>

          <Card className="p-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Recent queue errors
            </p>
            {data.queue.recentErrors.length === 0 ? (
              <p className="text-sm text-muted-foreground">None.</p>
            ) : (
              <div className="space-y-2">
                {data.queue.recentErrors.map((err, i) => (
                  <div key={`${err.at}-${String(i)}`} className="text-sm">
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(err.at)}
                    </span>
                    <p className="text-foreground">{err.error}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Webhooks by outcome
              </p>
              {Object.keys(data.webhooks.byOutcome).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No failures recorded.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {Object.entries(data.webhooks.byOutcome).map(
                    ([outcome, count]) => (
                      <div
                        key={outcome}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground">{outcome}</span>
                        <span className="tabular-nums">{count}</span>
                      </div>
                    ),
                  )}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Recent follow-up failures
              </p>
              {data.followUps.recentFailures.length === 0 ? (
                <p className="text-sm text-muted-foreground">None.</p>
              ) : (
                <div className="space-y-2">
                  {data.followUps.recentFailures.map((f, i) => (
                    <div key={`${f.at}-${String(i)}`} className="text-sm">
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(f.at)}
                      </span>
                      <p className="text-foreground">
                        {f.reason ?? "unknown reason"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
