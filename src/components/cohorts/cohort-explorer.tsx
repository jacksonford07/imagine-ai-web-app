"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CohortDetailPanel } from "./cohort-detail-panel";
import { CohortMatrix } from "./cohort-matrix";
import { CohortOverlayChart } from "./cohort-overlay-chart";
import type { CohortDisplayRow, CohortMetric } from "./types";

// Client island holding the state the chart, matrix, and detail panel share:
// the revenue/ascension cell toggle and the selected cohort.
export function CohortExplorer({
  rows,
}: {
  rows: CohortDisplayRow[];
}): React.ReactElement {
  const [metric, setMetric] = useState<CohortMetric>("revenue");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Default to the most recent cohort so the detail panel is never empty.
  const effectiveKey = useMemo(() => {
    if (selectedKey !== null && rows.some((r) => r.key === selectedKey)) {
      return selectedKey;
    }
    return rows.length > 0
      ? [...rows].sort((a, b) => (a.key < b.key ? 1 : -1))[0].key
      : null;
  }, [rows, selectedKey]);

  const selectedRow = rows.find((r) => r.key === effectiveKey) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Cohorts by weeks since acquisition
        </p>
        <Tabs
          value={metric}
          onValueChange={(v) => {
            setMetric(v === "ascension" ? "ascension" : "revenue");
          }}
        >
          <TabsList className="h-8">
            <TabsTrigger value="revenue" className="px-3 text-xs">
              Cumulative revenue
            </TabsTrigger>
            <TabsTrigger value="ascension" className="px-3 text-xs">
              Ascension %
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CohortOverlayChart
            rows={rows}
            metric={metric}
            selectedKey={effectiveKey}
          />
        </div>
        <CohortDetailPanel row={selectedRow} />
      </div>

      <CohortMatrix
        rows={rows}
        metric={metric}
        selectedKey={effectiveKey}
        onSelect={setSelectedKey}
      />
    </div>
  );
}
