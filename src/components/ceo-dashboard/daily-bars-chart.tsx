"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";

export interface DailyBarSeries {
  key: string;
  label: string;
  chart: 1 | 2 | 3 | 4 | 5;
}

export type DailyBarPoint = Record<string, number | null | string> & {
  label: string;
};

const FILL: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "hsl(var(--chart-1))",
  2: "hsl(var(--chart-2))",
  3: "hsl(var(--chart-3))",
  4: "hsl(var(--chart-4))",
  5: "hsl(var(--chart-5))",
};

// Daily (cents) bar chart with one or two series — used for "Daily cash & spend"
// (Overview) and "Ad spend daily" (Marketing). Monochrome navy ramp; renders an
// awaiting state until a point carries data.
export function DailyBarsChart({
  title,
  data,
  series,
}: {
  title: string;
  data: DailyBarPoint[];
  series: DailyBarSeries[];
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
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--line)"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              stroke="var(--fg-muted)"
              minTickGap={16}
            />
            <YAxis
              tickFormatter={(v) =>
                `$${String(Math.round(Number(v) / 100000) / 10)}k`
              }
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={52}
              stroke="var(--fg-muted)"
            />
            <Tooltip
              cursor={{ fill: "var(--fill-hover)" }}
              formatter={(v, name) => [
                `$${(Number(v) / 100).toLocaleString("en-US")}`,
                String(name),
              ]}
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
              <Legend wrapperStyle={{ fontSize: 12 }} iconSize={10} />
            )}
            {series.map((s) => (
              <Bar
                key={s.key}
                name={s.label}
                dataKey={s.key}
                fill={FILL[s.chart]}
                radius={[3, 3, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[240px] items-center justify-center text-sm text-fg-muted">
          Awaiting daily series
        </div>
      )}
    </Card>
  );
}
