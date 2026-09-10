import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, authCookieOptions } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/") || pathname === "/login") return NextResponse.next();

  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  if (cookie && cookie === process.env.APP_PASSWORD) {
    // geser masa berlaku tiap kunjungan, jadi selama masih dipakai gak bakal expired
    const res = NextResponse.next();
    res.cookies.set(AUTH_COOKIE, cookie, authCookieOptions());
    return res;
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon-.*\\.png).*)"],
};
