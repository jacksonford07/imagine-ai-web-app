import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCents, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AuditPack } from "@/lib/sources/bot/reports";

function Section({
  title,
  description,
  count,
  emptyText,
  children,
}: {
  title: string;
  description: string;
  count: number;
  emptyText: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          {title}
          <span className="rounded-full border border-line bg-fill-hover px-2 py-0.5 text-xs font-normal tabular-nums text-muted-foreground">
            {count}
          </span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {count > 0 ? (
        <div className="px-6 pb-6">{children}</div>
      ) : (
        <p className="px-6 pb-6 text-sm text-muted-foreground">{emptyText}</p>
      )}
    </Card>
  );
}

export function AuditPackReport({
  data,
}: {
  data: AuditPack;
}): React.ReactElement {
  const overrides = data.overrides ?? [];
  const watchlist = data.watchlist ?? [];
  const unmatched = data.unmatched ?? [];
  const reconciliation = data.reconciliation ?? [];

  return (
    <div className="space-y-6">
      <Section
        title="Manual overrides"
        description="Every override applied to reported figures this month."
        count={overrides.length}
        emptyText="No overrides were applied this month."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Target</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Author</TableHead>
              <TableHead className="text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overrides.map((entry, i) => (
              <TableRow key={i}>
                <TableCell>{entry.target ?? "—"}</TableCell>
                <TableCell className="tabular-nums">
                  {entry.value ?? "—"}
                </TableCell>
                <TableCell className="max-w-xs text-muted-foreground">
                  {entry.reason ?? "—"}
                </TableCell>
                <TableCell>{entry.author ?? "—"}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDateTime(entry.createdAt ?? null)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      <Section
        title="Watchlist items"
        description="Alerts opened or resolved during the month."
        count={watchlist.length}
        emptyText="Watchlist was clear all month."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead className="text-right">Resolved</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {watchlist.map((item, i) => (
              <TableRow key={item.id ?? i}>
                <TableCell>{item.title ?? item.label ?? "Untitled"}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      item.status === "open"
                        ? "text-warning"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.status ?? "unknown"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(item.openedAt ?? null)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDateTime(item.resolvedAt ?? null)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      <Section
        title="Unmatched records"
        description="Products and customers that could not be matched to a known entity."
        count={unmatched.length}
        emptyText="Every product and customer matched this month."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kind</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unmatched.map((entry, i) => (
              <TableRow key={i}>
                <TableCell className="capitalize">
                  {entry.kind ?? "—"}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {entry.reference ?? "—"}
                </TableCell>
                <TableCell>{entry.source ?? "—"}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDateTime(entry.occurredAt ?? null)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      <Section
        title="Reconciliation deltas"
        description="Per-source difference between expected and observed totals."
        count={reconciliation.length}
        emptyText="All sources reconciled cleanly this month."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Expected</TableHead>
              <TableHead className="text-right">Actual</TableHead>
              <TableHead className="text-right">Delta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reconciliation.map((row, i) => {
              const delta = row.deltaCents ?? null;
              return (
                <TableRow key={i}>
                  <TableCell>{row.source ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatCents(row.expectedCents ?? null)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatCents(row.actualCents ?? null)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums",
                      delta !== null && delta !== 0
                        ? "text-warning"
                        : "text-muted-foreground",
                    )}
                  >
                    {formatCents(delta)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Section>
    </div>
  );
}
