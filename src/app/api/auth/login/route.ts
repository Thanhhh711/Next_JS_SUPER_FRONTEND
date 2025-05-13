import { cookies } from "next/headers";
import { LoginBodyType } from "../../../../schemaValidations/auth.schema";
import authApiRequest from "../../../../apiRequest/auth";
import { HttpError } from "../../../../lib/http";

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBodyType;

  console.log("body", body);

  const cookieStore = cookies(); // cookie co ca set va get

  try {
    const { payload } = await authApiRequest.sLogin(body);
    const { accessToken, refreshToken } = payload.data;

    // mục đích decode dể lấy thời gian hết hạn của 2 thằng này
    // sau đó dùng cái thời điểm đó set cookie
    const decodeAcessToken = JSON.parse(atob(accessToken.split(".")[1])) as { exp: number };
    const decodeRefreshToken = JSON.parse(atob(refreshToken.split(".")[1])) as { exp: number };

    (await cookieStore).set("acccessToken", accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: decodeAcessToken.exp * 1000, // thời gian hết hạn, chỉ cần nhân 1000 là ra
    });

    (await cookieStore).set("decodeRefreshToken", refreshToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: decodeRefreshToken.exp * 1000, // thời gian hết hạn
    });
    return Response.json(payload);
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, { status: error.status });
    } else {
      return Response.json(
        {
          messasge: "Có lỗi xảy ra",
        },
        {
          status: 500,
        }
      );
    }
  }
}
