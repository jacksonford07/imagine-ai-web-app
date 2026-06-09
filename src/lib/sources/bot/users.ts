import "server-only";
import { z } from "zod";
import type { Role } from "@/lib/auth/role";
import type { SourceResult } from "../contract";
import { fetchSource } from "./client";

// Bot contract: GET /internal/admin/users/by-email/:email. Unknown emails
// 404, which fetchSource surfaces as { data: null } — sign-in treats that
// as denied. Tolerant on unknown role values (downgrade to viewer).

const rawAdminUserSchema = z.object({
  email: z.string(),
  role: z.unknown().optional(),
  fulfillmentAccess: z.unknown().optional(),
});

export interface AdminUser {
  email: string;
  role: Role;
  fulfillmentAccess: boolean;
}

const ROLES: readonly Role[] = ["admin", "editor", "viewer"];

function toAdminUser(raw: z.infer<typeof rawAdminUserSchema>): AdminUser {
  return {
    email: raw.email,
    role:
      typeof raw.role === "string" &&
      (ROLES as readonly string[]).includes(raw.role)
        ? (raw.role as Role)
        : "viewer",
    fulfillmentAccess:
      typeof raw.fulfillmentAccess === "boolean"
        ? raw.fulfillmentAccess
        : false,
  };
}

export async function getAdminUserByEmail(
  email: string,
): Promise<SourceResult<AdminUser>> {
  const result = await fetchSource(
    `/internal/admin/users/by-email/${encodeURIComponent(email)}`,
    rawAdminUserSchema,
  );
  return {
    ...result,
    data: result.data !== null ? toAdminUser(result.data) : null,
  };
}
