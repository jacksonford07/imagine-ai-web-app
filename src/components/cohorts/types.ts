// Client-safe display shapes for the cohorts page. The server page maps the
// tolerant adapter payload (nullish everywhere) onto these clean types so the
// client components only deal with `T | null`.

export type CohortMetric = "revenue" | "ascension";

export interface CohortCell {
  week: number;
  cumulativeRevenueCents: number | null;
  ascensionRate: number | null;
}

export interface CohortDisplayRow {
  key: string;
  label: string;
  size: number | null;
  ascensionRate: number | null;
  closeRate: number | null;
  medianDaysToAscension: number | null;
  ltvCents: number | null;
  cacCents: number | null;
  paybackDays: number | null;
  tierMix: Record<string, number> | null;
  cells: CohortCell[];
}
