export type AgentProfile = {
  id: string;
  name: string;
  role: string;
};

export type Conversation = {
  id: string;
  contactName: string;
  contactPhone: string;
  avatarColor: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
};

export type MessageDirection = "in" | "out";

export type MessageStatus = "read" | "sent" | "failed" | string;

export type Message = {
  id: string;
  body: string;
  createdAt: string;
  direction: MessageDirection;
  status: MessageStatus;
};

export type SendMessageInput = {
  conversationId: string;
  text: string;
};

export type SuggestionResponse = {
  suggestion: string;
};