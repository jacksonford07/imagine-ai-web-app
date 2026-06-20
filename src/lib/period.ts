// Window resolution + period-over-period delta helpers. The CEO pages default
// to month-to-date and compare against the equal-length window immediately
// before it (so MTD compares to "last month so far"). Deltas are computed in
// the dashboard from two real KPI fetches — never fabricated.

export interface ResolvedWindow {
  from: string;
  to: string;
}

export interface WindowWithPrior {
  current: ResolvedWindow;
  prior: ResolvedWindow;
  /** Short month name of the prior window's start, e.g. "Apr". */
  priorLabel: string;
}

const DAY_MS = 86_400_000;

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Resolves the active window, defaulting to month-to-date (UTC). */
export function resolveWindow(from?: string, to?: string): ResolvedWindow {
  const now = new Date();
  const firstOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  return {
    from: from ?? toIsoDate(firstOfMonth),
    to: to ?? toIsoDate(now),
  };
}

/** Equal-length window ending the day before `current` starts. */
export function withPrior(current: ResolvedWindow): WindowWithPrior {
  const fromMs = Date.parse(`${current.from}T00:00:00Z`);
  const toMs = Date.parse(`${current.to}T00:00:00Z`);
  const lengthDays =
    Number.isNaN(fromMs) || Number.isNaN(toMs)
      ? 30
      : Math.max(0, Math.round((toMs - fromMs) / DAY_MS));
  const priorTo = new Date((Number.isNaN(fromMs) ? Date.now() : fromMs) - DAY_MS);
  const priorFrom = new Date(priorTo.getTime() - lengthDays * DAY_MS);
  return {
    current,
    prior: { from: toIsoDate(priorFrom), to: toIsoDate(priorTo) },
    priorLabel: priorFrom.toLocaleString("en-US", {
      month: "short",
      timeZone: "UTC",
    }),
  };
}

/** Fractional change vs prior, e.g. 0.094 = +9.4%. Null when not computable. */
export function deltaFraction(
  current: number | null,
  prior: number | null,
): number | null {
  if (current === null || prior === null || prior === 0) return null;
  return (current - prior) / Math.abs(prior);
}

/** Fraction of the current calendar month elapsed (0–1), UTC. */
export function monthElapsedFraction(): number {
  const now = new Date();
  const daysInMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return now.getUTCDate() / daysInMonth;
}

/** Linear end-of-month projection from a month-to-date value. */
export function projectEndOfMonth(mtdValue: number | null): number | null {
  if (mtdValue === null) return null;
  const fraction = monthElapsedFraction();
  if (fraction <= 0) return null;
  return Math.round(mtdValue / fraction);
}
