"use client";

import { startTransition, useState } from "react";
import { useAiSuggest } from "@/hooks/use-ai-suggest";
import { useSendMessage } from "@/hooks/use-send-message";

type MessageComposerProps = {
  conversationId: string;
  disabled: boolean;
};

export function MessageComposer({ conversationId, disabled }: MessageComposerProps) {
  const [draft, setDraft] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const sendMessageMutation = useSendMessage();
  const aiSuggestMutation = useAiSuggest();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = draft.trim();
    if (!text) {
      return;
    }

    setFeedback(null);

    try {
      await sendMessageMutation.mutateAsync({ conversationId, text });
      setDraft("");
      setFeedback("Mensagem enviada.");
    } catch {
      setFeedback("Nao foi possivel enviar a mensagem.");
    }
  }

  async function handleSuggest() {
    setFeedback(null);

    try {
      const response = await aiSuggestMutation.mutateAsync(conversationId);
      startTransition(() => {
        setDraft(response.suggestion);
      });
      setFeedback("Sugestao preenchida no campo de resposta.");
    } catch {
      setFeedback("Nao foi possivel gerar a sugestao com IA.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-border px-5 py-4">
      <div className="rounded-2xl border border-border bg-surface p-3 shadow-sm">
        <label className="sr-only" htmlFor="message-draft">
          Responder conversa
        </label>
        <textarea
          id="message-draft"
          rows={3}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Escreva uma resposta clara e objetiva..."
          disabled={disabled || sendMessageMutation.isPending}
          className="w-full resize-none border-none bg-transparent px-2 py-2 text-sm leading-6 text-title outline-none placeholder:text-muted"
        />

        <div className="flex flex-col gap-3 border-t border-border pt-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSuggest}
              disabled={disabled || aiSuggestMutation.isPending}
              className="rounded-xl border border-blue-400/20 bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-950/40 transition hover:bg-blue-500 hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {aiSuggestMutation.isPending ? "Gerando sugestao..." : "Sugerir com IA"}
            </button>
            <span className="text-xs text-muted">
              A IA preenche o texto; o envio continua manual.
            </span>
          </div>

          <button
            type="submit"
            disabled={disabled || sendMessageMutation.isPending || !draft.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sendMessageMutation.isPending ? "Enviando..." : "Enviar mensagem"}
          </button>
        </div>
      </div>

      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-muted">
        {feedback}
      </p>
    </form>
  );
}
