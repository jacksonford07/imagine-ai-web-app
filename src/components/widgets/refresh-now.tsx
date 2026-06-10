"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRole } from "@/context/role-provider";
import { triggerSyncTick } from "@/lib/actions/sync";
import { isEditor } from "@/lib/auth/role";
import { cn } from "@/lib/utils";

// "Refresh now" header slot. With `tick`, asks the bot to run its finance
// sync (a specific connector, or all when tick="all") before re-rendering;
// without it, just re-fetches the page's server data. Triggering a sync is
// editor-only (enforced server-side in triggerSyncTick too) — viewers fall
// back to a plain data re-fetch.
export function RefreshNow({ tick }: { tick?: string }): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const { role } = useRole();
  const [isPending, startTransition] = useTransition();
  const canTick = tick !== undefined && isEditor(role);

  const onClick = (): void => {
    startTransition(async () => {
      if (canTick) {
        const source = tick === "all" ? undefined : tick;
        const result = await triggerSyncTick(source, pathname);
        if (!result.ok) {
          toast.error("Refresh failed", { description: result.error });
          return;
        }
        toast.success(
          source === undefined
            ? "Sync triggered for all sources"
            : `Sync triggered for ${source}`,
        );
      }
      router.refresh();
      if (!canTick) toast.success("Data refreshed");
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 gap-1.5"
      onClick={onClick}
      disabled={isPending}
    >
      <RefreshCw className={cn("h-3.5 w-3.5", isPending && "animate-spin")} />
      Refresh now
    </Button>
  );
}
