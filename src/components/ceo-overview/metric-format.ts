import { formatCents, formatPercent } from "@/lib/format";

// How a KPI renders. cents → "$1,234"; percent (0–1 fraction) → "12.3%";
// count → "1,234"; ratio → "2.40×". Null always renders "—", never 0.
export type MetricKind = "cents" | "percent" | "count" | "ratio";

export function formatMetric(kind: MetricKind, value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  switch (kind) {
    case "cents":
      return formatCents(value);
    case "percent":
      return formatPercent(value);
    case "count":
      return value.toLocaleString("en-US");
    case "ratio":
      return `${value.toFixed(2)}×`;
  }
}
