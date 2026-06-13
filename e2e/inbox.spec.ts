import { expect, test, type Page } from "@playwright/test";

async function mockInboxApi(page: Page) {
  const conversations = [
    {
      id: "conversation-1",
      contactName: "Marina Costa",
      contactPhone: "5511999998888",
      avatarColor: "#2563eb",
      lastMessage: "Preciso de ajuda com minha internet.",
      lastMessageAt: "2026-06-13T15:30:00.000Z",
      unread: 2,
    },
    {
      id: "conversation-2",
      contactName: "Joao Pedro",
      contactPhone: "551133338888",
      avatarColor: "#16a34a",
      lastMessage: "Obrigado pelo retorno.",
      lastMessageAt: "2026-06-13T14:00:00.000Z",
      unread: 0,
    },
  ];

  const messagesByConversation = new Map<string, Array<Record<string, string>>>([
    [
      "conversation-1",
      [
        {
          id: "message-1",
          body: "Oi, preciso de ajuda com minha internet.",
          createdAt: "2026-06-13T15:20:00.000Z",
          direction: "in",
          status: "read",
        },
      ],
    ],
    [
      "conversation-2",
      [
        {
          id: "message-2",
          body: "Obrigado pelo retorno.",
          createdAt: "2026-06-13T14:00:00.000Z",
          direction: "in",
          status: "read",
        },
      ],
    ],
  ]);

  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (!url.pathname.startsWith("/me") && !url.pathname.startsWith("/conversations") && url.pathname !== "/ai/suggest") {
      await route.fallback();
      return;
    }

    if (request.method() === "GET" && url.pathname === "/me") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "agent-1",
          name: "Nelson Silva",
          role: "Suporte NeoFribra",
        }),
      });
      return;
    }

    if (request.method() === "GET" && url.pathname === "/conversations") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(conversations),
      });
      return;
    }

    if (request.method() === "GET" && url.pathname.match(/^\/conversations\/[^/]+\/messages$/)) {
      const conversationId = url.pathname.split("/")[2];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(messagesByConversation.get(conversationId) ?? []),
      });
      return;
    }

    if (request.method() === "POST" && url.pathname.match(/^\/conversations\/[^/]+\/messages$/)) {
      const conversationId = url.pathname.split("/")[2];
      const payload = request.postDataJSON() as { text: string };
      const message = {
        id: `message-${Date.now()}`,
        body: payload.text,
        createdAt: "2026-06-13T16:00:00.000Z",
        direction: "out",
        status: "sent",
      };

      messagesByConversation.set(conversationId, [
        ...(messagesByConversation.get(conversationId) ?? []),
        message,
      ]);

      const conversation = conversations.find((item) => item.id === conversationId);
      if (conversation) {
        conversation.lastMessage = payload.text;
        conversation.lastMessageAt = message.createdAt;
        conversation.unread = 0;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(message),
      });
      return;
    }

    if (request.method() === "POST" && url.pathname === "/ai/suggest") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          suggestion: "Olá! Vou verificar isso para voce agora.",
        }),
      });
      return;
    }

    await route.fallback();
  });
}

test.beforeEach(async ({ page }) => {
  await mockInboxApi(page);
});

test("loads the inbox, filters conversations, and opens the selected chat", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByText("Atendimento WhatsApp")).toBeVisible();
  await expect(page.getByRole("button", { name: /Marina Costa/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Joao Pedro/i })).toBeVisible();

  await page.getByPlaceholder("Buscar por nome, telefone ou mensagem").fill("Marina");

  await expect(page.getByRole("button", { name: /Marina Costa/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Joao Pedro/i })).toHaveCount(0);

  await page.getByRole("button", { name: /Marina Costa/i }).click();

  await expect(page.getByRole("heading", { name: "Marina Costa" })).toBeVisible();
  await expect(
    page.getByText("Oi, preciso de ajuda com minha internet."),
  ).toBeVisible();
});

test("sends a message and reflects the optimistic result in the chat and list", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Marina Costa/i }).click();

  await page
    .getByLabel("Responder conversa")
    .fill("Pode deixar, vou verificar.");
  await page.getByRole("button", { name: "Enviar mensagem" }).click();

  await expect(page.getByText("Mensagem enviada.")).toBeVisible();
  await expect(page.getByText("Pode deixar, vou verificar.")).toHaveCount(2);
});

test("requests an AI suggestion and fills the composer", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Marina Costa/i }).click();
  await page.getByRole("button", { name: "Sugerir com IA" }).click();

  await expect(page.getByLabel("Responder conversa")).toHaveValue(
    "Olá! Vou verificar isso para voce agora.",
  );
  await expect(
    page.getByText("Sugestao preenchida no campo de resposta."),
  ).toBeVisible();
});