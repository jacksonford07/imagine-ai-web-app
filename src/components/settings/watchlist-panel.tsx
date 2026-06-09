"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRole } from "@/context/role-provider";
import { setWatchlistStatus } from "@/lib/actions/settings";
import { formatRelative } from "@/lib/format";
import type {
  WatchlistItem,
  WatchlistStatus,
} from "@/lib/sources/bot/settings";

const STATUS_BADGE: Record<
  WatchlistStatus,
  { label: string; variant: "warning" | "secondary" | "outline" }
> = {
  open: { label: "open", variant: "warning" },
  acknowledged: { label: "acknowledged", variant: "secondary" },
  resolved: { label: "resolved", variant: "outline" },
};

function WatchlistRow({
  item,
  canEdit,
}: {
  item: WatchlistItem;
  canEdit: boolean;
}): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const badge = STATUS_BADGE[item.status];

  const transition = (status: WatchlistStatus): void => {
    startTransition(async () => {
      const result = await setWatchlistStatus(item.id, status);
      if (!result.ok) {
        toast.error("Could not update watchlist item", {
          description: result.error,
        });
        return;
      }
      toast.success(`Marked "${item.title}" ${status}`);
    });
  };

  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-fg-primary">
            {item.title}
          </p>
          {item.kind !== null && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {item.kind}
            </span>
          )}
        </div>
        {item.detail !== null && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {item.detail}
          </p>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {formatRelative(item.updatedAt ?? item.createdAt)}
      </span>
      <Badge variant={badge.variant}>{badge.label}</Badge>
      {canEdit && item.status === "open" && (
        <Button
          variant="outline"
          size="sm"
          className="h-7"
          disabled={isPending}
          onClick={() => {
            transition("acknowledged");
          }}
        >
          Acknowledge
        </Button>
      )}
      {canEdit && item.status !== "resolved" && (
        <Button
          variant="outline"
          size="sm"
          className="h-7"
          disabled={isPending}
          onClick={() => {
            transition("resolved");
          }}
        >
          Resolve
        </Button>
      )}
    </li>
  );
}

export function WatchlistPanel({
  items,
}: {
  items: WatchlistItem[];
}): React.ReactElement {
  const { role } = useRole();
  const canEdit = role === "admin";
  const [showResolved, setShowResolved] = useState(false);

  const active = items.filter((i) => i.status !== "resolved");
  const resolved = items.filter((i) => i.status === "resolved");
  const visible = showResolved ? items : active;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Watchlist
        </p>
        {resolved.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setShowResolved((v) => !v);
            }}
          >
            {showResolved
              ? "Hide resolved"
              : `Show resolved (${String(resolved.length)})`}
          </Button>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Nothing on the watchlist — fired alerts land here for triage.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-line-soft">
          {visible.map((item) => (
            <WatchlistRow key={item.id} item={item} canEdit={canEdit} />
          ))}
        </ul>
      )}
    </Card>
  );
}
