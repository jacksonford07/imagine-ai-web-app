"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCents, formatDateTime } from "@/lib/format";
import { getTier, type TierKey } from "@/lib/ceo/taxonomy";
import { TransactionDrawer } from "./transaction-drawer";
import type { TransactionRow } from "./types";

// TanStack table over the keyset-paginated transactions endpoint. Filtering
// and pagination are server-driven (URL params -> server component re-fetch);
// the table renders the current page and opens the audit drawer on row click.

const TIER_KEYS: readonly string[] = ["LTO", "MTO", "HTO", "PTO", "OTHER"];

function tierLabel(tier: string | null | undefined): string {
  if (tier == null || tier === "") return "—";
  if (TIER_KEYS.includes(tier)) return getTier(tier as TierKey).short;
  return tier;
}

const columnHelper = createColumnHelper<TransactionRow>();

const columns = [
  columnHelper.accessor("occurredAt", {
    header: "Date",
    cell: (info) => (
      <span className="whitespace-nowrap text-fg-secondary">
        {formatDateTime(info.getValue() ?? null)}
      </span>
    ),
  }),
  columnHelper.accessor(
    (row) => row.customerName ?? row.entity ?? row.customerEmail ?? null,
    {
      id: "customer",
      header: "Customer",
      cell: (info) => {
        const value = info.getValue();
        return value !== null ? (
          <span className="text-fg-primary">{value}</span>
        ) : (
          <span className="text-fg-subtle">—</span>
        );
      },
    },
  ),
  columnHelper.accessor("source", {
    header: "Source",
    cell: (info) => (
      <span className="capitalize text-fg-secondary">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),
  columnHelper.accessor("tier", {
    header: "Tier",
    cell: (info) => (
      <Badge variant="outline">{tierLabel(info.getValue())}</Badge>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <span className="capitalize text-fg-secondary">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),
  columnHelper.accessor("affiliate", {
    header: "Affiliate",
    cell: (info) =>
      info.getValue() === true ? (
        <Badge variant="secondary">Affiliate</Badge>
      ) : (
        <span className="text-fg-subtle">—</span>
      ),
  }),
  columnHelper.accessor("grossCents", {
    header: () => <span className="block text-right">Gross</span>,
    cell: (info) => (
      <span className="block text-right tabular-nums text-fg-primary">
        {formatCents(info.getValue() ?? null)}
      </span>
    ),
  }),
  columnHelper.accessor("processorFeeCents", {
    header: () => <span className="block text-right">Processor fee</span>,
    cell: (info) => (
      <span className="block text-right tabular-nums text-fg-muted">
        {formatCents(info.getValue() ?? null)}
      </span>
    ),
  }),
  columnHelper.accessor("financingFeeCents", {
    header: () => <span className="block text-right">Financing fee</span>,
    cell: (info) => (
      <span className="block text-right tabular-nums text-fg-muted">
        {formatCents(info.getValue() ?? null)}
      </span>
    ),
  }),
  columnHelper.accessor("netCents", {
    header: () => <span className="block text-right">Net</span>,
    cell: (info) => (
      <span className="block text-right font-medium tabular-nums text-fg-primary">
        {formatCents(info.getValue() ?? null)}
      </span>
    ),
  }),
  columnHelper.display({
    id: "audit",
    header: () => <span className="block text-right">Audit</span>,
    cell: ({ row }) => {
      const adjustments = row.original.adjustments ?? [];
      const overrides = row.original.appliedOverrides ?? [];
      if (adjustments.length === 0 && overrides.length === 0) {
        return <span className="block text-right text-fg-subtle">—</span>;
      }
      return (
        <span className="flex items-center justify-end gap-1.5">
          {adjustments.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <SlidersHorizontal className="h-3 w-3" />
              {adjustments.length}
            </Badge>
          )}
          {overrides.length > 0 && (
            <Badge className="border-transparent bg-brand/15 text-brand">
              overridden
            </Badge>
          )}
        </span>
      );
    },
  }),
];

export function TransactionsTable({
  rows,
  nextCursor,
}: {
  rows: TransactionRow[];
  nextCursor: string | null;
}): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();
  const [selected, setSelected] = React.useState<TransactionRow | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  const currentCursor = searchParams.get("cursor");

  const setCursor = (cursor: string | null): void => {
    const params = new URLSearchParams(searchParams.toString());
    if (cursor === null) {
      params.delete("cursor");
    } else {
      params.set("cursor", cursor);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const openRow = (row: TransactionRow): void => {
    setSelected(row);
    setDrawerOpen(true);
  };

  return (
    <div data-pending={isPending ? "" : undefined}>
      <div className="overflow-x-auto rounded-lg border border-line bg-glass">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => {
                  openRow(row.original);
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-fg-muted">
          {rows.length} transaction{rows.length === 1 ? "" : "s"} on this page —
          click a row for the audit trail
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            disabled={currentCursor === null || isPending}
            onClick={() => {
              setCursor(null);
            }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            First page
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            disabled={nextCursor === null || isPending}
            onClick={() => {
              setCursor(nextCursor);
            }}
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <TransactionDrawer
        row={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
