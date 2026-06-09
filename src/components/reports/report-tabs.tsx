import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReportTab } from "./period";

const TABS: { key: ReportTab; label: string }[] = [
  { key: "eow", label: "End of week" },
  { key: "pnl", label: "Monthly P&L" },
  { key: "audit", label: "Audit pack" },
];

// URL-driven tabs (server-rendered links) so each tab's report is fetched
// server-side and the active tab survives in the shareable link.
export function ReportTabs({
  active,
  week,
  month,
}: {
  active: ReportTab;
  week: string;
  month: string;
}): React.ReactElement {
  return (
    <div className="inline-flex h-9 items-center rounded-lg bg-muted p-[3px] print:hidden">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={{
            pathname: "/ceo/reports",
            query: { tab: tab.key, week, month },
          }}
          aria-current={active === tab.key ? "page" : undefined}
          className={cn(
            "inline-flex h-full items-center whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors",
            active === tab.key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
