import { MessageSquare, MoonStar, TriangleAlert, Users } from "lucide-react";
import {
  getOverview,
  listChats,
  listEscalations,
} from "@/lib/sources/bot/client";
import { PageHeader } from "@/components/widgets/page-header";
import { LastSynced } from "@/components/widgets/last-synced";
import { RefreshNow } from "@/components/widgets/refresh-now";
import { SourceError } from "@/components/widgets/source-error";
import { StatCard } from "@/components/widgets/stat-card";
import { HealthSummaryCard } from "@/components/fulfillment-home/health-summary-card";
import { RecentChats } from "@/components/fulfillment-home/recent-chats";
import { RecentEscalations } from "@/components/fulfillment-home/recent-escalations";

export const dynamic = "force-dynamic";

export default async function FulfillmentOverviewPage(): Promise<React.ReactElement> {
  const [overview, escalations, chats] = await Promise.all([
    getOverview(),
    listEscalations(),
    listChats({ limit: 12 }),
  ]);

  return (
    <div>
      <PageHeader
        title="Fulfillment"
        description="Bot operations at a glance — students, escalations, message volume."
        actions={
          <>
            <LastSynced
              at={overview.data !== null ? overview.fetchedAt : null}
            />
            <RefreshNow />
          </>
        }
      />

      {overview.error !== null || overview.data === null ? (
        <SourceError
          message={overview.error ?? "no data returned"}
          fetchedAt={overview.fetchedAt}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Active students"
            value={overview.data.activeStudents.toLocaleString()}
            hint="Messaged in the last 7 days"
            icon={Users}
          />
          <StatCard
            label="Quiet students"
            value={overview.data.quietStudents.toLocaleString()}
            hint="No messages in 7+ days"
            icon={MoonStar}
          />
          <StatCard
            label="Messages today"
            value={overview.data.messagesToday.toLocaleString()}
            hint={`${overview.data.messages7d.toLocaleString()} in 7d · ${overview.data.messages30d.toLocaleString()} in 30d`}
            icon={MessageSquare}
          />
          <StatCard
            label="Open escalations"
            value={overview.data.openEscalations.toLocaleString()}
            hint="Awaiting acknowledgement"
            icon={TriangleAlert}
          />
          <HealthSummaryCard health={overview.data.health} />
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <RecentEscalations result={escalations} />
        <RecentChats result={chats} />
      </div>
    </div>
  );
}
