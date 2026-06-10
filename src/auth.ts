import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { getAdminUserByEmail } from "@/lib/sources/bot/users";

// Roles live in the bot DB (US-025): sign-in resolves the user via
// /internal/admin/users/by-email/:email. Unknown email -> denied. The
// resolved role + fulfillmentAccess are persisted on the JWT at sign-in so
// later requests (including edge middleware) never re-fetch.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      const email = user.email ?? "";
      if (email === "") return false;
      const known = await getAdminUserByEmail(email);
      return known.data !== null;
    },
    async jwt({ token, user }) {
      // `user` is only present on initial sign-in; signIn() already vouched
      // for the email, this fetch just pins role claims onto the token.
      if (user !== undefined && typeof user.email === "string") {
        const known = await getAdminUserByEmail(user.email);
        if (known.data !== null) {
          token.role = known.data.role;
          token.fulfillmentAccess = known.data.fulfillmentAccess;
        }
      }
      return token;
    },
  },
});
