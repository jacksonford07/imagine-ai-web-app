"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

// Sample analytics series — wire to real bot metrics later.
const data = [
  { name: "Page Views", total: 12500 },
  { name: "Unique Visitors", total: 8200 },
  { name: "Bounce Rate", total: 42 },
  { name: "Avg. Duration", total: 272 },
  { name: "Conversions", total: 264 },
  { name: "Revenue", total: 4500 },
];

export function AnalyticsChart(): React.ReactElement {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Bar dataKey="total" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  );
}
