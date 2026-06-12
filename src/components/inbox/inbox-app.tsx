"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ChatPanel } from "@/components/inbox/chat-panel";
import { ConversationList } from "@/components/inbox/conversation-list";
import { useConversations } from "@/hooks/use-conversations";
import { useMessages } from "@/hooks/use-messages";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";

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
      [conversation.contactName, conversation.contactPhone, conversation.lastMessage]
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
