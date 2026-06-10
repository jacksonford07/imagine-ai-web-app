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

export interface MoneyBar {
  label: string;
  cents: number | null;
  /** Monochrome accent ramp slot (chart-1..5) — single-accent discipline. */
  chart: 1 | 2 | 3 | 4 | 5;
}

const CHART_VAR: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "hsl(var(--chart-1))",
  2: "hsl(var(--chart-2))",
  3: "hsl(var(--chart-3))",
  4: "hsl(var(--chart-4))",
  5: "hsl(var(--chart-5))",
};

// Evolution of the old tier-revenue-chart: window totals for the money
// metrics the KPI endpoint supports (gross, collected, FE/BE revenue, spend,
// profit), rendered on the navy monochrome ramp.
export function MoneyMixChart({
  title,
  data,
}: {
  title: string;
  data: MoneyBar[];
}): React.ReactElement {
  const present = data.filter((d) => d.cents !== null);
  const hasData = present.some((d) => d.cents !== 0);

  return (
    <Card className="border-line bg-glass p-5">
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-fg-muted">
        {title}
      </p>
      {hasData ? (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={present}
            margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
          >
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
              formatter={(v) => [
                `$${(Number(v) / 100).toLocaleString("en-US")}`,
                "",
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
            <Bar dataKey="cents" radius={[4, 4, 0, 0]}>
              {present.map((d) => (
                <Cell key={d.label} fill={CHART_VAR[d.chart]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[240px] items-center justify-center text-sm text-fg-muted">
          Awaiting revenue data for this window
        </div>
      )}
    </Card>
  );
}
