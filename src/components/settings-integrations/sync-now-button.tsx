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

// Per-connector manual sync. Proxies to the bot's finance-sync-tick through
// the shared server action (secret stays server-side). Hidden for viewers —
// only admins/editors can trigger pulls.
export function SyncNowButton({
  source,
  label,
}: {
  source: string;
  label: string;
}): React.ReactElement | null {
  const { role } = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  if (!isEditor(role)) return null;

  const onClick = (): void => {
    startTransition(async () => {
      const result = await triggerSyncTick(source, pathname);
      if (!result.ok) {
        toast.error(`Sync failed for ${label}`, { description: result.error });
        return;
      }
      toast.success(`Sync triggered for ${label}`);
      router.refresh();
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
      Sync now
    </Button>
  );
}
