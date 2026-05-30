import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Gate everything except the NextAuth endpoints, the sign-in page, and static
// assets. Unauthenticated requests are redirected to /signin by NextAuth.
// Local-only escape hatch: skip the auth gate when NOT in production AND the
// explicit DEV_AUTH_BYPASS flag is set. Both conditions required so prod can
// never bypass even if the flag leaks into the environment.
const devBypass =
  process.env.NODE_ENV !== "production" &&
  process.env.DEV_AUTH_BYPASS === "true";

export default auth((req) => {
  if (!devBypass && !req.auth && req.nextUrl.pathname !== "/signin") {
    return NextResponse.redirect(new URL("/signin", req.nextUrl.origin));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|signin|_next/static|_next/image|favicon.ico).*)"],
};
