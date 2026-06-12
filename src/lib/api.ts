import {
  type AgentProfile,
  type Conversation,
  type Message,
  type SendMessageInput,
  type SuggestionResponse,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

type ApiErrorPayload = {
  message?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = "Nao foi possivel concluir a requisicao.";

    try {
      const payload = (await response.json()) as ApiErrorPayload;
      message = payload.message ?? message;
    } catch {
      const payload = await response.text();
      if (payload) {
        message = payload;
      }
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

function isMessage(value: unknown): value is Message {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "body" in value &&
    "createdAt" in value &&
    "direction" in value &&
    "status" in value
  );
}

export function getProfile() {
  return request<AgentProfile>("/me");
}

export function getConversations() {
  return request<Conversation[]>("/conversations");
}

export function getMessages(conversationId: string) {
  return request<Message[]>(`/conversations/${conversationId}/messages`);
}

export async function sendMessage({
  conversationId,
  text,
}: SendMessageInput) {
  const response = await request<unknown>(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });

  return isMessage(response) ? response : null;
}

export function getSuggestion(conversationId: string) {
  return request<SuggestionResponse>("/ai/suggest", {
    method: "POST",
    body: JSON.stringify({ conversationId }),
  });
}