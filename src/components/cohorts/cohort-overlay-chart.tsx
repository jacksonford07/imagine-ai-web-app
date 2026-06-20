"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import type { CohortDisplayRow, CohortMetric } from "./types";

const MAX_COHORT_LINES = 8;

// Monochrome navy ramp — the chart-1..5 vars are already a single-accent scale.
const STROKES = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

type ChartPoint = Record<string, number | null> & { week: number };

export function CohortOverlayChart({
  rows,
  metric,
  selectedKey,
}: {
  rows: CohortDisplayRow[];
  metric: CohortMetric;
  selectedKey: string | null;
}): React.ReactElement {
  // Most recent cohorts only, so the overlay stays readable.
  const shown = useMemo(
    () =>
      [...rows]
        .sort((a, b) => (a.key < b.key ? 1 : -1))
        .slice(0, MAX_COHORT_LINES),
    [rows],
  );

  const data = useMemo<ChartPoint[]>(() => {
    const maxWeek = shown.reduce(
      (m, r) => Math.max(m, ...r.cells.map((c) => c.week + 1)),
      0,
    );
    return Array.from({ length: maxWeek }, (_, week) => {
      const point: ChartPoint = { week };
      for (const row of shown) {
        const cell = row.cells.find((c) => c.week === week);
        point[row.key] =
          metric === "revenue"
            ? (cell?.cumulativeRevenueCents ?? null)
            : cell?.ascensionRate !== null && cell?.ascensionRate !== undefined
              ? cell.ascensionRate * 100
              : null;
      }
      return point;
    });
  }, [shown, metric]);

  const hasData = data.length > 0 && shown.length > 0;
  const hiddenCount = rows.length - shown.length;

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Cohort overlay —{" "}
          {metric === "revenue" ? "cumulative revenue" : "ascension %"}
        </p>
        {hiddenCount > 0 && (
          <span className="text-xs text-muted-foreground">
            latest {shown.length} of {rows.length} cohorts
          </span>
        )}
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={data}
            margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="week"
              tickFormatter={(v) => `W${String(v)}`}
              tickLine={false}
              axisLine={false}
              fontSize={11}
              interval="preserveStartEnd"
              minTickGap={20}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tickFormatter={(v) =>
                metric === "revenue"
                  ? `$${String(Math.round(Number(v) / 100000) / 10)}k`
                  : `${String(v)}%`
              }
              tickLine={false}
              axisLine={false}
              fontSize={11}
              width={48}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip
              labelFormatter={(v) => `Week ${String(v)} since acquisition`}
              formatter={(v, name) => [
                metric === "revenue"
                  ? `$${(Number(v) / 100).toLocaleString()}`
                  : `${Number(v).toFixed(1)}%`,
                String(name),
              ]}
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                color: "hsl(var(--popover-foreground))",
                fontSize: 12,
              }}
              itemStyle={{ color: "hsl(var(--popover-foreground))" }}
              labelStyle={{ color: "hsl(var(--popover-foreground))" }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="plainline"
              iconSize={10}
            />
            {shown.map((row, i) => (
              <Line
                key={row.key}
                name={row.label}
                dataKey={row.key}
                type="monotone"
                dot={false}
                connectNulls
                stroke={STROKES[i % STROKES.length]}
                strokeWidth={selectedKey === row.key ? 2.5 : 1.5}
                strokeOpacity={
                  selectedKey === null || selectedKey === row.key ? 1 : 0.3
                }
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
          No cohort history yet for this window.
        </div>
      )}
    </Card>
  );
}
