import http from "../lib/http";
import {
  LoginBodyType,
  LoginResType,
  LogoutBodyType,
  RefreshTokenBodyType,
  RefreshTokenResType,
} from "../schemaValidations/auth.schema";

// đây là api của server backend
const authApiRequest = {
  refreshTokenRequest: null as Promise<{
    status: number;
    payload: RefreshTokenResType;
  }> | null,

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

  // severBackend
  sRefreshToken: (body: RefreshTokenBodyType) => {
    return http.post<RefreshTokenResType>("auth/refresh-token", body);
  },

  // client
  async refreshToken() {
    // tránh gọi lại 2 lần
    if (this.refreshTokenRequest) {
      return this.refreshTokenRequest;
    }

    this.refreshTokenRequest = http.post<RefreshTokenResType>("/api/auth/refresh-token", null, { baseUrl: "" });

    const result = await this.refreshTokenRequest;
    this.refreshTokenRequest = null;
    return result;
  },
};

export default authApiRequest;
