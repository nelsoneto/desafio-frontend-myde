import { QueryClient } from "@tanstack/react-query";

export const POLLING_INTERVALS = {
  conversations: 8_000,
  messages: 4_000,
} as const;

export const queryKeys = {
  profile: ["profile"] as const,
  conversations: ["conversations"] as const,
  messages: (conversationId: string) =>
    ["conversations", conversationId, "messages"] as const,
};

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}