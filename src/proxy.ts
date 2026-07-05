import { type NextRequest, NextResponse } from "next/server";

import { getAuth } from "@/lib/auth";

const AUTH_ROUTES = new Set(["/login"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getAuth().api.getSession({
    headers: request.headers,
  });

  const isAuthRoute = AUTH_ROUTES.has(pathname);
  const isApiAuth = pathname.startsWith("/api/auth");

  if (isApiAuth) {
    return NextResponse.next();
  }

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!session && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/profile", "/login"],
};
