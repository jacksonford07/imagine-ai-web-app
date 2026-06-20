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

export interface Bucket {
  label: string;
  count: number | null;
}

// Integer-count histogram (e.g. time-to-ascension distribution). Single navy
// accent; renders an awaiting state until a bucket carries a count.
export function BucketBarsChart({
  title,
  buckets,
}: {
  title: string;
  buckets: Bucket[];
}): React.ReactElement {
  const data = buckets.map((b) => ({ label: b.label, count: b.count ?? null }));
  const hasData = data.some((d) => typeof d.count === "number");

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
              fontSize={12}
              stroke="var(--fg-muted)"
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={40}
              stroke="var(--fg-muted)"
            />
            <Tooltip
              cursor={{ fill: "var(--fill-hover)" }}
              formatter={(v) => [Number(v).toLocaleString("en-US"), "Count"]}
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
              dataKey="count"
              fill="hsl(var(--chart-1))"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[240px] items-center justify-center text-sm text-fg-muted">
          Awaiting distribution data
        </div>
      )}
    </Card>
  );
}
