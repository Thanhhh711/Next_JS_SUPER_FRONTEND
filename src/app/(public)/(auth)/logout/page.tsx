/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAppContext } from "@/components/app-provider";
import { getAccessTokenFromLocalStorage, getRefreshTokenFromLocalStorage } from "@/lib/utils";
import { useLogoutAuth } from "@/queries/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";

export default function LogoutPage() {
  const { mutateAsync } = useLogoutAuth();
  const ref = useRef<any>(null);
  const router = useRouter();

  const searchParams = useSearchParams();
  const { setIsAuth } = useAppContext();
  const refreshTokenFormUrl = searchParams.get("refreshToken");
  const accessTokenFormUrl = searchParams.get("accessToken");

  // đây là trang dùng để check là hết
  useEffect(() => {
    if (
      !ref.current &&
      ((refreshTokenFormUrl && refreshTokenFormUrl === getRefreshTokenFromLocalStorage()) ||
        (accessTokenFormUrl && accessTokenFormUrl === getAccessTokenFromLocalStorage()))
    ) {
      ref.current = mutateAsync;

      // tránh trường hợp gọi đi gọi lại nhiều lần
      mutateAsync().then(() => {
        setTimeout(() => {
          ref.current = null;
        }, 1000);
        setIsAuth(false);
        router.push("/login");
      });
    } else {
      // veef trang chu
      router.push("/");
    }
  }, [mutateAsync, router, refreshTokenFormUrl]);

  return <div>Loading ....</div>;
}
