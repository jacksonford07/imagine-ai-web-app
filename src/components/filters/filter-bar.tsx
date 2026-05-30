"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export interface FilterBarProps {
  // Which controls to show. Chats has cohort; escalations does not.
  showCohort?: boolean;
}

// Client filter bar: every change writes to the URL query string, which the
// server component reads to re-fetch. Pagination cursor is reset on any change.
export function FilterBar({
  showCohort = false,
}: FilterBarProps): React.ReactElement {
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
      data-pending={isPending}
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Student
        </label>
        <Input
          className="w-44"
          placeholder="name or id"
          defaultValue={searchParams.get("student") ?? ""}
          onBlur={(e) => {
            setParam("student", e.target.value.trim());
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              setParam("student", e.currentTarget.value.trim());
          }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Coach
        </label>
        <Input
          className="w-36"
          placeholder="coach"
          defaultValue={searchParams.get("coach") ?? ""}
          onBlur={(e) => {
            setParam("coach", e.target.value.trim());
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              setParam("coach", e.currentTarget.value.trim());
          }}
        />
      </div>

      {showCohort && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Cohort
          </label>
          <Input
            className="w-28"
            placeholder="cohort"
            defaultValue={searchParams.get("cohort") ?? ""}
            onBlur={(e) => {
              setParam("cohort", e.target.value.trim());
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                setParam("cohort", e.currentTarget.value.trim());
            }}
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Status
        </label>
        <Select
          className="w-36"
          defaultValue={searchParams.get("status") ?? ""}
          onChange={(e) => {
            setParam("status", e.target.value);
          }}
        >
          <option value="">Any</option>
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          From
        </label>
        <Input
          type="date"
          className="w-40"
          defaultValue={searchParams.get("from") ?? ""}
          onChange={(e) => {
            setParam("from", e.target.value);
          }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">To</label>
        <Input
          type="date"
          className="w-40"
          defaultValue={searchParams.get("to") ?? ""}
          onChange={(e) => {
            setParam("to", e.target.value);
          }}
        />
      </div>
    </div>
  );
}
