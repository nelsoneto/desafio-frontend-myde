import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import { type Conversation, type Message, type SendMessageInput } from "@/lib/types";

type MutationContext = {
  previousMessages?: Message[];
  previousConversations?: Conversation[];
  optimisticId: string;
};

function updateConversationPreview(
  conversations: Conversation[] | undefined,
  conversationId: string,
  text: string,
  createdAt: string,
) {
  if (!conversations) {
    return conversations;
  }

  const next = conversations.map((conversation) =>
    conversation.id === conversationId
      ? {
          ...conversation,
          lastMessage: text,
          lastMessageAt: createdAt,
          unread: 0,
        }
      : conversation,
  );

  const activeConversation = next.find(
    (conversation) => conversation.id === conversationId,
  );

  if (!activeConversation) {
    return next;
  }

  return [
    activeConversation,
    ...next.filter((conversation) => conversation.id !== conversationId),
  ];
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onMutate: async ({ conversationId, text }: SendMessageInput) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: queryKeys.conversations }),
        queryClient.cancelQueries({ queryKey: queryKeys.messages(conversationId) }),
      ]);

      const optimisticId = `optimistic-${Date.now()}`;
      const createdAt = new Date().toISOString();

      const previousMessages = queryClient.getQueryData<Message[]>(
        queryKeys.messages(conversationId),
      );
      const previousConversations = queryClient.getQueryData<Conversation[]>(
        queryKeys.conversations,
      );

      queryClient.setQueryData<Message[]>(
        queryKeys.messages(conversationId),
        (current = []) => [
          ...current,
          {
            id: optimisticId,
            body: text,
            createdAt,
            direction: "out",
            status: "sent",
          },
        ],
      );

      queryClient.setQueryData<Conversation[]>(
        queryKeys.conversations,
        (current) => updateConversationPreview(current, conversationId, text, createdAt),
      );

      return {
        previousMessages,
        previousConversations,
        optimisticId,
      } satisfies MutationContext;
    },
    onError: (_error, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          queryKeys.messages(variables.conversationId),
          context.previousMessages,
        );
      }

      if (context?.previousConversations) {
        queryClient.setQueryData(
          queryKeys.conversations,
          context.previousConversations,
        );
      }
    },
    onSuccess: (response, variables, context) => {
      if (!response) {
        return;
      }

      queryClient.setQueryData<Message[]>(
        queryKeys.messages(variables.conversationId),
        (current = []) =>
          current.map((message) =>
            message.id === context.optimisticId ? response : message,
          ),
      );
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages(variables.conversationId),
      });
    },
  });
}