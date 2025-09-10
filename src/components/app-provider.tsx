/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import RefreshToken from "@/components/refresh-token";
import { decodeToken, getAccessTokenFromLocalStorage, removeTokensFromLocalStorage } from "@/lib/utils";
import { RoleType } from "@/types/jwt.types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { boolean } from "zod";

// interface AppContextType {
//   isAuth: boolean;
//   setIsAuth: (isAuth: boolean) => void;
// }

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // refetchOnWindowFocus => khi mà chuyển tab mới và quay lại trang chủ thì bị refetch lại data
      // refetchOnMount => bấm chuột qua trang khác thì bấm lại trang cũ thì bị refetch dữ liệu
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

const AppContext = createContext({
  isAuth: false,
  role: undefined as RoleType | undefined,
  setRole: (role?: RoleType | undefined) => {},
});

export const useAppContext = () => useContext(AppContext);

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<RoleType | undefined>();

  useEffect(() => {
    const accessToken = getAccessTokenFromLocalStorage();

    if (accessToken) {
      const role = decodeToken(accessToken).role;

      setRoleState(role);
    }
  }, []);

  const setRole = useCallback((role?: RoleType | undefined) => {
    setRoleState(role);

    if (!role) {
      removeTokensFromLocalStorage();
    }
  }, []);

  const isAuth = Boolean(role);

  return (
    // Provide the client to your App

    <AppContext.Provider value={{ role, setRole, isAuth }}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
        <RefreshToken />
      </QueryClientProvider>
    </AppContext.Provider>
  );
}
