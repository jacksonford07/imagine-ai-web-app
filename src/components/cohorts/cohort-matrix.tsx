"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCents, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CohortDisplayRow, CohortMetric } from "./types";

const WEEK_COL_PREFIX = "w";

function cellMetricValue(
  row: CohortDisplayRow,
  week: number,
  metric: CohortMetric,
): number | null {
  const cell = row.cells.find((c) => c.week === week);
  if (cell === undefined) return null;
  return metric === "revenue"
    ? cell.cumulativeRevenueCents
    : cell.ascensionRate;
}

export function CohortMatrix({
  rows,
  metric,
  selectedKey,
  onSelect,
}: {
  rows: CohortDisplayRow[];
  metric: CohortMetric;
  selectedKey: string | null;
  onSelect: (key: string) => void;
}): React.ReactElement {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "cohort", desc: true },
  ]);

  const weekCount = useMemo(
    () =>
      rows.reduce((m, r) => Math.max(m, ...r.cells.map((c) => c.week + 1)), 0),
    [rows],
  );

  // Heat shading normaliser: revenue scales against the dataset max,
  // ascension is already a 0–1 fraction.
  const maxRevenue = useMemo(
    () =>
      rows.reduce(
        (m, r) =>
          Math.max(m, ...r.cells.map((c) => c.cumulativeRevenueCents ?? 0)),
        0,
      ),
    [rows],
  );

  const columns = useMemo<ColumnDef<CohortDisplayRow>[]>(() => {
    const fixed: ColumnDef<CohortDisplayRow>[] = [
      {
        id: "cohort",
        header: "Cohort",
        accessorFn: (r) => r.key,
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-medium">
            {row.original.label}
          </span>
        ),
      },
      {
        id: "size",
        header: "Size",
        accessorFn: (r) => r.size ?? -1,
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {row.original.size === null
              ? "—"
              : row.original.size.toLocaleString()}
          </span>
        ),
      },
    ];
    const weeks: ColumnDef<CohortDisplayRow>[] = Array.from(
      { length: weekCount },
      (_, week) => ({
        id: `${WEEK_COL_PREFIX}${String(week)}`,
        header: `W${String(week)}`,
        enableSorting: false,
        accessorFn: (r) => cellMetricValue(r, week, metric),
        cell: ({ row }) => {
          const value = cellMetricValue(row.original, week, metric);
          return (
            <span className="tabular-nums">
              {metric === "revenue" ? formatCents(value) : formatPercent(value)}
            </span>
          );
        },
      }),
    );
    return [...fixed, ...weeks];
  }, [weekCount, metric]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const heatStyle = (
    columnId: string,
    row: CohortDisplayRow,
  ): React.CSSProperties | undefined => {
    if (!columnId.startsWith(WEEK_COL_PREFIX)) return undefined;
    const week = Number(columnId.slice(WEEK_COL_PREFIX.length));
    const value = cellMetricValue(row, week, metric);
    if (value === null) return undefined;
    const fraction =
      metric === "revenue"
        ? maxRevenue > 0
          ? value / maxRevenue
          : 0
        : Math.min(Math.max(value, 0), 1);
    const alpha = 0.04 + fraction * 0.4;
    return { backgroundColor: `hsl(var(--brand) / ${alpha.toFixed(3)})` };
  };

  if (rows.length === 0) {
    return (
      <Card className="flex h-[160px] items-center justify-center p-5 text-sm text-muted-foreground">
        No cohort data yet for this window.
      </Card>
    );
  }

  return (
    <Card className="overflow-x-auto p-2">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sortable = header.column.getCanSort();
                const dir = header.column.getIsSorted();
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "whitespace-nowrap",
                      header.column.id.startsWith(WEEK_COL_PREFIX) &&
                        "text-right",
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-foreground"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {dir === "asc" && <ChevronUp className="h-3 w-3" />}
                        {dir === "desc" && <ChevronDown className="h-3 w-3" />}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              onClick={() => {
                onSelect(row.original.key);
              }}
              aria-selected={selectedKey === row.original.key}
              className={cn(
                "cursor-pointer",
                selectedKey === row.original.key && "bg-fill-active",
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  style={heatStyle(cell.column.id, row.original)}
                  className={cn(
                    "whitespace-nowrap",
                    cell.column.id.startsWith(WEEK_COL_PREFIX) && "text-right",
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
