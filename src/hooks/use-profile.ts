import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/lib/api";
import { queryKeys } from "@/lib/query";

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
  });
}