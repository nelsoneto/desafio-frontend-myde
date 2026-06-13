import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { POLLING_INTERVALS } from "@/lib/query";
import { useMessages } from "./use-messages";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

describe("useMessages", () => {
  const mockedUseQuery = vi.mocked(useQuery);

  afterEach(() => {
    vi.restoreAllMocks();
    mockedUseQuery.mockReset();
  });

  it("nao busca mensagens ate que uma conversa seja selecionada", () => {
    const getMessagesSpy = vi.spyOn(api, "getMessages").mockResolvedValue([]);
    mockedUseQuery.mockReturnValue({
      data: undefined,
      fetchStatus: "idle",
    } as never);

    const result = useMessages(null);

    expect(mockedUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["messages"],
        enabled: false,
        refetchInterval: false,
      }),
    );
    expect(result.fetchStatus).toBe("idle");
    expect(getMessagesSpy).not.toHaveBeenCalled();
  });

  it("configura a query da conversa selecionada e usa o intervalo de polling", async () => {
    const getMessagesSpy = vi.spyOn(api, "getMessages").mockResolvedValue([
      {
        id: "message-1",
        body: "Oi, preciso de ajuda",
        createdAt: "2026-06-13T15:30:00.000Z",
        direction: "in",
        status: "read",
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

    useMessages("conversation-1");

    expect(mockedUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["conversations", "conversation-1", "messages"],
        enabled: true,
        refetchInterval: POLLING_INTERVALS.messages,
      }),
    );
    expect(getMessagesSpy).toHaveBeenCalledWith("conversation-1");
    expect(getMessagesSpy).toHaveBeenCalledTimes(1);
  });
});