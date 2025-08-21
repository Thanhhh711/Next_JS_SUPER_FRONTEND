/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import authApiRequest from "../../../../apiRequest/auth";

export async function POST(request: Request) {
  const cookieStore = cookies(); // cookie co ca set va get
  const refreshToken = (await cookieStore).get("refreshToken")?.value;

  if (!refreshToken) {
    return Response.json(
      {
        message: "Không tìm thấy refreshToken",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const { payload } = await authApiRequest.sRefreshToken({ refreshToken });

    // mục đích decode dể lấy thời gian hết hạn của 2 thằng này
    // sau đó dùng cái thời điểm đó set cookie
    const decodeAcessToken = jwt.decode(payload.data.accessToken) as { exp: number };
    const decodeRefreshToken = jwt.decode(payload.data.refreshToken) as { exp: number };

    (await cookieStore).set("accessToken", payload.data.accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: decodeAcessToken.exp * 1000, // thời gian hết hạn, chỉ cần nhân 1000 là ra
    });

    (await cookieStore).set("refreshToken", payload.data.refreshToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: decodeRefreshToken.exp * 1000, // thời gian hết hạn
    });
    return Response.json(payload);
  } catch (error: any) {
    return Response.json(
      {
        messasge: error.mesage ?? "Có lỗi xảy ra",
      },
      {
        status: 401,
      }
    );
  }
}
