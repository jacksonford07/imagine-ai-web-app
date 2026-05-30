import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Comma-separated allowlist in ALLOWED_EMAILS. Empty list denies everyone.
export function isAllowedEmail(email: string, allowlist: string): boolean {
  const target = email.trim().toLowerCase();
  if (target === "") return false;
  const allowed = allowlist
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0);
  return allowed.includes(target);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: { signIn: "/signin" },
  callbacks: {
    signIn({ user }) {
      return isAllowedEmail(user.email ?? "", process.env.ALLOWED_EMAILS ?? "");
    },
  },
});
