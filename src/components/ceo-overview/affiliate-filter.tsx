"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
import type { AffiliateFilter as AffiliateValue } from "@/lib/sources/bot/kpis";

const OPTIONS: { value: AffiliateValue; label: string }[] = [
  { value: "both", label: "Affiliate: both" },
  { value: "yes", label: "Affiliate: yes" },
  { value: "no", label: "Affiliate: no" },
];

// Header-slot affiliate filter, mirroring WindowFilter: writes `affiliate`
// (yes|no) to the URL query string; "both" is the default and clears the param.
export function AffiliateFilter(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = searchParams.get("affiliate") ?? "both";

  return (
    <Select
      aria-label="Affiliate filter"
      className="h-8 w-36 text-xs"
      value={current}
      data-pending={isPending ? "" : undefined}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value === "both") {
          params.delete("affiliate");
        } else {
          params.set("affiliate", e.target.value);
        }
        params.delete("cursor");
        startTransition(() => {
          router.replace(`${pathname}?${params.toString()}`);
        });
      }}
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
}
