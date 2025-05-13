import evnConfig from "../config";
import { LoginResType } from "../schemaValidations/auth.schema";
import { getAccessTokenFromLocalStorage } from "./utils";

import {
  normalizePath,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage,
  removeTokensFromLocalStorage,
} from "./utils";
import { redirect } from "next/navigation";

type CustomOptions = Omit<RequestInit, "method"> & {
  baseUrl?: string | undefined;
};

const ENTITY_ERROR_STATUS = 422;
const AUTHENTICATION_ERROR_STATUS = 401;

type EntityErrorPayload = {
  message: string;
  errors: {
    field: string;
    message: string;
  }[];
};

export class HttpError extends Error {
  status: number;
  payload: {
    message: string;
    [key: string]: unknown;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor({ status, payload, message = "Lỗi HTTP" }: { status: number; payload: any; message?: string }) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export class EntityError extends HttpError {
  status: typeof ENTITY_ERROR_STATUS;
  payload: EntityErrorPayload;
  constructor({ status, payload }: { status: typeof ENTITY_ERROR_STATUS; payload: EntityErrorPayload }) {
    super({ status, payload, message: "Lỗi thực thể" });
    this.status = status;
    this.payload = payload;
  }
}

let clientLogoutRequest: Promise<Response> | null = null;

const isClient = typeof window !== "undefined";

console.log("isClient", isClient);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const request = async <Response>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  options?: CustomOptions | undefined
) => {
  console.log("option", options);

  let body: FormData | string | undefined = undefined;
  if (options?.body instanceof FormData) {
    body = options.body;
  } else if (options?.body) {
    body = JSON.stringify(options.body);
  }
  const baseHeaders: {
    [key: string]: string;
  } =
    body instanceof FormData
      ? {}
      : {
          "Content-Type": "application/json",
        };
  if (isClient) {
    const accessToken = getAccessTokenFromLocalStorage();
    if (accessToken) {
      baseHeaders.Authorization = `Bearer ${accessToken}`;
    }
  }
  // Nếu không truyền baseUrl (hoặc baseUrl = undefined) thì lấy từ envConfig.NEXT_PUBLIC_API_ENDPOINT
  // Nếu truyền baseUrl thì lấy giá trị truyền vào, truyền vào '' thì đồng nghĩa với việc chúng ta gọi API đến Next.js Server

  console.log("options?.baseUrl", options?.baseUrl);

  const baseUrl = options?.baseUrl === undefined ? evnConfig.NEXT_PUBLIC_API_ENDPOINT : options.baseUrl;
  // const baseUrl = options?.baseUrl === undefined ? evnConfig.NEXT_PUBLIC_URL : options.baseUrl;
  // const baseUrl = options?.baseUrl ?? evnConfig.NEXT_PUBLIC_API_ENDPOINT;
  console.log("url", url);
  console.log("baseUrl", baseUrl);

  const fullUrl = `${baseUrl}/${normalizePath(url)}`;
  console.log("fullUrl", fullUrl);

  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      ...baseHeaders,
      ...options?.headers,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    body,
    method,
  });
  const payload: Response = await res.json();
  const data = {
    status: res.status,
    payload,
  };

  // Interceptor là nời chúng ta xử lý request và response trước khi trả về cho phía component
  if (!res.ok) {
    if (res.status === ENTITY_ERROR_STATUS) {
      throw new EntityError(
        data as {
          status: 422;
          payload: EntityErrorPayload;
        }
      );
    } else if (res.status === AUTHENTICATION_ERROR_STATUS) {
      if (isClient) {
        if (!clientLogoutRequest) {
          clientLogoutRequest = fetch("/api/auth/logout", {
            method: "POST",
            body: null, // Logout mình sẽ cho phép luôn luôn thành công
            headers: {
              ...baseHeaders,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
          });

          try {
            await clientLogoutRequest;
          } catch (error) {
            console.log(error);
          } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            clientLogoutRequest = null;
            // Redirect trang Login có thể dẫn đến vòng lặp vô hạn
            //  nếu không được xử lý đunggs cách
            // Vì nếu rơi trường hợp tại trang Login mà, chúng ta có gọi các API cần accessToken
            // mà access đã xóa  => nên là nhảy lại vào đây dẫn đến vòng lặp
            location.href = `/login`;
          }
        }
      } else {
        // Đây là trường hợp khi mà chúng ta vẫn còn access token (còn hạn)
        // Và chúng ta gọi API ở Next.js Server (Route Handler , Server Component) đến Server Backend

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const accessToken = (options?.headers as any)?.Authorization.split("Bearer ")[1];

        redirect(`/logout?accessToken=${accessToken}`);
      }
    } else {
      throw new HttpError(data);
    }
  }
  // Đảm bảo logic dưới đây chỉ chạy ở phía client (browser)
  if (isClient) {
    const normalizeUrl = normalizePath(url);
    if (["api/auth/login", "api/guest/auth/login"].includes(normalizeUrl)) {
      const { accessToken, refreshToken } = (payload as LoginResType).data;
      setAccessTokenToLocalStorage(accessToken);
      setRefreshTokenToLocalStorage(refreshToken);
    } else if ("api/auth/token" === normalizeUrl) {
      const { accessToken, refreshToken } = payload as {
        accessToken: string;
        refreshToken: string;
      };
      setAccessTokenToLocalStorage(accessToken);
      setRefreshTokenToLocalStorage(refreshToken);
    } else if (["api/auth/logout", "api/guest/auth/logout"].includes(normalizeUrl)) {
      removeTokensFromLocalStorage();
    }
  }
  return data;
};

const http = {
  get<Response>(url: string, options?: Omit<CustomOptions, "body"> | undefined) {
    return request<Response>("GET", url, options);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post<Response>(url: string, body: any, options?: Omit<CustomOptions, "body"> | undefined) {
    return request<Response>("POST", url, { ...options, body });
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put<Response>(url: string, body: any, options?: Omit<CustomOptions, "body"> | undefined) {
    return request<Response>("PUT", url, { ...options, body });
  },
  delete<Response>(url: string, options?: Omit<CustomOptions, "body"> | undefined) {
    return request<Response>("DELETE", url, { ...options });
  },
};

export default http;
