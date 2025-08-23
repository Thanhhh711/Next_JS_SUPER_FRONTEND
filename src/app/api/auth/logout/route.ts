import { cookies } from "next/headers";
import authApiRequest from "../../../../apiRequest/auth";
import { HttpError } from "../../../../lib/http";

// loggour là luôn luôn thành côn công

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: Request) {
  const cookieStore = cookies(); // Lâyus ra được access và refresh
  const accessToken = (await cookieStore).get("accessToken")?.value;
  const refreshToken = (await cookieStore).get("refreshToken")?.value;

  console.log("accessToken", accessToken);
  console.log("refreshToken", refreshToken);

  (await cookieStore).delete("accessToken");

  (await cookieStore).delete("refreshToken");

  if (!accessToken || !refreshToken) {
    console.log("accessTokenAAAAAA", accessToken);
    console.log("refreshTokenAAA", refreshToken);

    return Response.json(
      {
        message: "Không có access hoặc refresh",
      },
      { status: 200 }
    );
  }
  try {
    const resutlt = authApiRequest.slogout({ accessToken, refreshToken });

    return Response.json((await resutlt).payload);
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(
        {
          messasge: "Có lỗi xảy ra",
        },
        {
          status: 200,
        }
      );
    }
  }
}
