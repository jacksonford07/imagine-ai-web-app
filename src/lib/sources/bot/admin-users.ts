import "server-only";
import { z } from "zod";
import type { Role } from "@/lib/auth/role";
import type { SourceResult } from "../contract";
import { fetchSource } from "./client";

// Settings → Users domain adapter (US-026). Bot contract: GET
// /internal/admin/users returns the dashboard_users list. The endpoint ships
// concurrently (Phase 3), so the schema is tolerant: only `email` is
// required, unknown role values downgrade to viewer, and the list may arrive
// bare or wrapped in { users } / { rows }.

const rawUserRowSchema = z
  .object({
    email: z.string(),
    role: z.unknown().optional(),
    fulfillmentAccess: z.unknown().optional(),
    addedBy: z.unknown().optional(),
    isRoot: z.unknown().optional(),
    createdAt: z.unknown().optional(),
  })
  .passthrough();

type RawUserRow = z.infer<typeof rawUserRowSchema>;

// Wrapper objects deliberately not passthrough: extra keys are stripped and,
// without index signatures, the `in` narrowing below stays sound.
const rawUserListSchema = z.union([
  z.array(rawUserRowSchema),
  z.object({ users: z.array(rawUserRowSchema) }),
  z.object({ rows: z.array(rawUserRowSchema) }),
]);

export interface DashboardUser {
  email: string;
  role: Role;
  fulfillmentAccess: boolean;
  addedBy: string | null;
  isRoot: boolean;
  createdAt: string | null;
}

const ROLES: readonly Role[] = ["admin", "editor", "viewer"];

function toDashboardUser(raw: RawUserRow): DashboardUser {
  const role =
    typeof raw.role === "string" &&
    (ROLES as readonly string[]).includes(raw.role)
      ? (raw.role as Role)
      : "viewer";
  const addedBy = typeof raw.addedBy === "string" ? raw.addedBy : null;
  // Root admin: trust an explicit flag if the bot sends one; otherwise the
  // seeded row (US-019) is the admin with a system/empty added_by. The bot API
  // enforces the protection either way — this only drives the visible lock.
  const isRoot =
    raw.isRoot === true ||
    (role === "admin" &&
      (addedBy === null || addedBy === "system" || addedBy === "seed"));
  return {
    email: raw.email,
    role,
    fulfillmentAccess:
      typeof raw.fulfillmentAccess === "boolean"
        ? raw.fulfillmentAccess
        : false,
    addedBy,
    isRoot,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : null,
  };
}

export async function listDashboardUsers(): Promise<
  SourceResult<DashboardUser[]>
> {
  const result = await fetchSource("/internal/admin/users", rawUserListSchema);
  if (result.data === null) {
    return { data: null, error: result.error, fetchedAt: result.fetchedAt };
  }
  const rows = Array.isArray(result.data)
    ? result.data
    : "users" in result.data
      ? result.data.users
      : result.data.rows;
  return {
    data: rows.map(toDashboardUser),
    error: null,
    fetchedAt: result.fetchedAt,
  };
}
