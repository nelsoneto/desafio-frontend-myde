"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState, startTransition } from "react";
import { useAiSuggest } from "@/hooks/use-ai-suggest";
import { useConversations } from "@/hooks/use-conversations";
import { useMessages } from "@/hooks/use-messages";
import { useProfile } from "@/hooks/use-profile";
import { useSendMessage } from "@/hooks/use-send-message";
import {
  cn,
  formatConversationTime,
  formatMessageStatus,
  formatMessageTime,
  formatPhoneNumber,
  getInitials,
} from "@/lib/utils";
import { type Conversation, type Message } from "@/lib/types";

type ConversationListProps = {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  isError: boolean;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSelectConversation: (conversationId: string) => void;
  onRetry: () => void;
};

type ChatPanelProps = {
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isError: boolean;
  onBack: () => void;
  onRetry: () => void;
};

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-6">
      <div className="max-w-sm rounded-[1.25rem] border border-white/60 bg-white/80 p-8 text-center shadow-[0_24px_80px_rgba(16,24,40,0.12)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
          Inbox Myde
        </p>
        <h2 className="mt-4 text-2xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function SidebarState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[1rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

function ConversationList({
  conversations,
  activeConversationId,
  isLoading,
  isError,
  searchTerm,
  onSearchTermChange,
  onSelectConversation,
  onRetry,
}: ConversationListProps) {
  return (
    <aside className="flex h-full min-h-0 w-full flex-col rounded-[1.25rem] border border-white/70 bg-white/80 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur lg:max-w-[380px]">
      <div className="px-2 pb-4 pt-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
          Conversas
        </p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Atendimento WhatsApp
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Busca local com sincronizacao periodica da API.
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Online
          </div>
        </div>
        <label className="mt-5 block">
          <span className="sr-only">Buscar conversas</span>
          <input
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Buscar por nome, telefone ou mensagem"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {isLoading ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-[1rem] border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded-full bg-slate-200" />
                    <div className="h-3 w-full rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && isError ? (
          <SidebarState
            title="Nao foi possivel carregar as conversas"
            description="Verifique a conexao com a API e tente novamente."
            action={
              <button
                type="button"
                onClick={onRetry}
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Tentar novamente
              </button>
            }
          />
        ) : null}

        {!isLoading && !isError && conversations.length === 0 ? (
          <SidebarState
            title="Nada encontrado"
            description="Ajuste os filtros ou aguarde novas interacoes chegarem pela API."
          />
        ) : null}

        {!isLoading && !isError && conversations.length > 0 ? (
          <ul className="space-y-3">
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;

              return (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => onSelectConversation(conversation.id)}
                    className={cn(
                      "w-full rounded-[1rem] border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100",
                      isActive
                        ? "border-sky-200 bg-sky-50 shadow-[0_16px_45px_rgba(14,165,233,0.16)]"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                    )}
                    aria-pressed={isActive}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
                        style={{ backgroundColor: conversation.avatarColor }}
                      >
                        {getInitials(conversation.contactName)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {conversation.contactName}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {formatPhoneNumber(conversation.contactPhone)}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <time
                              dateTime={conversation.lastMessageAt}
                              className="text-xs font-medium text-slate-500"
                            >
                              {formatConversationTime(conversation.lastMessageAt)}
                            </time>
                            <span
                              className={cn(
                                "inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-[11px] font-semibold",
                                conversation.unread > 0
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-100 text-slate-500",
                              )}
                            >
                              <span
                                className={cn(
                                  "h-2 w-2 rounded-sm",
                                  conversation.unread > 0
                                    ? "bg-emerald-500"
                                    : "bg-slate-300",
                                )}
                              />
                              {conversation.unread > 0
                                ? `${conversation.unread} nao lida${conversation.unread > 1 ? "s" : ""}`
                                : "Lida"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </aside>
  );
}

function MessageComposer({
  conversationId,
  disabled,
}: {
  conversationId: string;
  disabled: boolean;
}) {
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
      <div className="rounded-[1rem] border border-slate-200 bg-white p-3 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
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

function ChatPanel({
  conversation,
  messages,
  isLoading,
  isError,
  onBack,
  onRetry,
}: ChatPanelProps) {
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
          <h2 className="truncate text-lg font-semibold text-slate-950">
            {conversation.contactName}
          </h2>
          <p className="truncate text-sm text-slate-500">
            {formatPhoneNumber(conversation.contactPhone)}
          </p>
        </div>
        <div className="hidden rounded-xl bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 sm:block">
          Sincronizacao ativa
        </div>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  index % 2 === 0 ? "justify-start" : "justify-end",
                )}
              >
                <div className="h-20 w-full max-w-md animate-pulse rounded-[1rem] bg-slate-200/80" />
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
                <li
                  key={message.id}
                  className={cn("flex", isAgent ? "justify-end" : "justify-start")}
                >
                  <article
                    className={cn(
                      "max-w-[85%] rounded-[1rem] px-4 py-3 shadow-sm sm:max-w-[70%]",
                      isAgent
                        ? "bg-slate-950 text-white"
                        : "bg-white text-slate-900",
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
                      <time dateTime={message.createdAt}>
                        {formatMessageTime(message.createdAt)}
                      </time>
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

export function InboxApp() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const profileQuery = useProfile();
  const conversationsQuery = useConversations();
  const selectedConversation =
    conversationsQuery.data?.find(
      (conversation) => conversation.id === selectedConversationId,
    ) ?? null;
  const messagesQuery = useMessages(selectedConversationId);

  const filteredConversations = useMemo(() => {
    const conversations = conversationsQuery.data ?? [];
    const normalizedTerm = deferredSearchTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      return conversations;
    }

    return conversations.filter((conversation) =>
      [
        conversation.contactName,
        conversation.contactPhone,
        conversation.lastMessage,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedTerm),
    );
  }, [conversationsQuery.data, deferredSearchTerm]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9f4ff_0%,#f7f7ef_38%,#eff4ff_100%)] px-4 py-4 text-slate-900 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-4 lg:min-h-[calc(100vh-4rem)] lg:flex-row">
        <div className={cn("min-h-0 lg:flex", selectedConversationId ? "hidden lg:flex" : "flex")}>
          <ConversationList
            conversations={filteredConversations}
            activeConversationId={selectedConversationId}
            isLoading={conversationsQuery.isLoading}
            isError={conversationsQuery.isError}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onSelectConversation={setSelectedConversationId}
            onRetry={() => conversationsQuery.refetch()}
          />
        </div>

        <div className={cn("min-h-0 flex-1", selectedConversationId ? "flex" : "hidden lg:flex")}>
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <section className="rounded-[1.25rem] border border-white/70 bg-white/75 px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
                    Painel ativo
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {profileQuery.data?.name ?? "Carregando atendente..."}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {profileQuery.data?.role ?? "Sincronizando perfil com a API online."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                  <div className="rounded-xl bg-slate-100 px-3 py-2">
                    {conversationsQuery.data?.length ?? 0} conversas monitoradas
                  </div>
                  <div className="rounded-xl bg-sky-100 px-3 py-2 text-sky-900">
                    {selectedConversation ? "Chat em foco" : "Nenhum chat selecionado"}
                  </div>
                  <div
                    className={cn(
                      "rounded-xl px-3 py-2",
                      profileQuery.isError
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700",
                    )}
                  >
                    {profileQuery.isError ? "API instavel" : "API conectada"}
                  </div>
                </div>
              </div>
            </section>

            <ChatPanel
              conversation={selectedConversation}
              messages={messagesQuery.data ?? []}
              isLoading={messagesQuery.isLoading}
              isError={messagesQuery.isError}
              onBack={() => setSelectedConversationId(null)}
              onRetry={() => messagesQuery.refetch()}
            />
          </div>
        </div>
      </div>
    </main>
  );
}