import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { POLLING_INTERVALS } from "@/lib/query";
import { useConversations } from "./use-conversations";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

describe("useConversations", () => {
  const mockedUseQuery = vi.mocked(useQuery);

  afterEach(() => {
    vi.restoreAllMocks();
    mockedUseQuery.mockReset();
  });

  it("configura o useQuery com a chave de conversas e o intervalo de polling", async () => {
    const getConversationsSpy = vi.spyOn(api, "getConversations").mockResolvedValue([
      {
        id: "conversation-1",
        contactName: "Marina Costa",
        contactPhone: "5511999998888",
        avatarColor: "#2563eb",
        lastMessage: "Preciso de ajuda",
        lastMessageAt: "2026-06-13T15:30:00.000Z",
        unread: 2,
      },
    ]);
    mockedUseQuery.mockImplementation((options) => {
      void options.queryFn();

      return {
        data: undefined,
        isLoading: false,
        isError: false,
      } as never;
    });

    useConversations();

    expect(mockedUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["conversations"],
        refetchInterval: POLLING_INTERVALS.conversations,
      }),
    );
    expect(getConversationsSpy).toHaveBeenCalledTimes(1);
  });
});