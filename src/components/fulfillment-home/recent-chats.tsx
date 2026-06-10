import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceError } from "@/components/widgets/source-error";
import { formatRelative } from "@/lib/format";
import type { SourceResult } from "@/lib/sources/contract";
import type { ChatThreadPage } from "@/lib/sources/bot/schema";

const MAX_ROWS = 6;

export function RecentChats({
  result,
}: {
  result: SourceResult<ChatThreadPage>;
}): React.ReactElement {
  const { data, error, fetchedAt } = result;

  if (error !== null || data === null) {
    return (
      <SourceError
        message={error ?? "no data returned"}
        fetchedAt={fetchedAt}
      />
    );
  }

  const recent = data.threads.slice(0, MAX_ROWS);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Recent chats
        </CardTitle>
        <Link
          href="/fulfillment/chats"
          className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="pt-0">
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No conversations yet.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {recent.map((t) => (
              <li
                key={t.studentExternalId}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/fulfillment/chats/${encodeURIComponent(t.studentExternalId)}`}
                    className="block truncate text-sm font-medium text-foreground hover:underline"
                  >
                    {t.studentName ?? t.studentExternalId}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.coach ?? "Unassigned"} · {t.inCount} in / {t.outCount}{" "}
                    out
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {t.openEscalation && (
                    <Badge variant="warning">escalation</Badge>
                  )}
                  <span className="w-16 text-right text-xs tabular-nums text-muted-foreground">
                    {formatRelative(t.lastMessageAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
