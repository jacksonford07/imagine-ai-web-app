import Link from "next/link";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceError } from "@/components/widgets/source-error";
import { formatRelative } from "@/lib/format";
import type { SourceResult } from "@/lib/sources/contract";
import type { EscalationRow } from "@/lib/sources/bot/schema";

const MAX_ROWS = 6;

function statusVariant(status: EscalationRow["status"]): BadgeProps["variant"] {
  if (status === "open") return "warning";
  if (status === "acknowledged") return "secondary";
  return "success";
}

export function RecentEscalations({
  result,
}: {
  result: SourceResult<EscalationRow[]>;
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

  const recent = [...data]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, MAX_ROWS);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Recent escalations
        </CardTitle>
        <Link
          href="/fulfillment/escalations"
          className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="pt-0">
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No escalations yet.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {recent.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/fulfillment/chats/${encodeURIComponent(e.studentExternalId)}`}
                    className="block truncate text-sm font-medium text-foreground hover:underline"
                  >
                    {e.studentName ?? e.studentExternalId}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {e.triggeredBy}
                    {e.coach !== null ? ` · ${e.coach}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={statusVariant(e.status)}>{e.status}</Badge>
                  <span className="w-16 text-right text-xs tabular-nums text-muted-foreground">
                    {formatRelative(e.createdAt)}
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
