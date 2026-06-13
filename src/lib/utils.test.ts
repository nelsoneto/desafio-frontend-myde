import {
  formatConversationTime,
  formatMessageStatus,
  formatMessageTime,
  formatPhoneNumber,
  getInitials,
} from "@/lib/utils";

const messageTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const conversationTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

describe("utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-13T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formata o horario da mensagem em pt-BR", () => {
    const value = "2026-06-13T15:30:00.000Z";

    expect(formatMessageTime(value)).toBe(
      messageTimeFormatter.format(new Date(value)),
    );
  });

  it("formata o horario da conversa do mesmo dia como hora e minuto", () => {
    const value = "2026-06-13T15:30:00.000Z";

    expect(formatConversationTime(value)).toBe(
      messageTimeFormatter.format(new Date(value)),
    );
  });

  it("formata o horario de conversa antiga com data e hora", () => {
    const value = "2026-06-12T15:30:00.000Z";

    expect(formatConversationTime(value)).toBe(
      conversationTimeFormatter.format(new Date(value)),
    );
  });

  it("monta as iniciais a partir das duas primeiras partes do nome", () => {
    expect(getInitials("Nelson Silva Oliveira")).toBe("NS");
  });

  it("formata numeros de telefone com 13 digitos", () => {
    expect(formatPhoneNumber("5511999998888")).toBe("+55 (11) 99999-8888");
  });

  it("formata numeros de telefone com 12 digitos", () => {
    expect(formatPhoneNumber("551133338888")).toBe("+55 (11) 3333-8888");
  });

  it("retorna o telefone original quando o tamanho nao e suportado", () => {
    expect(formatPhoneNumber("12345")).toBe("12345");
  });

  it("traduz status conhecidos de mensagem", () => {
    expect(formatMessageStatus("read")).toBe("Lida");
    expect(formatMessageStatus("sent")).toBe("Enviada");
    expect(formatMessageStatus("failed")).toBe("Falhou");
  });

  it("preserva status desconhecidos de mensagem", () => {
    expect(formatMessageStatus("queued")).toBe("queued");
  });
});