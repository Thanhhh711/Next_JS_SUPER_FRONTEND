/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { checkAndRefreshToken, getRefreshTokenFromLocalStorage } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function RefreshTokenPage() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const refreshTokenFormUrl = searchParams.get("refreshToken");
  const redirectPathname = searchParams.get("redirect");

  // đây là trang dùng để check là hết
  useEffect(() => {
    if (refreshTokenFormUrl && refreshTokenFormUrl === getRefreshTokenFromLocalStorage()) {
      checkAndRefreshToken({
        onSuccess: () => {
          router.push(redirectPathname || "/");
        },

        onError: () => {},
      });
    }
  }, [redirectPathname, router, refreshTokenFormUrl]);

  return <div>Refresh token ....</div>;
}
