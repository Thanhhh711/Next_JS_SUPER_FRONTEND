"use client";

import RefreshToken from "@/components/refresh-token";
import { getAccessTokenFromLocalStorage, removeTokensFromLocalStorage } from "@/lib/utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AppContextType {
  isAuth: boolean;
  setIsAuth: (isAuth: boolean) => void;
}

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

const AppContext = createContext<AppContextType>({
  isAuth: false,
  setIsAuth: () => {},
});

export const useAppContext = () => useContext(AppContext);

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuthState] = useState(false);

  useEffect(() => {
    const accessToken = getAccessTokenFromLocalStorage();

    if (accessToken) {
      setIsAuthState(true);
    }
  }, []);
  const setIsAuth = (isAuth: boolean) => {
    if (isAuth) {
      setIsAuthState(true);
    } else {
      setIsAuthState(false);
      removeTokensFromLocalStorage();
    }
  };

  return (
    // Provide the client to your App

    <AppContext.Provider value={{ isAuth, setIsAuth }}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
        <RefreshToken />
      </QueryClientProvider>
    </AppContext.Provider>
  );
}
