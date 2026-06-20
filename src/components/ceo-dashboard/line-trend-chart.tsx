"use client";

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

export type TrendUnit = "cents" | "ratio" | "percent";

export interface TrendSeries {
  /** Data key present on every point. */
  key: string;
  label: string;
  /** chart-1..5 ramp slot. */
  chart: 1 | 2 | 3 | 4 | 5;
}

export type TrendPoint = Record<string, number | null | string> & {
  label: string;
};

const STROKE: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "hsl(var(--chart-1))",
  2: "hsl(var(--chart-2))",
  3: "hsl(var(--chart-3))",
  4: "hsl(var(--chart-4))",
  5: "hsl(var(--chart-5))",
};

function tick(unit: TrendUnit, v: number): string {
  switch (unit) {
    case "cents":
      return `$${String(Math.round(v / 100000) / 10)}k`;
    case "ratio":
      return v.toFixed(2);
    case "percent":
      return `${String(Math.round(v * 1000) / 10)}%`;
  }
}

function full(unit: TrendUnit, v: number): string {
  switch (unit) {
    case "cents":
      return `$${(v / 100).toLocaleString("en-US")}`;
    case "ratio":
      return `${v.toFixed(2)}×`;
    case "percent":
      return `${(v * 100).toFixed(1)}%`;
  }
}

// Multi-month line chart for the Trends page. Single-accent navy ramp; renders
// an "awaiting history" state until at least one point carries data.
export function LineTrendChart({
  title,
  data,
  series,
  unit,
}: {
  title: string;
  data: TrendPoint[];
  series: TrendSeries[];
  unit: TrendUnit;
}): React.ReactElement {
  const hasData = data.some((point) =>
    series.some((s) => typeof point[s.key] === "number"),
  );

  return (
    <Card className="border-line bg-glass p-5">
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-fg-muted">
        {title}
      </p>
      {hasData ? (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 8 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--line)"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="var(--fg-muted)"
            />
            <YAxis
              tickFormatter={(v) => tick(unit, Number(v))}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={52}
              stroke="var(--fg-muted)"
            />
            <Tooltip
              cursor={{ stroke: "var(--line)" }}
              formatter={(v, name) => [full(unit, Number(v)), String(name)]}
              contentStyle={{
                background: "var(--surface-3)",
                border: "1px solid var(--glass-border)",
                borderRadius: "var(--radius)",
                color: "var(--fg-primary)",
                fontSize: 12,
              }}
              itemStyle={{ color: "var(--fg-primary)" }}
              labelStyle={{ color: "var(--fg-primary)" }}
            />
            {series.length > 1 && (
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                iconType="plainline"
                iconSize={12}
              />
            )}
            {series.map((s) => (
              <Line
                key={s.key}
                name={s.label}
                dataKey={s.key}
                type="monotone"
                dot={false}
                connectNulls
                stroke={STROKE[s.chart]}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[240px] items-center justify-center text-sm text-fg-muted">
          Awaiting monthly history
        </div>
      )}
    </Card>
  );
}
