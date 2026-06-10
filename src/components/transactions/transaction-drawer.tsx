"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LastSynced } from "@/components/widgets/last-synced";
import { createTransactionOverride } from "@/lib/actions/transactions";
import { isEditor } from "@/lib/auth/role";
import { useRole } from "@/context/role-provider";
import { formatCents, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  TransactionRow,
  TransactionAdjustment,
  AppliedOverride,
} from "./types";

// Audit drill-down (US-029): money breakdown, contributing adjustments,
// applied overrides with reason/author, source + raw-event reference, and
// last-synced. Editors get the override form; viewers are read-only.

const OVERRIDE_FIELDS = [
  { value: "gross", label: "Gross" },
  { value: "processorFee", label: "Processor fee" },
  { value: "financingFee", label: "Financing fee" },
  { value: "net", label: "Net" },
];

function MoneyLine({
  label,
  cents,
  emphasis = false,
}: {
  label: string;
  cents: number | null | undefined;
  emphasis?: boolean;
}): React.ReactElement {
  return (
    <div className="flex items-center justify-between py-1">
      <span
        className={cn(
          "text-sm",
          emphasis ? "font-medium text-fg-primary" : "text-fg-muted",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-sm tabular-nums",
          emphasis ? "font-semibold text-fg-primary" : "text-fg-secondary",
        )}
      >
        {formatCents(cents ?? null)}
      </span>
    </div>
  );
}

function AdjustmentItem({
  adjustment,
}: {
  adjustment: TransactionAdjustment;
}): React.ReactElement {
  const label = adjustment.label ?? adjustment.type ?? "Adjustment";
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-line-soft bg-fill-hover px-3 py-2">
      <div className="min-w-0">
        <p className="text-sm text-fg-primary">{label}</p>
        {adjustment.reason != null && adjustment.reason !== "" && (
          <p className="mt-0.5 text-xs text-fg-muted">{adjustment.reason}</p>
        )}
      </div>
      <span className="shrink-0 text-sm tabular-nums text-fg-secondary">
        {formatCents(adjustment.amountCents ?? null)}
      </span>
    </div>
  );
}

function OverrideItem({
  override,
}: {
  override: AppliedOverride;
}): React.ReactElement {
  return (
    <div className="rounded-md border border-brand/30 bg-brand/5 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-fg-primary">
          {override.field ?? "value"} → {formatCents(override.value ?? null)}
        </p>
        {override.createdAt != null && (
          <span className="shrink-0 text-xs text-fg-subtle">
            {formatDateTime(override.createdAt)}
          </span>
        )}
      </div>
      <p className="mt-0.5 text-xs text-fg-muted">
        {override.reason ?? "no reason recorded"}
        {override.author != null && override.author !== ""
          ? ` — ${override.author}`
          : ""}
      </p>
    </div>
  );
}

