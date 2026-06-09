import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/auth/role";

declare module "next-auth" {
  interface Session {
    user: {
      role?: Role;
      fulfillmentAccess?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
    fulfillmentAccess?: boolean;
  }
}

// No JWT augmentation: @auth/core/jwt is not directly resolvable under pnpm
// (next-auth/jwt only re-exports it, which cannot be merged into). JWT already
// extends Record<string, unknown>, so role claims are written as-is in the jwt
// callback and narrowed back via resolveRoleInfo in the session callback.
