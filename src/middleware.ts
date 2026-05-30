import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Gate everything except the NextAuth endpoints, the sign-in page, and static
// assets. Unauthenticated requests are redirected to /signin by NextAuth.
export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== "/signin") {
    return NextResponse.redirect(new URL("/signin", req.nextUrl.origin));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|signin|_next/static|_next/image|favicon.ico).*)"],
};
