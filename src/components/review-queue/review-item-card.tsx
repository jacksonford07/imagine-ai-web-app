"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GitMerge, SplitSquareHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRole } from "@/context/role-provider";
import { isEditor } from "@/lib/auth/role";
import { resolveReviewItem } from "@/lib/actions/review-queue";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

// Plain prop shapes (structurally identical to the server adapter's types —
// the adapter is `server-only`, so the page passes the rows straight through).
export interface ReviewCandidateView {
  customerId: string;
  source: string;
  sourceCustomerId: string | null;
  primaryEmail: string | null;
  name: string | null;
  matchMethod: string | null;
}

export interface ReviewItemView {
  id: string;
  source: string;
  sourceCustomerId: string | null;
  email: string | null;
  candidates: ReviewCandidateView[];
  createdAt: string | null;
}

const MATCH_METHOD_LABELS: Record<string, string> = {
  exact_email: "exact email",
  normalized_email: "normalised email",
};

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null;
}): React.ReactElement {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 text-xs text-fg-muted">{label}</span>
      <span className="truncate text-sm text-fg-primary">{value ?? "—"}</span>
    </div>
  );
}

export function ReviewItemCard({
  item,
}: {
  item: ReviewItemView;
}): React.ReactElement {
  const { role } = useRole();
  const canEdit = isEditor(role);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    item.candidates.length === 1 ? item.candidates[0].customerId : null,
  );

  const hasReason = reason.trim().length > 0;
  const canMerge = canEdit && hasReason && selectedId !== null && !isPending;
  const canKeepSeparate = canEdit && hasReason && !isPending;

  const resolve = (action: "merge" | "keep_separate"): void => {
    startTransition(async () => {
      const result = await resolveReviewItem({
        id: item.id,
        action,
        reason,
        candidateCustomerId:
          action === "merge" && selectedId !== null ? selectedId : undefined,
      });
      if (!result.ok) {
        toast.error("Could not resolve", { description: result.error });
        return;
      }
      toast.success(
        action === "merge"
          ? `Merged ${item.email ?? item.sourceCustomerId ?? "record"} into the selected customer`
          : `Kept ${item.email ?? item.sourceCustomerId ?? "record"} as a separate customer`,
      );
      router.refresh();
    });
  };

  return (
    <Card className="border-glass-border bg-glass p-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="outline" className="uppercase tracking-wide">
              {item.source}
            </Badge>
            <span className="text-xs text-fg-muted">
              incoming record · queued {formatRelative(item.createdAt)}
            </span>
          </div>
          <div className="space-y-2 rounded-lg border border-line bg-fill-hover p-3">
            <Field label="Email" value={item.email} />
            <Field label="Source customer ID" value={item.sourceCustomerId} />
            <Field label="Source" value={item.source} />
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs text-fg-muted">
            Existing candidate{item.candidates.length === 1 ? "" : "s"} (
            {item.candidates.length})
            {canEdit && item.candidates.length > 1 && " — select one to merge"}
          </p>
          {item.candidates.length === 0 ? (
            <div className="rounded-lg border border-line bg-fill-hover p-3 text-sm text-fg-muted">
              No candidates attached — this record can only be kept separate.
            </div>
          ) : (
            <div className="space-y-2">
              {item.candidates.map((candidate) => {
                const selected = selectedId === candidate.customerId;
                return (
                  <button
                    key={candidate.customerId}
                    type="button"
                    disabled={!canEdit || isPending}
                    onClick={() => {
                      setSelectedId(candidate.customerId);
                    }}
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition-colors",
                      selected
                        ? "border-primary/60 bg-primary/10"
                        : "border-line bg-fill-hover",
                      canEdit && !selected && "hover:border-glass-border-hover",
                      !canEdit && "cursor-default",
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-fg-primary">
                          {candidate.primaryEmail ?? "—"}
                        </span>
                        <Badge
                          variant="outline"
                          className="shrink-0 uppercase tracking-wide"
                        >
                          {candidate.source}
                        </Badge>
                      </div>
                      <Field label="Name" value={candidate.name} />
                      <Field
                        label="Source customer ID"
                        value={candidate.sourceCustomerId}
                      />
                      <Field
                        label="Matched via"
                        value={
                          candidate.matchMethod !== null
                            ? (MATCH_METHOD_LABELS[candidate.matchMethod] ??
                              candidate.matchMethod)
                            : null
                        }
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {canEdit ? (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <Input
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
            }}
            placeholder="Reason (required, written to the audit log)"
            disabled={isPending}
            className="h-8 min-w-56 flex-1"
          />
          <Button
            size="sm"
            className="h-8 gap-1.5"
            disabled={!canMerge}
            onClick={() => {
              resolve("merge");
            }}
          >
            <GitMerge className="h-3.5 w-3.5" />
            Merge
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5"
            disabled={!canKeepSeparate}
            onClick={() => {
              resolve("keep_separate");
            }}
          >
            <SplitSquareHorizontal className="h-3.5 w-3.5" />
            Keep separate
          </Button>
        </div>
      ) : (
        <p className="mt-5 border-t border-line pt-4 text-xs text-fg-muted">
          Read-only — editors and admins resolve queue items.
        </p>
      )}
    </Card>
  );
}
