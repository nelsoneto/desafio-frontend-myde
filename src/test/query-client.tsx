import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createQueryClient } from "@/lib/query";

export function createTestQueryClient() {
  const queryClient = createQueryClient();

  queryClient.setDefaultOptions({
    queries: {
      ...queryClient.getDefaultOptions().queries,
      retry: false,
      gcTime: Number.POSITIVE_INFINITY,
    },
    mutations: {
      ...queryClient.getDefaultOptions().mutations,
      retry: false,
    },
  });

  return queryClient;
}

export function createQueryWrapper(queryClient: QueryClient) {
  return function QueryWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}