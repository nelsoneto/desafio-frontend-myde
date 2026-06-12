import { useEffect, useRef } from "react";
import { EmptyState } from "@/components/inbox/inbox-states";
import { MessageComposer } from "@/components/inbox/message-composer";
import { type Conversation, type Message } from "@/lib/types";
import { cn, formatMessageStatus, formatMessageTime, formatPhoneNumber, getInitials } from "@/lib/utils";

type ChatPanelProps = {
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isError: boolean;
  onBack: () => void;
  onRetry: () => void;
};

export function ChatPanel({ conversation, messages, isLoading, isError, onBack, onRetry }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    element.scrollTop = element.scrollHeight;
  }, [conversation?.id, messages.length]);

  if (!conversation) {
    return (
      <div className="hidden min-h-0 flex-1 lg:flex">
        <EmptyState
          title="Escolha uma conversa"
          description="Selecione um contato para visualizar o historico, responder com update otimista e usar a sugestao de IA."
        />
      </div>
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-[1.25rem] border border-white/70 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_24%,#f6f8fb_100%)] shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur">
      <header className="flex items-center gap-4 border-b border-slate-200/80 px-5 py-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-950 lg:hidden"
          aria-label="Voltar para a lista de conversas"
        >
          ←
        </button>
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: conversation.avatarColor }}
        >
          {getInitials(conversation.contactName)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold text-slate-950">{conversation.contactName}</h2>
          <p className="truncate text-sm text-slate-500">{formatPhoneNumber(conversation.contactPhone)}</p>
        </div>
        <div className="hidden rounded-xl bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 sm:block">
          Sincronizacao ativa
        </div>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={cn("flex", index % 2 === 0 ? "justify-start" : "justify-end")}>
                <div className="h-20 w-full max-w-md animate-pulse rounded-2xl bg-slate-200/80" />
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && isError ? (
          <EmptyState
            title="Erro ao carregar o chat"
            description="A conversa nao pode ser sincronizada agora. Tente novamente em instantes."
          />
        ) : null}

        {!isLoading && !isError && messages.length === 0 ? (
          <EmptyState
            title="Nenhuma mensagem ainda"
            description="Inicie o atendimento manualmente ou gere uma sugestao de resposta com IA."
          />
        ) : null}

        {!isLoading && !isError && messages.length > 0 ? (
          <ol className="space-y-3">
            {messages.map((message) => {
              const isAgent = message.direction === "out";

              return (
                <li key={message.id} className={cn("flex", isAgent ? "justify-end" : "justify-start")}>
                  <article
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%]",
                      isAgent ? "bg-slate-950 text-white" : "bg-white text-slate-900",
                    )}
                  >
                    <p className="text-sm leading-6">{message.body}</p>
                    <div
                      className={cn(
                        "mt-2 flex items-center justify-end gap-2 text-[11px] font-medium",
                        isAgent ? "text-slate-300" : "text-slate-500",
                      )}
                    >
                      <span>{formatMessageStatus(message.status)}</span>
                      <time dateTime={message.createdAt}>{formatMessageTime(message.createdAt)}</time>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        ) : null}
      </div>

      {isError ? (
        <div className="border-t border-slate-200/80 px-5 py-4">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Recarregar conversa
          </button>
        </div>
      ) : (
        <MessageComposer conversationId={conversation.id} disabled={false} />
      )}
    </section>
  );
}
