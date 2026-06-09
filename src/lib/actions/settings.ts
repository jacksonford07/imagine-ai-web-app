"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { resolveRoleInfo } from "@/lib/auth/role";
import type { WatchlistStatus } from "@/lib/sources/bot/settings";

// US-033 writes: alert thresholds, watchlist status, commission config.
// All proxy to the bot with the internal secret (server-side only) and are
// admin-gated here regardless of what the client renders. Mutations carry
// actorEmail so the bot can audit-log the author.

export interface SettingsActionResult {
  ok: boolean;
  error: string | null;
}

interface Actor {
  email: string;
}

async function requireAdmin(): Promise<
  { actor: Actor; error: null } | { actor: null; error: string }
> {
  const session = await auth();
  const { role } = resolveRoleInfo(session?.user);
  if (role !== "admin") {
    return { actor: null, error: "Admin role required" };
  }
  // No session only happens under the local dev bypass.
  return {
    actor: { email: session?.user?.email ?? "dev-bypass@imagine.local" },
    error: null,
  };
}

async function botRequest(
  method: "PUT" | "POST",
  path: string,
  body: Record<string, unknown>,
): Promise<SettingsActionResult> {
  const baseUrl = process.env.BOT_API_URL;
  const secret = process.env.BOT_INTERNAL_SECRET;

  if (baseUrl === undefined || baseUrl === "") {
    return { ok: false, error: "BOT_API_URL is not configured" };
  }

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        "x-internal-secret": secret ?? "",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, error: `bot responded ${String(res.status)}` };
    }
    return { ok: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return { ok: false, error: `request failed: ${message}` };
  }
}

export interface AlertConfigInput {
  roasFloor: number | null;
  cpaCeilingCents: number | null;
  stalenessHours: number | null;
}

export async function saveAlertConfig(
  input: AlertConfigInput,
): Promise<SettingsActionResult> {
  const gate = await requireAdmin();
  if (gate.actor === null) return { ok: false, error: gate.error };

  const result = await botRequest("PUT", "/internal/admin/ceo/alert-config", {
    roasFloor: input.roasFloor,
    cpaCeilingCents: input.cpaCeilingCents,
    stalenessHours: input.stalenessHours,
    actorEmail: gate.actor.email,
  });
  if (result.ok) revalidatePath("/settings/alerts");
  return result;
}

export async function setWatchlistStatus(
  id: string,
  status: WatchlistStatus,
): Promise<SettingsActionResult> {
  const gate = await requireAdmin();
  if (gate.actor === null) return { ok: false, error: gate.error };

  const result = await botRequest(
    "POST",
    `/internal/admin/ceo/watchlist/${encodeURIComponent(id)}/status`,
    { status, actorEmail: gate.actor.email },
  );
  if (result.ok) revalidatePath("/settings/alerts");
  return result;
}

export interface CommissionConfigInput {
  /** Whole percent in 10% steps, 0–100. Sent to the bot as a 0–1 fraction. */
  ratePercent: number;
  minEarnedCents: number;
  reason: string;
}

export async function saveCommissionConfig(
  input: CommissionConfigInput,
): Promise<SettingsActionResult> {
  const gate = await requireAdmin();
  if (gate.actor === null) return { ok: false, error: gate.error };

  if (input.reason.trim() === "") {
    return { ok: false, error: "A reason is required" };
  }
  if (
    !Number.isInteger(input.ratePercent) ||
    input.ratePercent % 10 !== 0 ||
    input.ratePercent < 0 ||
    input.ratePercent > 100
  ) {
    return { ok: false, error: "Rate must be in 10% steps between 0 and 100" };
  }
  if (!Number.isInteger(input.minEarnedCents) || input.minEarnedCents < 0) {
    return { ok: false, error: "Minimum earned must be a non-negative amount" };
  }

  const result = await botRequest(
    "PUT",
    "/internal/admin/ceo/commission-config",
    {
      rate: input.ratePercent / 100,
      ratePercent: input.ratePercent,
      minEarnedCents: input.minEarnedCents,
      reason: input.reason.trim(),
      actorEmail: gate.actor.email,
    },
  );
  if (result.ok) revalidatePath("/settings/commission");
  return result;
}
