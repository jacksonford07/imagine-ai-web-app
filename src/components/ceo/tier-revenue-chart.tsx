"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";

export interface TierBar {
  label: string;
  netCents: number;
  chart: 1 | 2 | 3 | 4 | 5;
}

const CHART_VAR: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "hsl(var(--chart-1))",
  2: "hsl(var(--chart-2))",
  3: "hsl(var(--chart-3))",
  4: "hsl(var(--chart-4))",
  5: "hsl(var(--chart-5))",
};

export function TierRevenueChart({
  data,
}: {
  data: TierBar[];
}): React.ReactElement {
  const hasData = data.some((d) => d.netCents > 0);
  return (
    <Card className="p-5">
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Net revenue by tier
      </p>
      {hasData ? (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tickFormatter={(v) =>
                `$${String(Math.round(Number(v) / 100000) / 10)}k`
              }
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={48}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
              formatter={(v) => [
                `$${(Number(v) / 100).toLocaleString()}`,
                "Net",
              ]}
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                color: "hsl(var(--popover-foreground))",
                fontSize: 12,
              }}
            />
            <Bar dataKey="netCents" radius={[4, 4, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.label} fill={CHART_VAR[d.chart]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
          No revenue data yet
        </div>
      )}
    </Card>
  );
}
