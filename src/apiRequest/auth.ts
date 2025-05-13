import http from "../lib/http";
import { LoginBodyType, LoginResType } from "../schemaValidations/auth.schema";

// đây là api của server backend
const authApiRequest = {
  // này do kiểu BE trả về như vật
  sLogin: (body: LoginBodyType) => http.post<LoginResType>("/auth/login", body), // này được gọi từ server
  // Nếu client truyền rỗng thì gọi đến next serve
  login: (body: LoginBodyType) =>
    http.post<LoginResType>("/api/auth/login", body, {
      baseUrl: "",
    }),
};

export default authApiRequest;
