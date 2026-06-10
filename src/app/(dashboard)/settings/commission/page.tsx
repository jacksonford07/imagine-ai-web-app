import { Info } from "lucide-react";
import { CommissionForm } from "@/components/settings/commission-form";
import { Card } from "@/components/ui/card";
import { LastSynced } from "@/components/widgets/last-synced";
import { PageHeader } from "@/components/widgets/page-header";
import { RefreshNow } from "@/components/widgets/refresh-now";
import { getCommissionConfig } from "@/lib/sources/bot/settings";

export const dynamic = "force-dynamic";

export default async function CommissionSettingsPage(): Promise<React.ReactElement> {
  const config = await getCommissionConfig();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commission"
        description="Sales Possible commission rate and eligibility rules used in profit math. Admins can edit; every change requires a reason."
        actions={
          <>
            <LastSynced at={config.data !== null ? config.fetchedAt : null} />
            <RefreshNow />
          </>
        }
      />

      {config.error !== null && (
        <Card className="flex items-start gap-3 border-primary/20 bg-primary/5 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium">Awaiting data wiring</p>
            <p className="mt-1 text-muted-foreground">
              The active commission config populates once the bot ships its
              commission-config endpoint. ({config.error})
            </p>
          </div>
        </Card>
      )}

      <CommissionForm config={config.data} />
    </div>
  );
}