function OverrideForm({
  transactionId,
  onCreated,
}: {
  transactionId: string;
  onCreated: () => void;
}): React.ReactElement {
  const pathname = usePathname();
  const [field, setField] = React.useState("net");
  const [amount, setAmount] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [isPending, startTransition] = React.useTransition();

  const submit = (): void => {
    const dollars = Number(amount);
    if (amount.trim() === "" || Number.isNaN(dollars)) {
      toast.error("Enter an override amount in dollars");
      return;
    }
    if (reason.trim() === "") {
      toast.error("A reason is required for every override");
      return;
    }
    startTransition(async () => {
      const result = await createTransactionOverride({
        transactionId,
        field,
        valueCents: Math.round(dollars * 100),
        reason,
        path: pathname,
      });
      if (!result.ok) {
        toast.error("Override failed", { description: result.error });
        return;
      }
      toast.success("Override created", {
        description: `${field} set to ${formatCents(Math.round(dollars * 100))}`,
      });
      setAmount("");
      setReason("");
      onCreated();
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select
          aria-label="Override field"
          className="h-8 w-36 text-xs"
          value={field}
          onChange={(e) => {
            setField(e.target.value);
          }}
        >
          {OVERRIDE_FIELDS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </Select>
        <Input
          type="number"
          step="0.01"
          aria-label="Override amount (USD)"
          placeholder="Amount (USD)"
          className="h-8 flex-1 text-xs"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
          }}
        />
      </div>
      <textarea
        aria-label="Override reason"
        placeholder="Reason (required, shows in the audit log)"
        rows={2}
        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        value={reason}
        onChange={(e) => {
          setReason(e.target.value);
        }}
      />
      <Button
        size="sm"
        className="h-8 w-full"
        onClick={submit}
        disabled={isPending}
      >
        {isPending ? "Creating override…" : "Create override"}
      </Button>
    </div>
  );
}

export function TransactionDrawer({
  row,
  open,
  onOpenChange,
}: {
  row: TransactionRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}): React.ReactElement {
  const { role } = useRole();
  const router = useRouter();
  const canEdit = isEditor(role);

  const copyRawEventId = (rawEventId: string): void => {
    void navigator.clipboard.writeText(rawEventId).then(() => {
      toast.success("Raw event ID copied");
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        {row !== null && (
          <>
            <SheetHeader className="space-y-1 text-left">
              <SheetTitle className="text-fg-primary">
                {row.product ?? row.entity ?? row.customerName ?? "Transaction"}
              </SheetTitle>
              <SheetDescription className="flex flex-wrap items-center gap-2">
                {row.customerName != null && <span>{row.customerName}</span>}
                {row.status != null && (
                  <Badge variant="outline" className="capitalize">
                    {row.status}
                  </Badge>
                )}
                {row.affiliate === true && (
                  <Badge variant="secondary">Affiliate</Badge>
                )}
                <span className="text-xs text-fg-subtle">
                  {formatDateTime(row.occurredAt ?? null)}
                </span>
              </SheetDescription>
            </SheetHeader>

            <div className="rounded-lg border border-line bg-glass p-3">
              <MoneyLine label="Gross" cents={row.grossCents} />
              <MoneyLine label="Processor fee" cents={row.processorFeeCents} />
              <MoneyLine label="Financing fee" cents={row.financingFeeCents} />
              <Separator className="my-1" />
              <MoneyLine label="Net" cents={row.netCents} emphasis />
            </div>

            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-fg-muted">
                Adjustments
              </h3>
              {(row.adjustments ?? []).length === 0 ? (
                <p className="text-sm text-fg-subtle">No adjustments.</p>
              ) : (
                <div className="space-y-2">
                  {(row.adjustments ?? []).map((a, i) => (
                    <AdjustmentItem key={a.id ?? String(i)} adjustment={a} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-fg-muted">
                Applied overrides
              </h3>
              {(row.appliedOverrides ?? []).length === 0 ? (
                <p className="text-sm text-fg-subtle">No overrides applied.</p>
              ) : (
                <div className="space-y-2">
                  {(row.appliedOverrides ?? []).map((o, i) => (
                    <OverrideItem key={o.id ?? String(i)} override={o} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-fg-muted">
                Provenance
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-fg-muted">Source</span>
                  <span className="capitalize text-fg-secondary">
                    {row.source ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="shrink-0 text-fg-muted">Raw event</span>
                  {row.rawEventId != null && row.rawEventId !== "" ? (
                    <button
                      type="button"
                      className="flex min-w-0 items-center gap-1.5 text-fg-secondary hover:text-fg-primary"
                      onClick={() => {
                        copyRawEventId(row.rawEventId ?? "");
                      }}
                    >
                      <span className="truncate font-mono text-xs">
                        {row.rawEventId}
                      </span>
                      <Copy className="h-3 w-3 shrink-0" />
                    </button>
                  ) : (
                    <span className="text-fg-subtle">—</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-fg-muted">Last synced</span>
                  <LastSynced at={row.lastSyncedAt ?? null} />
                </div>
              </div>
            </div>

            <Separator />

            {canEdit ? (
              <div>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-fg-muted">
                  Create override
                </h3>
                <OverrideForm
                  transactionId={row.id}
                  onCreated={() => {
                    router.refresh();
                    onOpenChange(false);
                  }}
                />
              </div>
            ) : (
              <p className="text-xs text-fg-subtle">
                Read-only access — editors and admins can create overrides.
              </p>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
