import { listEscalations } from "@/lib/sources/bot/client";
import { PageHeader } from "@/components/widgets/page-header";
import { SourceError } from "@/components/widgets/source-error";
import { FilterBar } from "@/components/filters/filter-bar";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  single,
  asStatus,
  type RawSearchParams,
  type Status,
} from "@/lib/search-params";
import { formatDateTime, formatDuration } from "@/lib/format";

export const dynamic = "force-dynamic";

function statusVariant(status: Status): BadgeProps["variant"] {
  if (status === "open") return "warning";
  if (status === "acknowledged") return "secondary";
  return "success";
}

export default async function EscalationsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}): Promise<React.ReactElement> {
  const sp = await searchParams;

  const { data, error, fetchedAt } = await listEscalations({
    student: single(sp.student),
    coach: single(sp.coach),
    status: asStatus(sp.status),
    from: single(sp.from),
    to: single(sp.to),
  });

  return (
    <div>
      <PageHeader
        title="Escalations"
        description="Triggered escalations with acknowledge and resolve timings."
        fetchedAt={fetchedAt}
      />
      <FilterBar />

      {error !== null || data === null ? (
        <SourceError
          message={error ?? "no data returned"}
          fetchedAt={fetchedAt}
        />
      ) : data.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No escalations match these filters.
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Coach</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Time to ack</TableHead>
              <TableHead className="text-right">Time to resolve</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">
                  {e.studentName ?? e.studentExternalId}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {e.coach ?? "—"}
                </TableCell>
                <TableCell>
                  <span className="text-foreground">{e.triggeredBy}</span>
                  {e.triggerDetail !== null && (
                    <span className="block text-xs text-muted-foreground">
                      {e.triggerDetail}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(e.status)}>{e.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(e.createdAt)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatDuration(e.timeToAckSeconds)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatDuration(e.timeToResolveSeconds)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
