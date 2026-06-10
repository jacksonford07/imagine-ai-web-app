"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { resolveRoleInfo, isEditor } from "@/lib/auth/role";

export interface SyncTickResult {
  ok: boolean;
  error: string | null;
}

// Proxies the per-source "refresh now" to the bot's finance sync tick. The
// internal secret stays server-side; the client only ever calls this action.
// Role is re-checked server-side (the client only hides the button) so
// viewers can't trigger bot-wide syncs. Without `source` the bot runs all
// connectors.
export async function triggerSyncTick(
  source: string | undefined,
  path: string,
): Promise<SyncTickResult> {
  const session = await auth();
  const { role } = resolveRoleInfo(session?.user);
  if (!isEditor(role)) {
    return { ok: false, error: "Editor role required" };
  }

  const baseUrl = process.env.BOT_API_URL;
  const secret = process.env.BOT_INTERNAL_SECRET;

  if (baseUrl === undefined || baseUrl === "") {
    return { ok: false, error: "BOT_API_URL is not configured" };
  }

  const qs =
    source !== undefined && source !== ""
      ? `?source=${encodeURIComponent(source)}`
      : "";

  try {
    const res = await fetch(`${baseUrl}/internal/finance-sync-tick${qs}`, {
      method: "POST",
      headers: { "x-internal-secret": secret ?? "" },
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, error: `bot responded ${String(res.status)}` };
    }
    revalidatePath(path);
    return { ok: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return { ok: false, error: `request failed: ${message}` };
  }
}
