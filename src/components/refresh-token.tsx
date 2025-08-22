/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { checkAndRefreshToken } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// khhoong check refresh token lại những trang nayd
const UNAUTHENICATED_PATH = ["/login", "/register", "/logout", "/refresh-token"];

export default function RefreshToken() {
  const pathName = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (UNAUTHENICATED_PATH.includes(pathName)) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let interval: any = null;

    checkAndRefreshToken({
      onError: () => {
        clearInterval(interval);
        router.push("/login");
      },
    });
    // time out phải bé hơn hết hạn của token
    // ví dụ accessToken là 10s thì interval là 1s
    const TIMEOUT = 1000;
    interval = setInterval(
      () =>
        checkAndRefreshToken({
          onError: () => {
            clearInterval(interval);
            router.push("/login");
          },
        }),
      TIMEOUT
    );

    return () => clearInterval(interval);
  }, [pathName, router]);

  return <div>refresh-token</div>;
}
