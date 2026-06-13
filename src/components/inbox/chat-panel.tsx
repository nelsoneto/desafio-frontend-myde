import { useEffect, useRef } from "react";
import { EmptyState } from "@/components/inbox/inbox-states";
import { MessageComposer } from "@/components/inbox/message-composer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
    <section className="flex min-h-0 flex-1 flex-col rounded-[1.25rem] border border-border bg-surface shadow-sm">
      <header className="flex items-center gap-4 border-b border-border px-5 py-4">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          size="icon"
          className="text-muted hover:text-title lg:hidden"
          aria-label="Voltar para a lista de conversas"
        >
          ←
        </Button>
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: conversation.avatarColor }}
        >
          {getInitials(conversation.contactName)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold text-title">{conversation.contactName}</h2>
          <p className="truncate text-sm text-muted">{formatPhoneNumber(conversation.contactPhone)}</p>
        </div>
        <Badge variant="success" className="hidden font-medium sm:inline-flex">
          Sincronizacao ativa
        </Badge>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={cn("flex", index % 2 === 0 ? "justify-start" : "justify-end")}>
                <Skeleton className="h-20 w-full max-w-md rounded-2xl" />
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
                      isAgent ? "bg-primary text-white" : "bg-surface-muted text-title",
                    )}
                  >
                    <p className="text-sm leading-6">{message.body}</p>
                    <div
                      className={cn(
                        "mt-2 flex items-center justify-end gap-2 text-[11px] font-medium",
                        isAgent ? "text-white/70" : "text-muted",
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
        <div className="border-t border-border px-5 py-4">
          <Button
            type="button"
            onClick={onRetry}
            className="px-4"
          >
            Recarregar conversa
          </Button>
        </div>
      ) : (
        <MessageComposer conversationId={conversation.id} disabled={false} />
      )}
    </section>
  );
}
