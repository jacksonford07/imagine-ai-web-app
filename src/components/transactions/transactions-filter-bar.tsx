"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
import { TIERS } from "@/lib/ceo/taxonomy";

// Transaction facet filters (source / tier / status / affiliate). Each change
// writes to the URL query string for the server component to read; the keyset
// cursor is cleared so the new filter starts from page one. Date window is
// handled by the shared <WindowFilter /> in the page header.

const SOURCES = [
  { value: "whop", label: "Whop" },
  { value: "fanbasis", label: "Fanbasis" },
  { value: "claritypay", label: "ClarityPay" },
  { value: "splitit", label: "Splitit" },
];

const STATUSES = [
  { value: "succeeded", label: "Succeeded" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
  { value: "disputed", label: "Disputed" },
  { value: "failed", label: "Failed" },
];

export function TransactionsFilterBar(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("cursor");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams],
  );

  return (
    <div
      className="mb-5 flex flex-wrap items-end gap-3"
      data-pending={isPending ? "" : undefined}
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-fg-muted">Source</label>
        <Select
          className="h-8 w-36 text-xs"
          aria-label="Source"
          value={searchParams.get("source") ?? ""}
          onChange={(e) => {
            setParam("source", e.target.value);
          }}
        >
          <option value="">All sources</option>
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-fg-muted">Tier</label>
        <Select
          className="h-8 w-32 text-xs"
          aria-label="Tier"
          value={searchParams.get("tier") ?? ""}
          onChange={(e) => {
            setParam("tier", e.target.value);
          }}
        >
          <option value="">All tiers</option>
          {TIERS.map((t) => (
            <option key={t.key} value={t.key}>
              {t.short}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-fg-muted">Status</label>
        <Select
          className="h-8 w-32 text-xs"
          aria-label="Status"
          value={searchParams.get("status") ?? ""}
          onChange={(e) => {
            setParam("status", e.target.value);
          }}
        >
          <option value="">Any status</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-fg-muted">Affiliate</label>
        <Select
          className="h-8 w-28 text-xs"
          aria-label="Affiliate"
          value={searchParams.get("affiliate") ?? ""}
          onChange={(e) => {
            setParam("affiliate", e.target.value);
          }}
        >
          <option value="">Both</option>
          <option value="yes">Affiliate</option>
          <option value="no">Direct</option>
        </Select>
      </div>
    </div>
  );
}
