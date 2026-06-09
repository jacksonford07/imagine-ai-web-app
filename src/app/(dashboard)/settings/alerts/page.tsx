import { Info } from "lucide-react";
import { AlertThresholdsForm } from "@/components/settings/alert-thresholds-form";
import { WatchlistPanel } from "@/components/settings/watchlist-panel";
import { Card } from "@/components/ui/card";
import { LastSynced } from "@/components/widgets/last-synced";
import { PageHeader } from "@/components/widgets/page-header";
import { RefreshNow } from "@/components/widgets/refresh-now";
import { getAlertConfig, getWatchlist } from "@/lib/sources/bot/settings";

export const dynamic = "force-dynamic";

export default async function AlertsSettingsPage(): Promise<React.ReactElement> {
  const [config, watchlist] = await Promise.all([
    getAlertConfig(),
    getWatchlist(),
  ]);
  const error = config.error ?? watchlist.error;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        description="Thresholds and Slack routing for KPI and sync-failure alerts. Admins can edit; changes are audit-logged."
        actions={
          <>
            <LastSynced at={config.data !== null ? config.fetchedAt : null} />
            <RefreshNow />
          </>
        }
      />

      {error !== null && (
        <Card className="flex items-start gap-3 border-primary/20 bg-primary/5 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium">Awaiting data wiring</p>
            <p className="mt-1 text-muted-foreground">
              Alert config and watchlist populate once the bot ships its
              settings endpoints. Saved values will appear here. ({error})
            </p>
          </div>
        </Card>
      )}

      <AlertThresholdsForm config={config.data} />
      <WatchlistPanel items={watchlist.data ?? []} />
    </div>
  );
}
