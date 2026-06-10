// Period helpers shared by /ceo/reports and /ceo/reports/print. Week values
// use the <input type="week"> format (YYYY-Www); months use YYYY-MM.

export const REPORT_TABS = ["eow", "pnl", "audit"] as const;
export type ReportTab = (typeof REPORT_TABS)[number];

export function asReportTab(value: string | undefined): ReportTab {
  return value !== undefined &&
    (REPORT_TABS as readonly string[]).includes(value)
    ? (value as ReportTab)
    : "eow";
}

export function currentIsoWeek(now: Date = new Date()): string {
  const d = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );
  // Shift to the Thursday of this week so the year boundary follows ISO-8601.
  const day = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart) / 86_400_000 + 1) / 7);
  return `${String(d.getUTCFullYear())}-W${String(week).padStart(2, "0")}`;
}

export function currentMonth(now: Date = new Date()): string {
  return `${String(now.getFullYear())}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(month: string): string {
  const [year, mon] = month.split("-").map(Number);
  if (
    year === undefined ||
    mon === undefined ||
    Number.isNaN(year) ||
    Number.isNaN(mon)
  ) {
    return month;
  }
  return new Date(year, mon - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function formatWeekLabel(week: string): string {
  const match = /^(\d{4})-W(\d{2})$/.exec(week);
  if (match === null) return week;
  return `Week ${match[2]}, ${match[1]}`;
}
