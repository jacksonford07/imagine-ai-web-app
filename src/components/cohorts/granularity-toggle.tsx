"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
] as const;

// Cohort granularity (acquisition week vs month), written to the URL so the
// server page re-fetches /ceo/cohorts with the matching granularity.
export function GranularityToggle(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current =
    searchParams.get("granularity") === "month" ? "month" : "week";

  const set = (value: "week" | "month"): void => {
    if (value === current) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("granularity", value);
    params.delete("cursor");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div
      role="group"
      aria-label="Cohort granularity"
      className="inline-flex h-8 items-center rounded-lg bg-muted p-[3px]"
      data-pending={isPending ? "" : undefined}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={current === opt.value}
          onClick={() => {
            set(opt.value);
          }}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            current === opt.value
              ? "bg-background text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
