import { Role } from "@/constants/type";
import { decodeToken } from "@/lib/utils";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const managePaths = ["/manage"];
const guestPaths = ["/guest"];
const privatePaths = [...managePaths, ...guestPaths];
const unAuthPaths = ["/login"];

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // chưa đăng nhập thì không cho vào privatePath
  if (privatePaths.some((path) => pathname.startsWith(path)) && !refreshToken) {
    const url = new URL("/login", request.url);

    url.searchParams.set("clearTokens", "true");

    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (refreshToken) {
    //2.1 nếu cố tình đăng nhập vào trang login sẽ redirect về trang chủ

    if (unAuthPaths.some((path) => pathname.startsWith(path)) && refreshToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 2.2đăng nhập rồi, mà access hết hạn
    if (privatePaths.some((path) => pathname.startsWith(path)) && !accessToken && refreshToken) {
      const url = new URL("/refresh-token", request.url);
      url.searchParams.set("refreshToken", refreshToken);
      url.searchParams.set("redirect", pathname);

      return NextResponse.redirect(url);
    }

    const role = decodeToken(refreshToken).role;
    // là guest nhưng vào manage
    const isGuestGoToManagePath = role === Role.Guest && managePaths.some((path) => pathname.startsWith(path));
    // Không phải Guest nhưng cố vào route guest
    const isNotGuestGoToGuestPath = role !== Role.Guest && guestPaths.some((path) => pathname.startsWith(path));

    if (isGuestGoToManagePath || isNotGuestGoToGuestPath) {
      return NextResponse.redirect(new URL(`/ `, request.url));
    }
  }

  // nếu cố tình vào kh đúng role thì về trang chủ

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/manage/:path*", "/guest/:path*", "/login"],
};
