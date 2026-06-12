import { useQuery } from "@tanstack/react-query";
import { getConversations } from "@/lib/api";
import { POLLING_INTERVALS, queryKeys } from "@/lib/query";

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: getConversations,
    refetchInterval: POLLING_INTERVALS.conversations,
  });
}