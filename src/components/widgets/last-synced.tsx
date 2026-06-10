import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

const DEFAULT_STALE_MINUTES = 120;

function isStale(iso: string, staleAfterMinutes: number): boolean {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return true;
  return Date.now() - then > staleAfterMinutes * 60_000;
}

// Per-page freshness badge. Amber (single warning slot, per Prism) when the
// underlying source data is older than the stale threshold; never shows zeros.
export function LastSynced({
  at,
  staleAfterMinutes = DEFAULT_STALE_MINUTES,
}: {
  at: string | null;
  staleAfterMinutes?: number;
}): React.ReactElement {
  const stale = at !== null && isStale(at, staleAfterMinutes);
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-fill-hover px-3 text-xs",
        stale ? "text-warning" : "text-fg-muted",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          at === null ? "bg-fg-subtle" : stale ? "bg-warning" : "bg-success",
        )}
      />
      {at === null ? "never synced" : `synced ${formatRelative(at)}`}
    </span>
  );
}
