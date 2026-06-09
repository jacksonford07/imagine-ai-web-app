import Link from "next/link";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/widgets/page-header";
import { LastSynced } from "@/components/widgets/last-synced";
import { RefreshNow } from "@/components/widgets/refresh-now";
import { CopyLinkButton } from "@/components/reports/copy-link-button";
import { PeriodPicker } from "@/components/reports/period-picker";
import { ReportTabs } from "@/components/reports/report-tabs";
import { loadReport } from "@/components/reports/report-body";
import {
  asReportTab,
  currentIsoWeek,
  currentMonth,
} from "@/components/reports/period";
import { single, type RawSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}): Promise<React.ReactElement> {
  const sp = await searchParams;
  const tab = asReportTab(single(sp.tab));
  const week = single(sp.week) ?? currentIsoWeek();
  const month = single(sp.month) ?? currentMonth();

  const report = await loadReport(tab, week, month);
  const printHref = `/ceo/reports/print?tab=${tab}&week=${encodeURIComponent(week)}&month=${encodeURIComponent(month)}&auto=1`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description={`${report.title} — ${report.periodLabel}.`}
        actions={
          <>
            <PeriodPicker
              kind={tab === "eow" ? "week" : "month"}
              value={tab === "eow" ? week : month}
            />
            <LastSynced at={report.syncedAt} />
            <RefreshNow />
            <CopyLinkButton />
            <Button variant="outline" size="sm" className="h-8 gap-1.5" asChild>
              <Link href={printHref} target="_blank">
                <FileDown className="h-3.5 w-3.5" />
                Export PDF
              </Link>
            </Button>
          </>
        }
      />

      <ReportTabs active={tab} week={week} month={month} />

      {report.content}
    </div>
  );
}
