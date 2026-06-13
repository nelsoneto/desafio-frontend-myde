import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageComposer } from "./message-composer";

const sendMessageState = {
  mutateAsync: vi.fn(),
  isPending: false,
};

const aiSuggestState = {
  mutateAsync: vi.fn(),
  isPending: false,
};

vi.mock("@/hooks/use-send-message", () => ({
  useSendMessage: () => sendMessageState,
}));

vi.mock("@/hooks/use-ai-suggest", () => ({
  useAiSuggest: () => aiSuggestState,
}));

describe("MessageComposer", () => {
  beforeEach(() => {
    sendMessageState.mutateAsync.mockReset();
    sendMessageState.isPending = false;
    aiSuggestState.mutateAsync.mockReset();
    aiSuggestState.isPending = false;
  });

  it("mantem o botao de envio desabilitado ate existir um rascunho preenchido", async () => {
    const user = userEvent.setup();

    render(<MessageComposer conversationId="conversation-1" disabled={false} />);

    const submitButton = screen.getByRole("button", {
      name: "Enviar mensagem",
    });
    const textarea = screen.getByLabelText("Responder conversa");

    expect(submitButton).toBeDisabled();

    await user.type(textarea, "Oi!");

    expect(submitButton).toBeEnabled();
  });

  it("envia a mensagem, limpa o rascunho e exibe feedback de sucesso", async () => {
    const user = userEvent.setup();
    sendMessageState.mutateAsync.mockResolvedValue(null);

    render(<MessageComposer conversationId="conversation-1" disabled={false} />);

    const textarea = screen.getByLabelText("Responder conversa");

    await user.type(textarea, "Pode deixar, vou verificar.");
    await user.click(screen.getByRole("button", { name: "Enviar mensagem" }));

    expect(sendMessageState.mutateAsync).toHaveBeenCalledWith({
      conversationId: "conversation-1",
      text: "Pode deixar, vou verificar.",
    });

    await waitFor(() => {
      expect(screen.getByText("Mensagem enviada.")).toBeInTheDocument();
      expect(textarea).toHaveValue("");
    });
  });

  it("exibe uma mensagem de erro quando o envio falha", async () => {
    const user = userEvent.setup();
    sendMessageState.mutateAsync.mockRejectedValue(new Error("network"));

    render(<MessageComposer conversationId="conversation-1" disabled={false} />);

    await user.type(screen.getByLabelText("Responder conversa"), "Oi");
    await user.click(screen.getByRole("button", { name: "Enviar mensagem" }));

    await waitFor(() => {
      expect(
        screen.getByText("Nao foi possivel enviar a mensagem."),
      ).toBeInTheDocument();
    });
  });

  it("preenche o rascunho com a sugestao da IA e exibe feedback", async () => {
    const user = userEvent.setup();
    aiSuggestState.mutateAsync.mockResolvedValue({
      suggestion: "Olá! Vou verificar isso para voce agora.",
    });

    render(<MessageComposer conversationId="conversation-1" disabled={false} />);

    await user.click(screen.getByRole("button", { name: "Sugerir com IA" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Responder conversa")).toHaveValue(
        "Olá! Vou verificar isso para voce agora.",
      );
      expect(
        screen.getByText("Sugestao preenchida no campo de resposta."),
      ).toBeInTheDocument();
    });
  });

  it("desabilita os controles quando o composer esta desabilitado", () => {
    render(<MessageComposer conversationId="conversation-1" disabled />);

    expect(screen.getByLabelText("Responder conversa")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Sugerir com IA" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Enviar mensagem" }),
    ).toBeDisabled();
  });
});