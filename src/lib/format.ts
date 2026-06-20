const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Cents → "$1,234". Renders "—" for null/NaN so unwired metrics stay honest. */
export function formatCents(cents: number | null): string {
  if (cents === null || Number.isNaN(cents)) return "—";
  return USD.format(cents / 100);
}

/** 0–1 fraction → "12.3%". Renders "—" for null. */
export function formatPercent(fraction: number | null): string {
  if (fraction === null || Number.isNaN(fraction)) return "—";
  return `${(fraction * 100).toFixed(1)}%`;
}

/** Cents → compact "$256k" / "$1.2M". Renders "—" for null/NaN. */
export function formatCompactCents(cents: number | null): string {
  if (cents === null || Number.isNaN(cents)) return "—";
  const dollars = cents / 100;
  const abs = Math.abs(dollars);
  if (abs >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${String(Math.round(dollars / 1000))}k`;
  return `$${String(Math.round(dollars))}`;
}

/** 0–1 fraction → signed "+9.4%" / "−3.4%". Renders "—" for null/NaN. */
export function formatSignedPercent(fraction: number | null): string {
  if (fraction === null || Number.isNaN(fraction)) return "—";
  const sign = fraction > 0 ? "+" : fraction < 0 ? "−" : "";
  return `${sign}${(Math.abs(fraction) * 100).toFixed(1)}%`;
}

/** Days → "18d" / "17.4d". Renders "—" for null/NaN. */
export function formatDays(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return `${value % 1 === 0 ? value.toLocaleString("en-US") : value.toFixed(1)}d`;
}

export function formatDateTime(iso: string | null): string {
  if (iso === null) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export function formatRelative(iso: string | null): string {
  if (iso === null) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${String(mins)}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${String(hours)}h ago`;
  const days = Math.round(hours / 24);
  return `${String(days)}d ago`;
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  if (seconds < 60) return `${String(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${String(mins)}m`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 24)
    return remMins > 0
      ? `${String(hours)}h ${String(remMins)}m`
      : `${String(hours)}h`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0
    ? `${String(days)}d ${String(remHours)}h`
    : `${String(days)}d`;
}
