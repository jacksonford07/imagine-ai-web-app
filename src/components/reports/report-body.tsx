import {
  getAuditPack,
  getEowReport,
  getPnlReport,
} from "@/lib/sources/bot/reports";
import { AuditPackReport } from "./audit-pack-report";
import { AwaitingData } from "./awaiting-data";
import { EowReportView } from "./eow-report";
import { PnlWaterfall } from "./pnl-waterfall";
import { formatMonthLabel, formatWeekLabel } from "./period";
import type { ReportTab } from "./period";

export interface LoadedReport {
  content: React.ReactElement;
  syncedAt: string | null;
  periodLabel: string;
  title: string;
}

// Single fetch+render path shared by /ceo/reports and /ceo/reports/print so
// the on-screen view and the PDF export can never drift apart.
export async function loadReport(
  tab: ReportTab,
  week: string,
  month: string,
): Promise<LoadedReport> {
  if (tab === "eow") {
    const { data, error, fetchedAt } = await getEowReport(week);
    const periodLabel = formatWeekLabel(week);
    return {
      title: "End-of-week report",
      periodLabel,
      syncedAt: data === null ? null : (data.lastSyncedAt ?? fetchedAt),
      content:
        data === null ? (
          <AwaitingData error={error ?? "no data"} period={periodLabel} />
        ) : (
          <EowReportView data={data} />
        ),
    };
  }

  if (tab === "pnl") {
    const { data, error, fetchedAt } = await getPnlReport(month);
    const periodLabel = formatMonthLabel(month);
    return {
      title: "Monthly P&L",
      periodLabel,
      syncedAt: data === null ? null : (data.lastSyncedAt ?? fetchedAt),
      content:
        data === null ? (
          <AwaitingData error={error ?? "no data"} period={periodLabel} />
        ) : (
          <PnlWaterfall data={data} />
        ),
    };
  }

  const { data, error, fetchedAt } = await getAuditPack(month);
  const periodLabel = formatMonthLabel(month);
  return {
    title: "Forensic audit pack",
    periodLabel,
    syncedAt: data === null ? null : (data.lastSyncedAt ?? fetchedAt),
    content:
      data === null ? (
        <AwaitingData error={error ?? "no data"} period={periodLabel} />
      ) : (
        <AuditPackReport data={data} />
      ),
  };
}
