import { clsx, type ClassValue } from "clsx";
import { UseFormSetError } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { EntityError } from "./http";
import { toast } from "sonner";

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
