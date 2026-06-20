"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

// Shared per-page window filter: presets + custom from/to, written to the
// URL query string (`from`/`to`, YYYY-MM-DD) for server components to read.

type PresetKey = "mtd" | "30d" | "90d" | "ytd";

const PRESETS: Record<PresetKey, { label: string; from: () => string }> = {
  mtd: {
    label: "This month",
    from: () => {
      const now = new Date();
      return toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
    },
  },
  "30d": { label: "Last 30 days", from: () => daysAgo(30) },
  "90d": { label: "Last 90 days", from: () => daysAgo(90) },
  ytd: {
    label: "Year to date",
    from: () => toIsoDate(new Date(new Date().getFullYear(), 0, 1)),
  },
};

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toIsoDate(d);
}

export function WindowFilter(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const apply = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      params.delete("cursor");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams],
  );

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  return (
    <div
      className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
      data-pending={isPending ? "" : undefined}
    >
      <Select
        aria-label="Window preset"
        className="h-8 w-full text-xs sm:w-36"
        value=""
        onChange={(e) => {
          const key = e.target.value as PresetKey | "";
          if (key === "") return;
          apply({ from: PRESETS[key].from(), to: toIsoDate(new Date()) });
        }}
      >
        <option value="" disabled>
          {from === "" && to === ""
            ? "This month"
            : `${from || "…"} → ${to || "today"}`}
        </option>
        {Object.entries(PRESETS).map(([key, preset]) => (
          <option key={key} value={key}>
            {preset.label}
          </option>
        ))}
      </Select>
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <Input
          type="date"
          aria-label="From date"
          className="h-8 min-w-0 flex-1 text-xs sm:w-36 sm:flex-none"
          value={from}
          onChange={(e) => {
            apply({ from: e.target.value });
          }}
        />
        <span className="text-xs text-fg-subtle">→</span>
        <Input
          type="date"
          aria-label="To date"
          className="h-8 min-w-0 flex-1 text-xs sm:w-36 sm:flex-none"
          value={to}
          onChange={(e) => {
            apply({ to: e.target.value });
          }}
        />
      </div>
    </div>
  );
}
