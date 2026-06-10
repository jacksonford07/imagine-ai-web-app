import { Info } from "lucide-react";
import { listCeoTransactions } from "@/lib/sources/bot/transactions";
import { PageHeader } from "@/components/widgets/page-header";
import { WindowFilter } from "@/components/widgets/window-filter";
import { LastSynced } from "@/components/widgets/last-synced";
import { RefreshNow } from "@/components/widgets/refresh-now";
import { Card } from "@/components/ui/card";
import { TransactionsFilterBar } from "@/components/transactions/transactions-filter-bar";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { single, type RawSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}): Promise<React.ReactElement> {
  const sp = await searchParams;

  const { data, error, fetchedAt } = await listCeoTransactions({
    source: single(sp.source),
    tier: single(sp.tier),
    status: single(sp.status),
    affiliate: single(sp.affiliate),
    from: single(sp.from),
    to: single(sp.to),
    cursor: single(sp.cursor),
    limit: PAGE_SIZE,
  });

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="Every ingested transaction with fees, adjustments, and overrides — click a row to audit it."
        actions={
          <>
            <WindowFilter />
            <LastSynced at={data !== null ? fetchedAt : null} />
            <RefreshNow tick="all" />
          </>
        }
      />
      <TransactionsFilterBar />

      {error !== null || data === null ? (
        <Card className="flex items-start gap-3 border-primary/20 bg-primary/5 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium">Awaiting data wiring</p>
            <p className="mt-1 text-muted-foreground">
              The transactions explorer is live; rows populate once the bot
              ships the CEO transactions endpoint. ({error ?? "no data"})
            </p>
          </div>
        </Card>
      ) : data.rows.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No transactions match these filters.
        </Card>
      ) : (
        <TransactionsTable
          rows={data.rows}
          nextCursor={data.nextCursor ?? null}
        />
      )}
    </div>
  );
}
