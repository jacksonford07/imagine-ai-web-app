"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { resolveRoleInfo, isEditor } from "@/lib/auth/role";

export interface CreateOverrideInput {
  transactionId: string;
  field: string;
  valueCents: number;
  reason: string;
  path: string;
}

export interface CreateOverrideResult {
  ok: boolean;
  error: string | null;
}

// Proxies the drawer's override form to POST /internal/admin/ceo/overrides.
// Role is re-checked server-side (the client only hides the form), the reason
// is mandatory per the audit contract, and actorEmail comes from the session —
// never from the client.
export async function createTransactionOverride(
  input: CreateOverrideInput,
): Promise<CreateOverrideResult> {
  const session = await auth();
  const { role } = resolveRoleInfo(session?.user);
  if (!isEditor(role)) {
    return { ok: false, error: "viewers cannot create overrides" };
  }

  const reason = input.reason.trim();
  if (reason === "") {
    return { ok: false, error: "a reason is required" };
  }
  if (!Number.isFinite(input.valueCents)) {
    return { ok: false, error: "override value must be a number" };
  }

  const baseUrl = process.env.BOT_API_URL;
  const secret = process.env.BOT_INTERNAL_SECRET;
  if (baseUrl === undefined || baseUrl === "") {
    return { ok: false, error: "BOT_API_URL is not configured" };
  }

  const actorEmail = session?.user?.email ?? "dev-bypass@imagine.local";

  try {
    const res = await fetch(`${baseUrl}/internal/admin/ceo/overrides`, {
      method: "POST",
      headers: {
        "x-internal-secret": secret ?? "",
        "content-type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        targetType: "transaction",
        targetId: input.transactionId,
        field: input.field,
        valueCents: Math.round(input.valueCents),
        reason,
        actorEmail,
      }),
    });
    if (!res.ok) {
      return { ok: false, error: `bot responded ${String(res.status)}` };
    }
    revalidatePath(input.path);
    return { ok: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return { ok: false, error: `request failed: ${message}` };
  }
}
