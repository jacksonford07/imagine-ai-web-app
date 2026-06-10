"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { resolveRoleInfo, isEditor } from "@/lib/auth/role";

// Review-queue mutations (US-030). Resolutions proxy to the bot's
// /internal/admin/ceo/review-queue/:id/resolve with the internal secret
// server-side and carry the acting editor's email for the audit log. The bot
// enforces the required reason too; this guard just fails fast.

export interface ResolveReviewActionResult {
  ok: boolean;
  error: string | null;
}

async function readBotError(res: Response): Promise<string> {
  try {
    const json: unknown = await res.json();
    if (typeof json === "object" && json !== null && "error" in json) {
      const err = (json as { error: unknown }).error;
      if (typeof err === "object" && err !== null && "message" in err) {
        const message = (err as { message: unknown }).message;
        if (typeof message === "string" && message.length > 0) return message;
      }
    }
  } catch {
    // fall through to the status-based message
  }
  return `bot responded ${String(res.status)}`;
}

export async function resolveReviewItem(input: {
  id: string;
  action: "merge" | "keep_separate";
  reason: string;
  /** Required by the bot when the review row holds multiple candidates. */
  candidateCustomerId?: string;
}): Promise<ResolveReviewActionResult> {
  const baseUrl = process.env.BOT_API_URL;
  const secret = process.env.BOT_INTERNAL_SECRET;
  if (baseUrl === undefined || baseUrl === "") {
    return { ok: false, error: "BOT_API_URL is not configured" };
  }

  const session = await auth();
  const { role } = resolveRoleInfo(session?.user);
  if (!isEditor(role)) {
    return { ok: false, error: "Editor role required" };
  }
  // No session only happens under the local dev bypass (resolveRoleInfo
  // already defaulted to admin); use a sentinel actor so the call is traceable.
  const actorEmail = session?.user?.email ?? "dev-bypass@imagine.local";

  const reason = input.reason.trim();
  if (reason.length === 0) {
    return { ok: false, error: "A reason is required" };
  }

  try {
    const res = await fetch(
      `${baseUrl}/internal/admin/ceo/review-queue/${encodeURIComponent(input.id)}/resolve`,
      {
        method: "POST",
        headers: {
          "x-internal-secret": secret ?? "",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          action: input.action,
          reason,
          actorEmail,
          ...(input.candidateCustomerId !== undefined
            ? { candidateCustomerId: input.candidateCustomerId }
            : {}),
        }),
        cache: "no-store",
      },
    );
    if (!res.ok) {
      return { ok: false, error: await readBotError(res) };
    }
    // Layout re-renders on the client's router.refresh(), updating the badge.
    revalidatePath("/ceo/review-queue");
    return { ok: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return { ok: false, error: `request failed: ${message}` };
  }
}
