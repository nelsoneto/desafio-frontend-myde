import { useMutation } from "@tanstack/react-query";
import { getSuggestion } from "@/lib/api";

export function useAiSuggest() {
  return useMutation({
    mutationFn: getSuggestion,
  });
}