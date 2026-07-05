import { type NextRequest, NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/admin/auth";
import { getAuth } from "@/lib/auth";

const AUTH_ROUTES = new Set(["/login"]);

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getAuth().api.getSession({
    headers: request.headers,
  });

  const isAuthRoute = AUTH_ROUTES.has(pathname);
  const isApiAuth = pathname.startsWith("/api/auth");
  const isAdminRoute = isAdminPath(pathname);

  if (isApiAuth) {
    return NextResponse.next();
  }

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!session && (isAdminRoute || !isAuthRoute)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && session && !isAdminEmail(session.user.email)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/profile", "/login", "/admin", "/admin/:path*"],
};
