import { CheckCircle2, Info } from "lucide-react";
import { getReviewQueue } from "@/lib/sources/bot/review-queue";
import { PageHeader } from "@/components/widgets/page-header";
import { LastSynced } from "@/components/widgets/last-synced";
import { RefreshNow } from "@/components/widgets/refresh-now";
import { Card } from "@/components/ui/card";
import { ReviewItemCard } from "@/components/review-queue/review-item-card";

export const dynamic = "force-dynamic";

export default async function ReviewQueuePage(): Promise<React.ReactElement> {
  const { data, error, fetchedAt } = await getReviewQueue();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Queue"
        description={
          data !== null
            ? `${String(data.count)} unmatched cross-platform customer${data.count === 1 ? "" : "s"} awaiting a merge / keep-separate decision.`
            : "Unmatched cross-platform customers awaiting a merge / keep-separate decision."
        }
        actions={
          <>
            <LastSynced at={data !== null ? fetchedAt : null} />
            <RefreshNow />
          </>
        }
      />

      {error !== null && (
        <Card className="flex items-start gap-3 border-primary/20 bg-primary/5 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium">Awaiting data</p>
            <p className="mt-1 text-muted-foreground">
              The queue populates once the bot&apos;s customer-matching pipeline
              is reachable. ({error})
            </p>
          </div>
        </Card>
      )}

      {data !== null && data.items.length === 0 && (
        <Card className="flex items-start gap-3 border-line bg-glass p-5">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div className="text-sm">
            <p className="font-medium text-fg-primary">Queue clear</p>
            <p className="mt-1 text-fg-muted">
              Every cross-platform customer is matched — nothing is being
              silently dropped or double-counted.
            </p>
          </div>
        </Card>
      )}

      {data !== null &&
        data.items.map((item) => <ReviewItemCard key={item.id} item={item} />)}
    </div>
  );
}
