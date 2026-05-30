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
