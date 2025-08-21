/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import authApiRequest from "@/apiRequest/auth";
import {
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage,
} from "@/lib/utils";
import jwt from "jsonwebtoken";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// khhoong check refresh token lại những trang nayd
const UNAUTHENICATED_PATH = ["/login", "/register", "/logout", "/refresh-token"];

export default function RefreshToken() {
  const pathName = usePathname();

  useEffect(() => {
    if (UNAUTHENICATED_PATH.includes(pathName)) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let interval: any = null;

    const checkAndRefreshToken = async () => {
      // không nên lấy access va refresh ra khỏi hàm này

      //   nên lấy ở trong để khi hàm này được gọi thì lấy được những tokken mới nhât
      const accessToken = getAccessTokenFromLocalStorage();
      const refreshToken = getRefreshTokenFromLocalStorage();

      // chưa đăng nhập thì cũng không chạy

      if (!accessToken || !refreshToken) return;
      const decodeAcessToken = jwt.decode(accessToken) as { exp: number; iat: number } | null;
      const decodeRefreshToken = jwt.decode(refreshToken) as { exp: number; iat: number } | null;

      if (!decodeAcessToken || !decodeRefreshToken) return;

      // thời điểm hết hạn của token được tính bằng epoch time
      // Còn khi get bằng new Date (). getTime() thì lấy được epochGTime

      const now = Math.round(new Date().getTime() / 10000);

      // trường hợp refresh hết hạn thì không xử lý nữa

      // ví dụ accessToken có thời gian hết hạn là 10s
      // thì mìn sẽ check bằng 1/3
      // thời gian tính bằng: decodeAcessToken.exp = now
      // thời gian hết hạn tính bằng decodeAcessToken.exp - decodeAcessToken.iat

      if (decodeAcessToken.exp - now < (decodeAcessToken.exp - decodeAcessToken.iat) / 3) {
        try {
          const res = await authApiRequest.refreshToken();

          setAccessTokenToLocalStorage(res.payload.data.accessToken);
          setRefreshTokenToLocalStorage(res.payload.data.refreshToken);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          clearInterval(interval);
        }
      }
    };

    checkAndRefreshToken();
    // time out phải bé hơn hết hạn của token
    // ví dụ accessToken là 10s thì interval là 1s
    const TIMEOUT = 1000;
    interval = setInterval(checkAndRefreshToken, TIMEOUT);

    return () => clearInterval(interval);
  }, [pathName]);

  return <div>refresh-token</div>;
}
