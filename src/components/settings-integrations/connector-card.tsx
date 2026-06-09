import { Card } from "@/components/ui/card";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  ConnectorState,
  ConnectorStatus,
} from "@/lib/sources/bot/integrations";
import type { ConnectorMeta } from "./connector-meta";
import { SyncNowButton } from "./sync-now-button";

const STATE_CHIPS: Record<
  ConnectorState,
  { label: string; className: string; dot: string }
> = {
  missing_key: {
    label: "Awaiting key",
    className: "text-fg-muted",
    dot: "bg-fg-subtle",
  },
  never_ran: {
    label: "Never ran",
    className: "text-fg-secondary",
    dot: "bg-fg-subtle",
  },
  running: {
    label: "Syncing",
    className: "text-brand-soft",
    dot: "bg-brand-soft animate-pulse",
  },
  ok: { label: "OK", className: "text-success", dot: "bg-success" },
  error: { label: "Error", className: "text-error", dot: "bg-error" },
};

const BACKFILL_LABELS: Record<string, string> = {
  pending: "queued",
  running: "running",
  done: "complete",
  error: "failed",
};

// "rawEvents" → "raw events" for record-count labels.
function humanizeKey(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
}

function StateChip({ state }: { state: ConnectorState }): React.ReactElement {
  const chip = STATE_CHIPS[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-fill-hover px-2.5 py-0.5 text-xs font-medium",
        chip.className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", chip.dot)} />
      {chip.label}
    </span>
  );
}

// One glass card per connector. `status` is null until the bot's sync-status
// endpoint ships — the card still renders the full handover checklist (state,
// env var names, caveats) from static metadata.
export function ConnectorCard({
  meta,
  status,
}: {
  meta: ConnectorMeta;
  status: ConnectorStatus | null;
}): React.ReactElement {
  const state: ConnectorState = status?.state ?? "missing_key";
  const lastSyncedAt = status?.lastSyncedAt ?? null;
  const lastError = status?.lastError ?? null;
  const backfill = status?.backfill ?? null;
  const recordCounts = Object.entries(status?.recordCounts ?? {});
  const envVars =
    status !== null && status.requiredEnvVars.length > 0
      ? status.requiredEnvVars
      : meta.requiredEnvVars;
  const missing = new Set(status?.missingEnvVars ?? []);

  return (
    <Card className="flex flex-col gap-4 border-glass-border bg-glass p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold text-fg-primary">{meta.label}</h2>
        <StateChip state={state} />
        <div className="ml-auto flex items-center gap-2">
          <SyncNowButton source={meta.name} label={meta.label} />
        </div>
      </div>

      <p className="text-sm text-fg-muted">{meta.description}</p>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-fg-muted">
        <span>
          Last synced:{" "}
          <span className="text-fg-secondary">
            {lastSyncedAt === null ? "never" : formatRelative(lastSyncedAt)}
          </span>
        </span>
        {recordCounts.map(([key, count]) => (
          <span key={key}>
            {humanizeKey(key)}:{" "}
            <span className="tabular-nums text-fg-secondary">
              {count.toLocaleString("en-US")}
            </span>
          </span>
        ))}
      </div>

      {backfill !== null && backfill !== undefined && (
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-fg-muted">
              Backfill {BACKFILL_LABELS[backfill.status] ?? backfill.status}
            </span>
            <span className="tabular-nums text-fg-secondary">
              {Math.round(backfill.percentComplete)}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-fill-active">
            <div
              className={cn(
                "h-full rounded-full",
                backfill.status === "error" ? "bg-error" : "bg-brand-soft",
              )}
              style={{
                width: `${String(Math.min(100, Math.max(0, backfill.percentComplete)))}%`,
              }}
            />
          </div>
        </div>
      )}

      {lastError !== null && lastError !== undefined && (
        <p className="break-words text-xs text-error">
          Last error: {lastError}
        </p>
      )}

      <div className="mt-auto border-t border-line-soft pt-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-fg-subtle">
          Required env vars
        </p>
        <div className="flex flex-wrap gap-1.5">
          {envVars.map((name) => (
            <span
              key={name}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md bg-fill-hover px-2 py-0.5 font-mono text-xs",
                missing.has(name) ? "text-warning" : "text-fg-secondary",
              )}
            >
              {status !== null && (
                <span
                  className={cn(
                    "h-1 w-1 rounded-full",
                    missing.has(name) ? "bg-warning" : "bg-success",
                  )}
                />
              )}
              {name}
            </span>
          ))}
        </div>
        {meta.caveat !== undefined && (
          <p className="mt-2 text-xs text-fg-muted">{meta.caveat}</p>
        )}
      </div>
    </Card>
  );
}
