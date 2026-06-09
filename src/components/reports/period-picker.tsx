"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

// Week (YYYY-Www) or month (YYYY-MM) picker that writes its value to the URL
// query string so the server component refetches the matching report.
export function PeriodPicker({
  kind,
  value,
}: {
  kind: "week" | "month";
  value: string;
}): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const onChange = (next: string): void => {
    if (next === "") return;
    const params = new URLSearchParams(searchParams.toString());
    params.set(kind, next);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <Input
      type={kind}
      aria-label={kind === "week" ? "Report week" : "Report month"}
      className="h-8 w-44 text-xs"
      value={value}
      data-pending={isPending ? "" : undefined}
      onChange={(e) => {
        onChange(e.target.value);
      }}
    />
  );
}
