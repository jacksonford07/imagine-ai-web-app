import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { isEditor, resolveRoleInfo } from "@/lib/auth/role";

// Edge-safe NextAuth instance: decodes the JWT and maps role claims onto the
// session (authConfig.callbacks.session) without pulling in the server-only
// bot adapter used by the full instance in src/auth.ts.
const { auth } = NextAuth(authConfig);

// Local-only escape hatch: skip the auth gate when NOT in production AND the
// explicit DEV_AUTH_BYPASS flag is set. Both conditions required so prod can
// never bypass even if the flag leaks into the environment. Downstream,
// resolveRoleInfo treats the missing session as admin + fulfillment access.
const devBypass =
  process.env.NODE_ENV !== "production" &&
  process.env.DEV_AUTH_BYPASS === "true";

// Section gates (US-025): /ceo/* any signed-in role; /fulfillment/* needs the
// fulfillment-access flag or admin; /settings/users is admin-only; the rest of
// /settings/* is admin or editor (viewers denied). /signin and /api/auth stay
// public via the matcher.
export default auth((req) => {
  if (devBypass) return NextResponse.next();

  const { pathname, origin } = req.nextUrl;
  if (!req.auth) {
    if (pathname === "/signin") return NextResponse.next();
    return NextResponse.redirect(new URL("/signin", origin));
  }

  const { role, fulfillmentAccess } = resolveRoleInfo(req.auth.user);

  if (
    pathname.startsWith("/fulfillment") &&
    role !== "admin" &&
    !fulfillmentAccess
  ) {
    return NextResponse.redirect(new URL("/ceo", origin));
  }

  if (pathname.startsWith("/settings/users")) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/ceo", origin));
    }
  } else if (pathname.startsWith("/settings") && !isEditor(role)) {
    return NextResponse.redirect(new URL("/ceo", origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|signin|_next/static|_next/image|favicon.ico).*)"],
};
