import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { resolveRoleInfo } from "@/lib/auth/role";

// Edge-safe base config shared by the middleware and the full NextAuth
// instance in src/auth.ts. Anything that touches the bot adapter (which is
// server-only and not needed at the edge) lives in src/auth.ts — the
// middleware only decodes the JWT and maps token claims onto the session.
export const authConfig = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: { signIn: "/signin" },
  callbacks: {
    session({ session, token }) {
      // JWT claims are untyped (Record<string, unknown>); resolveRoleInfo
      // narrows them — a token without claims downgrades to viewer.
      const { role, fulfillmentAccess } = resolveRoleInfo(token);
      session.user.role = role;
      session.user.fulfillmentAccess = fulfillmentAccess;
      return session;
    },
  },
} satisfies NextAuthConfig;
