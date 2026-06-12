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
    <form onSubmit={handleSubmit} className="border-t border-slate-200/80 px-5 py-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
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
          className="w-full resize-none border-none bg-transparent px-2 py-2 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
        />

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSuggest}
              disabled={disabled || aiSuggestMutation.isPending}
              className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800 transition hover:border-sky-300 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {aiSuggestMutation.isPending ? "Gerando sugestao..." : "Sugerir com IA"}
            </button>
            <span className="text-xs text-slate-500">
              A IA preenche o texto; o envio continua manual.
            </span>
          </div>

          <button
            type="submit"
            disabled={disabled || sendMessageMutation.isPending || !draft.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sendMessageMutation.isPending ? "Enviando..." : "Enviar mensagem"}
          </button>
        </div>
      </div>

      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-slate-500">
        {feedback}
      </p>
    </form>
  );
}
