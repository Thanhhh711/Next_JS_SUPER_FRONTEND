import http from "../lib/http";
import { LoginBodyType, LoginResType, LogoutBodyType } from "../schemaValidations/auth.schema";

// đây là api của server backend
const authApiRequest = {
  // này do kiểu BE trả về như vậy
  sLogin: (body: LoginBodyType) => http.post<LoginResType>("/auth/login", body), // này được gọi từ server
  // Nếu client truyền rỗng thì gọi đến next serve
  login: (body: LoginBodyType) =>
    http.post<LoginResType>("/api/auth/login", body, {
      baseUrl: "",
    }),

  slogout: (body: LogoutBodyType & { accessToken: string }) =>
    http.post(
      "/auth/logout",
      {
        refreshToken: body.refreshToken,
      },
      {
        headers: {
          Authorization: `Bear ${body.accessToken}`,
        },
      }
    ),

  // slogout: (body: LogoutBodyType) =>
  //   http.post("/auth/logout", {
  //     refreshToken: body.refreshToken,
  //   }),

  logout: () =>
    http.post<LoginResType>("/api/auth/logout", null, {
      baseUrl: "",
    }),
};

export default authApiRequest;
