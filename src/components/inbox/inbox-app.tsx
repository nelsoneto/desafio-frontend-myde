"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ChatPanel } from "@/components/inbox/chat-panel";
import { ConversationList } from "@/components/inbox/conversation-list";
import { useConversations } from "@/hooks/use-conversations";
import { useMessages } from "@/hooks/use-messages";
import { useProfile } from "@/hooks/use-profile";
import { cn, getInitials } from "@/lib/utils";

const attendantName = "Nelson Silva";
const attendantInitials = getInitials(attendantName);
const attendantRole = "Suporte NeoFribra";

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
    <main className="min-h-screen bg-background px-4 py-4 text-title sm:px-6 lg:px-8 lg:py-8">
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
            <section className="rounded-[1.25rem] border border-border bg-surface px-5 py-4 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Painel ativo
                  </p>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white shadow-sm">
                      {attendantInitials}
                    </div>

                    <div>
                      <h1 className="text-2xl font-semibold tracking-tight text-title">
                        {attendantName}
                      </h1>
                      <p className="mt-1 text-sm text-muted">{attendantRole}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-muted">
                  <div className="rounded-xl bg-surface-muted px-3 py-2">
                    
                      {conversationsQuery.data?.length ?? 0} conversas monitoradas
                    
                  </div>
                  <div className="rounded-xl bg-green-500/10 px-3 py-2 text-green-500">
                      {selectedConversation ? "Chat em foco" : "Nenhum chat selecionado"}
                  </div>
                  <div
                    className={cn(
                      "rounded-xl px-3 py-2",
                      profileQuery.isError
                        ? "bg-surface-muted text-muted"
                        : "bg-green-500/10 text-green-500",
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