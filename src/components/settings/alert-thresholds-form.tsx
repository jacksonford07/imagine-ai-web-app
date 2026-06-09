"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRole } from "@/context/role-provider";
import { saveAlertConfig } from "@/lib/actions/settings";
import { formatDateTime } from "@/lib/format";
import type { AlertConfig } from "@/lib/sources/bot/settings";

function toNumberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export function AlertThresholdsForm({
  config,
}: {
  config: AlertConfig | null;
}): React.ReactElement {
  const { role } = useRole();
  const canEdit = role === "admin";
  const [isPending, startTransition] = useTransition();

  const [roasFloor, setRoasFloor] = useState(
    config?.roasFloor !== null && config?.roasFloor !== undefined
      ? String(config.roasFloor)
      : "",
  );
  const [cpaCeilingDollars, setCpaCeilingDollars] = useState(
    config?.cpaCeilingCents !== null && config?.cpaCeilingCents !== undefined
      ? String(config.cpaCeilingCents / 100)
      : "",
  );
  const [stalenessHours, setStalenessHours] = useState(
    config?.stalenessHours !== null && config?.stalenessHours !== undefined
      ? String(config.stalenessHours)
      : "",
  );

  const onSave = (): void => {
    startTransition(async () => {
      const cpaDollars = toNumberOrNull(cpaCeilingDollars);
      const result = await saveAlertConfig({
        roasFloor: toNumberOrNull(roasFloor),
        cpaCeilingCents:
          cpaDollars !== null ? Math.round(cpaDollars * 100) : null,
        stalenessHours: toNumberOrNull(stalenessHours),
      });
      if (!result.ok) {
        toast.error("Could not save thresholds", {
          description: result.error,
        });
        return;
      }
      toast.success("Alert thresholds saved");
    });
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Thresholds
        </p>
        {!canEdit && (
          <span className="text-xs text-muted-foreground">read-only</span>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="text-muted-foreground">ROAS floor</span>
          <Input
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            placeholder="e.g. 2.0"
            value={roasFloor}
            onChange={(e) => {
              setRoasFloor(e.target.value);
            }}
            disabled={!canEdit || isPending}
            className="mt-1.5"
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            Alert when blended ROAS drops below this multiple.
          </span>
        </label>

        <label className="block text-sm">
          <span className="text-muted-foreground">CPA ceiling ($)</span>
          <Input
            type="number"
            step="1"
            min="0"
            inputMode="decimal"
            placeholder="e.g. 150"
            value={cpaCeilingDollars}
            onChange={(e) => {
              setCpaCeilingDollars(e.target.value);
            }}
            disabled={!canEdit || isPending}
            className="mt-1.5"
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            Alert when cost per acquisition exceeds this amount.
          </span>
        </label>

        <label className="block text-sm">
          <span className="text-muted-foreground">Staleness window (h)</span>
          <Input
            type="number"
            step="1"
            min="1"
            inputMode="numeric"
            placeholder="e.g. 24"
            value={stalenessHours}
            onChange={(e) => {
              setStalenessHours(e.target.value);
            }}
            disabled={!canEdit || isPending}
            className="mt-1.5"
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            Alert when a connector has not synced within this many hours.
          </span>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-4">
        <div className="text-xs text-muted-foreground">
          <p>
            Slack target:{" "}
            <span className="font-mono text-fg-secondary">
              {config?.slackTarget ?? "—"}
            </span>{" "}
            (set via bot env, not editable here)
          </p>
          {config?.updatedAt !== null && config?.updatedAt !== undefined && (
            <p className="mt-1">
              Last updated {formatDateTime(config.updatedAt)}
              {config.updatedBy !== null ? ` by ${config.updatedBy}` : ""}
            </p>
          )}
        </div>
        {canEdit && (
          <Button size="sm" onClick={onSave} disabled={isPending}>
            {isPending ? "Saving…" : "Save thresholds"}
          </Button>
        )}
      </div>
    </Card>
  );
}
