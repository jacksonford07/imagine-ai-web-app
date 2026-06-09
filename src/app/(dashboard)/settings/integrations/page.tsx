import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ConnectorCard } from "@/components/settings-integrations/connector-card";
import { CONNECTORS } from "@/components/settings-integrations/connector-meta";
import { LastSynced } from "@/components/widgets/last-synced";
import { PageHeader } from "@/components/widgets/page-header";
import { RefreshNow } from "@/components/widgets/refresh-now";
import { getSyncStatus } from "@/lib/sources/bot/integrations";
import type { ConnectorStatus } from "@/lib/sources/bot/integrations";

export const dynamic = "force-dynamic";

export default async function IntegrationsSettingsPage(): Promise<React.ReactElement> {
  const { data, error, fetchedAt } = await getSyncStatus();
  const byName = new Map<string, ConnectorStatus>(
    (data?.connectors ?? []).map((c) => [c.name, c]),
  );
  const latestSync = (data?.connectors ?? [])
    .map((c) => c.lastSyncedAt)
    .filter((at): at is string => at !== null && at !== undefined)
    .sort()
    .at(-1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Per-connector sync status, record counts, backfill progress, and manual refresh."
        actions={
          <>
            <LastSynced at={latestSync ?? null} />
            <RefreshNow tick="all" />
          </>
        }
      />

      {error !== null && (
        <Card className="flex items-start gap-3 border-primary/20 bg-primary/5 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium">Awaiting sync-status endpoint</p>
            <p className="mt-1 text-muted-foreground">
              The handover checklist below lists every connector and the env var
              names it needs; live state, record counts, and backfill progress
              appear once the bot endpoint is wired. ({error}, checked{" "}
              {new Date(fetchedAt).toLocaleTimeString()})
            </p>
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {CONNECTORS.map((meta) => (
          <ConnectorCard
            key={meta.name}
            meta={meta}
            status={byName.get(meta.name) ?? null}
          />
        ))}
      </div>
    </div>
  );
}
