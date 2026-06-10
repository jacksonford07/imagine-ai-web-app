"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";

export interface RateBar {
  label: string;
  /** 0–1 fraction or null when its source hasn't synced. */
  fraction: number | null;
}

// Conversion-quality companion to the money chart: bump/OTO take rates, FE
// conversion, and ascension on one percentage axis.
export function RatesChart({
  title,
  data,
}: {
  title: string;
  data: RateBar[];
}): React.ReactElement {
  const present = data
    .filter((d) => d.fraction !== null)
    .map((d) => ({ label: d.label, pct: (d.fraction ?? 0) * 100 }));
  const hasData = present.length > 0;

  return (
    <Card className="border-line bg-glass p-5">
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-fg-muted">
        {title}
      </p>
      {hasData ? (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={present}
            layout="vertical"
            margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="var(--line)"
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `${String(v)}%`}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="var(--fg-muted)"
            />
            <YAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={110}
              stroke="var(--fg-muted)"
            />
            <Tooltip
              cursor={{ fill: "var(--fill-hover)" }}
              formatter={(v) => [`${Number(v).toFixed(1)}%`, ""]}
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
            <Bar
              dataKey="pct"
              fill="hsl(var(--chart-1))"
              radius={[0, 4, 4, 0]}
              barSize={18}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[240px] items-center justify-center text-sm text-fg-muted">
          Awaiting funnel-rate data for this window
        </div>
      )}
    </Card>
  );
}
