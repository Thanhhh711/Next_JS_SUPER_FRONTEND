import envConfig, { defaultLocale } from "@/config";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import authApiRequest from "@/apiRequest/auth";
import { DishStatus, OrderStatus, TableStatus } from "@/constants/type";
import { clsx, type ClassValue } from "clsx";
import jwt from "jsonwebtoken";
import { UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { EntityError } from "./http";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Xóa đi ký tự đầu tiên của path

export const normalizePath = (path: string) => {
  return path.startsWith("/") ? path.slice(1) : path;
};

const isBrowser = typeof window !== "undefined"; // dự vào window để mà chúng ta phân biệt đâu là Server side và client side
//  Client side thì sẽ có đối tượng window

export const getAccessTokenFromLocalStorage = () => (isBrowser ? localStorage.getItem("accessToken") : null);

export const getRefreshTokenFromLocalStorage = () => (isBrowser ? localStorage.getItem("refreshToken") : null);
export const setAccessTokenToLocalStorage = (value: string) => isBrowser && localStorage.setItem("accessToken", value);
export const removeTokensFromLocalStorage = () => {
  if (isBrowser) {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
  }
};
export const setRefreshTokenToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem("refreshToken", value);

export const handleErrorApi = ({
  error,
  setError,
  duration,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setError?: UseFormSetError<any>;
  duration?: number;
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((item) => {
      setError(item.field, {
        type: "server",
        message: item.message,
      });
    });
  } else {
    toast.error(error?.payload?.message ?? "Lỗi không xác định", {
      duration: duration ?? 5000,
    });
  }
};

export const checkAndRefreshToken = async (param?: { onError: () => void; onSuccess?: () => void }) => {
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

  const now = new Date().getTime() / 1000 - 1;

  // trường hợp refresh hết hạn thì không xử lý nữa

  if (decodeRefreshToken.exp <= now) {
    removeTokensFromLocalStorage();
    return param?.onError && param?.onError();
  }

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
      param?.onSuccess && param.onSuccess();
    } catch (error) {
      param?.onError && param?.onError();
    }
  }
};

export const formatCurrency = (number: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(number);
};

export const getVietnameseDishStatus = (status: (typeof DishStatus)[keyof typeof DishStatus]) => {
  switch (status) {
    case DishStatus.Available:
      return "Có sẵn";
    case DishStatus.Unavailable:
      return "Không có sẵn";
    default:
      return "Ẩn";
  }
};

export const getVietnameseOrderStatus = (status: (typeof OrderStatus)[keyof typeof OrderStatus]) => {
  switch (status) {
    case OrderStatus.Delivered:
      return "Đã phục vụ";
    case OrderStatus.Paid:
      return "Đã thanh toán";
    case OrderStatus.Pending:
      return "Chờ xử lý";
    case OrderStatus.Processing:
      return "Đang nấu";
    default:
      return "Từ chối";
  }
};

export const getVietnameseTableStatus = (status: (typeof TableStatus)[keyof typeof TableStatus]) => {
  switch (status) {
    case TableStatus.Available:
      return "Có sẵn";
    case TableStatus.Reserved:
      return "Đã đặt";
    default:
      return "Ẩn";
  }
};

export const getTableLink = ({ token, tableNumber }: { token: string; tableNumber: number }) => {
  return envConfig.NEXT_PUBLIC_URL + `/${defaultLocale}/tables/` + tableNumber + "?token=" + token;
};
