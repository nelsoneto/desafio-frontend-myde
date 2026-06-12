import { SidebarState } from "@/components/inbox/inbox-states";
import { type Conversation } from "@/lib/types";
import { cn, formatConversationTime, formatPhoneNumber, getInitials } from "@/lib/utils";

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

export function ConversationList({
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
    <aside className="flex h-full min-h-0 w-full flex-col rounded-[1.25rem] border border-white/70 bg-white/80 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur lg:max-w-95">
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
              <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
                      "w-full rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100",
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
                                  conversation.unread > 0 ? "bg-emerald-500" : "bg-slate-300",
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
