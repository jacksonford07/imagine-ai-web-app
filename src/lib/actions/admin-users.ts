"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { resolveRoleInfo, type Role } from "@/lib/auth/role";

// User-management mutations (US-026). All writes proxy to the bot's
// /internal/admin/users endpoints with the internal secret server-side and
// carry the acting admin's email — the bot rejects non-admin actors and
// protects the root admin, this guard just fails fast with a clear message.

export interface UserActionResult {
  ok: boolean;
  error: string | null;
}

const ROLES: readonly Role[] = ["admin", "editor", "viewer"];

interface Actor {
  email: string;
}

async function resolveActor(): Promise<
  { actor: Actor; error: null } | { actor: null; error: string }
> {
  const session = await auth();
  const { role } = resolveRoleInfo(session?.user);
  if (role !== "admin") {
    return { actor: null, error: "Admin role required" };
  }
  // No session only happens under the local dev bypass (resolveRoleInfo
  // already defaulted to admin); use a sentinel actor so the call is traceable.
  const email = session?.user?.email ?? "dev-bypass@imagine.local";
  return { actor: { email }, error: null };
}

async function callUsersApi(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body: Record<string, unknown>,
): Promise<UserActionResult> {
  const baseUrl = process.env.BOT_API_URL;
  const secret = process.env.BOT_INTERNAL_SECRET;
  if (baseUrl === undefined || baseUrl === "") {
    return { ok: false, error: "BOT_API_URL is not configured" };
  }

  const resolved = await resolveActor();
  if (resolved.actor === null) {
    return { ok: false, error: resolved.error };
  }

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        "x-internal-secret": secret ?? "",
        "content-type": "application/json",
      },
      body: JSON.stringify({ ...body, actorEmail: resolved.actor.email }),
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, error: `bot responded ${String(res.status)}` };
    }
    revalidatePath("/settings/users");
    return { ok: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return { ok: false, error: `request failed: ${message}` };
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function addDashboardUser(input: {
  email: string;
  role: Role;
  fulfillmentAccess: boolean;
}): Promise<UserActionResult> {
  const email = input.email.trim().toLowerCase();
  if (!isValidEmail(email)) {
    return { ok: false, error: "Enter a valid email address" };
  }
  if (!ROLES.includes(input.role)) {
    return { ok: false, error: "Unknown role" };
  }
  return callUsersApi("POST", "/internal/admin/users", {
    email,
    role: input.role,
    fulfillmentAccess: input.fulfillmentAccess,
  });
}

export async function updateDashboardUser(
  email: string,
  patch: { role?: Role; fulfillmentAccess?: boolean },
): Promise<UserActionResult> {
  if (patch.role !== undefined && !ROLES.includes(patch.role)) {
    return { ok: false, error: "Unknown role" };
  }
  return callUsersApi(
    "PATCH",
    `/internal/admin/users/${encodeURIComponent(email.toLowerCase())}`,
    { ...patch },
  );
}

export async function removeDashboardUser(
  email: string,
): Promise<UserActionResult> {
  return callUsersApi(
    "DELETE",
    `/internal/admin/users/${encodeURIComponent(email.toLowerCase())}`,
    {},
  );
}
