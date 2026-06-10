// Role model per PRD FR-12: Admin (everything), Editor (overrides, review
// queue, refresh), Viewer (read-only). Fulfillment access is a per-user flag.
// US-025: role + fulfillmentAccess are resolved from the bot DB at sign-in and
// carried on the JWT/session. A session user missing claims (stale pre-US-025
// token) downgrades to viewer — re-signing in refreshes the claims.

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
        : "viewer";
    const fulfillmentAccess =
      typeof candidate.fulfillmentAccess === "boolean"
        ? candidate.fulfillmentAccess
        : role === "admin";
    return { role, fulfillmentAccess };
  }
  // No session user only happens under the local dev bypass (the middleware
  // skipped the auth gate), so default to full access.
  return { role: "admin", fulfillmentAccess: true };
}

/** Edit capability: admins and editors can mutate (overrides, resolve, sync). */
export function isEditor(role: Role): boolean {
  return role === "admin" || role === "editor";
}
