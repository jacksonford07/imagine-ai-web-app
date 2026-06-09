import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PrintButton } from "@/components/reports/print-button";
import { loadReport } from "@/components/reports/report-body";
import {
  asReportTab,
  currentIsoWeek,
  currentMonth,
} from "@/components/reports/period";
import { formatDateTime } from "@/lib/format";
import { single, type RawSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

type CssVars = React.CSSProperties & Record<`--${string}`, string>;

// Light "paper" values for the same token slots the report components use on
// the dark dashboard — scoping them here keeps the document legible on screen
// and on paper without touching the global stylesheet.
const PAPER_THEME: CssVars = {
  "--background": "0 0% 100%",
  "--foreground": "222 47% 11%",
  "--card": "0 0% 100%",
  "--card-foreground": "222 47% 11%",
  "--muted": "220 14% 96%",
  "--muted-foreground": "220 9% 38%",
  "--border": "220 13% 87%",
  "--secondary": "220 14% 96%",
  "--secondary-foreground": "222 47% 11%",
  "--primary": "220 70% 42%",
  "--primary-foreground": "0 0% 100%",
  "--brand": "220 70% 42%",
  "--brand-soft": "220 70% 38%",
  "--brand-strong": "220 70% 32%",
  "--warning": "32 95% 34%",
  "--success": "158 64% 26%",
  "--fg-primary": "rgba(15, 23, 42, 0.95)",
  "--fg-secondary": "rgba(15, 23, 42, 0.75)",
  "--fg-muted": "rgba(15, 23, 42, 0.55)",
  "--fg-subtle": "rgba(15, 23, 42, 0.35)",
  "--line": "rgba(15, 23, 42, 0.12)",
  "--line-soft": "rgba(15, 23, 42, 0.08)",
  "--fill-hover": "rgba(15, 23, 42, 0.05)",
  "--fill-active": "rgba(15, 23, 42, 0.1)",
  printColorAdjust: "exact",
  WebkitPrintColorAdjust: "exact",
};

const PRINT_STYLES = `
  @page { size: A4; margin: 14mm; }
  @media print {
    html, body { background: white !important; }
  }
`;

export default async function ReportPrintPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}): Promise<React.ReactElement> {
  const sp = await searchParams;
  const tab = asReportTab(single(sp.tab));
  const week = single(sp.week) ?? currentIsoWeek();
  const month = single(sp.month) ?? currentMonth();
  const auto = single(sp.auto) === "1";

  const report = await loadReport(tab, week, month);
  const backHref = `/ceo/reports?tab=${tab}&week=${encodeURIComponent(week)}&month=${encodeURIComponent(month)}`;

  return (
    <div
      style={PAPER_THEME}
      className="min-h-screen bg-background text-foreground"
    >
      <style>{PRINT_STYLES}</style>
      <div className="mx-auto max-w-4xl px-10 py-10 print:max-w-none print:px-0 print:py-0">
        <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to reports
          </Link>
          <PrintButton auto={auto} />
        </div>

        <header className="mb-8 border-b border-border pb-6">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Imagine AI — CEO Dashboard
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">
            {report.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {report.periodLabel}
            {report.syncedAt !== null &&
              ` · data as of ${formatDateTime(report.syncedAt)}`}
            {` · generated ${formatDateTime(new Date().toISOString())}`}
          </p>
        </header>

        {report.content}
      </div>
    </div>
  );
}
