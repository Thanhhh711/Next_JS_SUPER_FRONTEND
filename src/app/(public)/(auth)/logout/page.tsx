/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getRefreshTokenFromLocalStorage } from "@/lib/utils";
import { useLogoutAuth } from "@/queries/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";

export default function LogoutPage() {
  const { mutateAsync } = useLogoutAuth();
  const ref = useRef<any>(null);
  const router = useRouter();

  const searchParams = useSearchParams();

  const refreshTokenFormUrl = searchParams.get("refreshToken");

  // đây là trang dùng để check là hết
  useEffect(() => {
    if (ref.current || refreshTokenFormUrl !== getRefreshTokenFromLocalStorage()) return;

    ref.current = mutateAsync;

    // tránh trường hợp gọi đi gọi lại nhiều lần
    mutateAsync().then(() => {
      setTimeout(() => {
        ref.current = null;
      }, 1000);

      router.push("/login");
    });
  }, [mutateAsync, router, refreshTokenFormUrl]);

  return <div>Loading ....</div>;
}
