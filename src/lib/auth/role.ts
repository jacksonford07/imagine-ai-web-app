// Role model per PRD FR-12: Admin (everything), Editor (overrides, review
// queue, refresh), Viewer (read-only). Fulfillment access is a per-user flag.
// US-025 puts role/fulfillmentAccess on the session; until then we read both
// defensively and fall back to admin (matches the current allowlist behaviour
// and the dev bypass).

export type Role = "admin" | "editor" | "viewer";

export interface RoleInfo {
  role: Role;
  fulfillmentAccess: boolean;
}

const ROLES: readonly Role[] = ["admin", "editor", "viewer"];

export function resolveRoleInfo(sessionUser: unknown): RoleInfo {
  if (typeof sessionUser === "object" && sessionUser !== null) {
    const candidate = sessionUser as Record<string, unknown>;
    const rawRole = candidate.role;
    const role =
      typeof rawRole === "string" &&
      (ROLES as readonly string[]).includes(rawRole)
        ? (rawRole as Role)
        : "admin";
    const fulfillmentAccess =
      typeof candidate.fulfillmentAccess === "boolean"
        ? candidate.fulfillmentAccess
        : role === "admin";
    return { role, fulfillmentAccess };
  }
  return { role: "admin", fulfillmentAccess: true };
}
