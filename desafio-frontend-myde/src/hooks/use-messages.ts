import { useQuery } from "@tanstack/react-query";
import { getMessages } from "@/lib/api";
import { POLLING_INTERVALS, queryKeys } from "@/lib/query";

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: conversationId ? queryKeys.messages(conversationId) : ["messages"],
    queryFn: () => getMessages(conversationId as string),
    enabled: Boolean(conversationId),
    refetchInterval: conversationId ? POLLING_INTERVALS.messages : false,
  });
}