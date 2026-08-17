"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import { joinBasePath } from "@/lib/app-path";

const AppBasePathContext = createContext("");

type AppBasePathProviderProps = {
  basePath: string;
  children: ReactNode;
};

export const AppBasePathProvider = ({
  basePath,
  children,
}: AppBasePathProviderProps) => {
  return (
    <AppBasePathContext.Provider value={basePath}>
      {children}
    </AppBasePathContext.Provider>
  );
};

export const useAppBasePath = (): string => useContext(AppBasePathContext);

export const useAppHref = () => {
  const basePath = useAppBasePath();
  return useCallback(
    (path: string) => joinBasePath(basePath, path),
    [basePath],
  );
};
