import Link from "next/link";
import { listChats } from "@/lib/sources/bot/client";
import { PageHeader } from "@/components/widgets/page-header";
import { SourceError } from "@/components/widgets/source-error";
import { FilterBar } from "@/components/filters/filter-bar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { single, asStatus, type RawSearchParams } from "@/lib/search-params";
import { formatRelative } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ChatsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}): Promise<React.ReactElement> {
  const sp = await searchParams;

  const { data, error, fetchedAt } = await listChats({
    student: single(sp.student),
    coach: single(sp.coach),
    status: asStatus(sp.status),
    from: single(sp.from),
    to: single(sp.to),
    cursor: single(sp.cursor),
  });

  const baseParams = new URLSearchParams();
  for (const key of ["student", "coach", "status", "from", "to"] as const) {
    const v = single(sp[key]);
    if (v !== undefined && v !== "") baseParams.set(key, v);
  }
  const nextHref =
    data?.nextCursor != null
      ? `/chats?${new URLSearchParams({ ...Object.fromEntries(baseParams), cursor: data.nextCursor }).toString()}`
      : null;

  return (
    <div>
      <PageHeader
        title="Chats"
        description="Student conversations. Filter, then open a thread."
        fetchedAt={fetchedAt}
      />
      <FilterBar />

      {error !== null || data === null ? (
        <SourceError
          message={error ?? "no data returned"}
          fetchedAt={fetchedAt}
        />
      ) : data.threads.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No conversations match these filters.
        </Card>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Coach</TableHead>
                <TableHead>Last activity</TableHead>
                <TableHead className="text-right">In / Out</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.threads.map((t) => (
                <TableRow key={t.studentExternalId}>
                  <TableCell>
                    <Link
                      href={`/chats/${encodeURIComponent(t.studentExternalId)}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {t.studentName ?? t.studentExternalId}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.coach ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatRelative(t.lastMessageAt)}{" "}
                    <span className="text-xs">({t.lastDirection})</span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {t.inCount} / {t.outCount}
                  </TableCell>
                  <TableCell>
                    {t.openEscalation ? (
                      <Badge variant="warning">escalation</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {nextHref !== null && (
            <div className="mt-4 flex justify-center">
              <Link
                href={nextHref}
                className="rounded-md border px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                Load more
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
