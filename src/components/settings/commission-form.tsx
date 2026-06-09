"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useRole } from "@/context/role-provider";
import { saveCommissionConfig } from "@/lib/actions/settings";
import { formatCents, formatDateTime } from "@/lib/format";
import type { CommissionConfig } from "@/lib/sources/bot/settings";

const RATE_STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export function CommissionForm({
  config,
}: {
  config: CommissionConfig | null;
}): React.ReactElement {
  const { role } = useRole();
  const canEdit = role === "admin";
  const [isPending, startTransition] = useTransition();

  const [ratePercent, setRatePercent] = useState(config?.ratePercent ?? 10);
  const [minEarnedDollars, setMinEarnedDollars] = useState(
    config?.minEarnedCents !== null && config?.minEarnedCents !== undefined
      ? String(config.minEarnedCents / 100)
      : "0",
  );
  const [reason, setReason] = useState("");

  const onSave = (): void => {
    if (reason.trim() === "") {
      toast.error("A reason is required to change commission rules");
      return;
    }
    const dollars = Number(minEarnedDollars);
    if (Number.isNaN(dollars) || dollars < 0) {
      toast.error("Minimum earned must be a non-negative dollar amount");
      return;
    }
    startTransition(async () => {
      const result = await saveCommissionConfig({
        ratePercent,
        minEarnedCents: Math.round(dollars * 100),
        reason,
      });
      if (!result.ok) {
        toast.error("Could not save commission config", {
          description: result.error,
        });
        return;
      }
      toast.success("Commission config saved", {
        description: "Applies to accruals from now; audit-logged.",
      });
      setReason("");
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="p-5 lg:col-span-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Sales Possible commission
          </p>
          {!canEdit && (
            <span className="text-xs text-muted-foreground">read-only</span>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-muted-foreground">Commission rate</span>
            <Select
              className="mt-1.5"
              value={String(ratePercent)}
              onChange={(e) => {
                setRatePercent(Number(e.target.value));
              }}
              disabled={!canEdit || isPending}
            >
              {RATE_STEPS.map((step) => (
                <option key={step} value={step}>
                  {step}%
                </option>
              ))}
            </Select>
            <span className="mt-1 block text-xs text-muted-foreground">
              Selectable in 10% steps, 0–100%.
            </span>
          </label>

          <label className="block text-sm">
            <span className="text-muted-foreground">Minimum earned ($)</span>
            <Input
              type="number"
              step="1"
              min="0"
              inputMode="decimal"
              value={minEarnedDollars}
              onChange={(e) => {
                setMinEarnedDollars(e.target.value);
              }}
              disabled={!canEdit || isPending}
              className="mt-1.5"
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              A sale is commission-eligible only once net earned reaches this
              threshold.
            </span>
          </label>
        </div>

        {canEdit && (
          <div className="mt-4 border-t border-line-soft pt-4">
            <label className="block text-sm">
              <span className="text-muted-foreground">
                Reason for change (required)
              </span>
              <Input
                placeholder="e.g. New closer agreement effective June"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                }}
                disabled={isPending}
                className="mt-1.5"
              />
            </label>
            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                onClick={onSave}
                disabled={isPending || reason.trim() === ""}
              >
                {isPending ? "Saving…" : "Save commission config"}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-5 lg:col-span-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Active config
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Rate</dt>
            <dd className="font-medium tabular-nums text-fg-primary">
              {config?.ratePercent !== null && config?.ratePercent !== undefined
                ? `${String(config.ratePercent)}%`
                : "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Minimum earned</dt>
            <dd className="font-medium tabular-nums text-fg-primary">
              {formatCents(config?.minEarnedCents ?? null)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Effective since</dt>
            <dd className="text-fg-secondary">
              {formatDateTime(
                config?.effectiveFrom ?? config?.updatedAt ?? null,
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Last changed by</dt>
            <dd className="text-fg-secondary">{config?.updatedBy ?? "—"}</dd>
          </div>
          {config?.reason !== null && config?.reason !== undefined && (
            <div>
              <dt className="text-muted-foreground">Reason</dt>
              <dd className="mt-0.5 text-fg-secondary">{config.reason}</dd>
            </div>
          )}
        </dl>
        <p className="mt-4 border-t border-line-soft pt-3 text-xs text-muted-foreground">
          Changes apply to commission accrual from save time — prior accruals
          are never recomputed. Every change is audit-logged with author and
          reason; the full history lives in the audit log.
        </p>
      </Card>
    </div>
  );
}
