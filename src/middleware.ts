import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const privatePaths = ["/manage"];
const unAuthPaths = ["/login"];

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = Boolean(request.cookies.get("accessToken")?.value);
  const refreshToken = Boolean(request.cookies.get("refreshToken")?.value);

  // chưa đăng nhập thì không cho vào privatePath
  if (privatePaths.some((path) => pathname.startsWith(path)) && !refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // đăng nhập rồi, mà access hết hạn
  if (privatePaths.some((path) => pathname.startsWith(path)) && !accessToken && refreshToken) {
    const url = new URL("/logout", request.url);
    url.searchParams.set("refreshToken", request.cookies.get("refreshToken")?.value ?? "");
    return NextResponse.redirect(url);
  }

  // đăng nhập rồi thì không cho login nữa
  if (unAuthPaths.some((path) => pathname.startsWith(path)) && refreshToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/manage/:path*", "/login"],
};
