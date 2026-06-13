"use client";

import { startTransition, useState } from "react";
import { useAiSuggest } from "@/hooks/use-ai-suggest";
import { useSendMessage } from "@/hooks/use-send-message";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
        <Textarea
          id="message-draft"
          rows={3}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Escreva uma resposta clara e objetiva..."
          disabled={disabled || sendMessageMutation.isPending}
          className="resize-none border-none"
        />

        <div className="flex flex-col gap-3 border-t border-border pt-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSuggest}
              disabled={disabled || aiSuggestMutation.isPending}
              className="px-4"
            >
              {aiSuggestMutation.isPending ? "Gerando sugestao..." : "Sugerir com IA"}
            </Button>
            <span className="text-xs text-muted">
              A IA preenche o texto, mas o envio continua manual.
            </span>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={disabled || sendMessageMutation.isPending || !draft.trim()}
          >
            {sendMessageMutation.isPending ? "Enviando..." : "Enviar mensagem"}
          </Button>
        </div>
      </div>

      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-muted">
        {feedback}
      </p>
    </form>
  );
}
