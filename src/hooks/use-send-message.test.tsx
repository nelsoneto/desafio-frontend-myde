import { act, renderHook, waitFor } from "@testing-library/react";
import * as api from "@/lib/api";
import { queryKeys } from "@/lib/query";
import { type Conversation, type Message } from "@/lib/types";
import { createQueryWrapper, createTestQueryClient } from "@/test/query-client";
import { useSendMessage } from "./use-send-message";

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

describe("useSendMessage", () => {
  const previousMessages: Message[] = [
    {
      id: "message-1",
      body: "Mensagem anterior",
      createdAt: "2026-06-13T15:30:00.000Z",
      direction: "in",
      status: "read",
    },
  ];

  const previousConversations: Conversation[] = [
    {
      id: "conversation-2",
      contactName: "Joao Pedro",
      contactPhone: "551133338888",
      avatarColor: "#16a34a",
      lastMessage: "Tudo certo",
      lastMessageAt: "2026-06-13T14:00:00.000Z",
      unread: 0,
    },
    {
      id: "conversation-1",
      contactName: "Marina Costa",
      contactPhone: "5511999998888",
      avatarColor: "#2563eb",
      lastMessage: "Mensagem anterior",
      lastMessageAt: "2026-06-13T13:00:00.000Z",
      unread: 2,
    },
  ];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("aplica updates otimistas e substitui a mensagem otimista apos sucesso", async () => {
    const deferred = createDeferred<Message | null>();
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    queryClient.setQueryData(queryKeys.messages("conversation-1"), previousMessages);
    queryClient.setQueryData(queryKeys.conversations, previousConversations);

    vi.spyOn(api, "sendMessage").mockReturnValue(deferred.promise);

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: createQueryWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        conversationId: "conversation-1",
        text: "Pode deixar, vou verificar.",
      });
    });

    await waitFor(() => {
      const messages = queryClient.getQueryData<Message[]>(
        queryKeys.messages("conversation-1"),
      );

      expect(messages).toHaveLength(2);
      expect(messages?.[1]?.body).toBe("Pode deixar, vou verificar.");
      expect(messages?.[1]?.id.startsWith("optimistic-")).toBe(true);
    });

    const optimisticConversations = queryClient.getQueryData<Conversation[]>(
      queryKeys.conversations,
    );

    expect(optimisticConversations?.[0]?.id).toBe("conversation-1");
    expect(optimisticConversations?.[0]?.lastMessage).toBe(
      "Pode deixar, vou verificar.",
    );
    expect(optimisticConversations?.[0]?.unread).toBe(0);

    deferred.resolve({
      id: "message-2",
      body: "Pode deixar, vou verificar.",
      createdAt: "2026-06-13T16:00:00.000Z",
      direction: "out",
      status: "sent",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const finalMessages = queryClient.getQueryData<Message[]>(
      queryKeys.messages("conversation-1"),
    );

    expect(finalMessages).toEqual([
      previousMessages[0],
      {
        id: "message-2",
        body: "Pode deixar, vou verificar.",
        createdAt: "2026-06-13T16:00:00.000Z",
        direction: "out",
        status: "sent",
      },
    ]);

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.conversations,
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.messages("conversation-1"),
    });
  });

  it("desfaz os updates otimistas quando a mutacao falha", async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    queryClient.setQueryData(queryKeys.messages("conversation-1"), previousMessages);
    queryClient.setQueryData(queryKeys.conversations, previousConversations);

    vi.spyOn(api, "sendMessage").mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await expect(
      result.current.mutateAsync({
        conversationId: "conversation-1",
        text: "Mensagem com erro",
      }),
    ).rejects.toThrow("network");

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(
      queryClient.getQueryData(queryKeys.messages("conversation-1")),
    ).toEqual(previousMessages);
    expect(queryClient.getQueryData(queryKeys.conversations)).toEqual(
      previousConversations,
    );

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.conversations,
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.messages("conversation-1"),
    });
  });
});