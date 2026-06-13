# Inbox de Atendimento WhatsApp | Myde

Aplicação frontend em Next.js para atendimento via WhatsApp com lista de conversas, histórico de mensagens, envio com atualização otimista e sugestão de resposta com IA.

O briefing original do desafio foi preservado em [README.challenge.md](README.challenge.md). Este arquivo passa a ser o guia principal para instalar, executar e validar o projeto.

## Visão geral

- Framework: Next.js 16 com App Router.
- Linguagem: TypeScript.
- Estado assíncrono: React Query.
- UI: Tailwind CSS 4 com componentes base inspirados em shadcn/ui e primitives do Radix.
- Integração externa: API hospedada em AWS via `NEXT_PUBLIC_API_URL`.

## Pré-requisitos

- Node.js 20 ou superior.
- npm 10 ou superior.
- Acesso à internet para consumir a API hospedada.

## Configuração do ambiente

O projeto já possui os arquivos `.env` e `.env.example` com a URL da API configurada.

Valor esperado:

```env
NEXT_PUBLIC_API_URL=https://8tymn68hp9.execute-api.us-east-1.amazonaws.com
```

Se quiser seguir o fluxo padrão do Next.js com arquivo local:

### PowerShell

```powershell
Copy-Item .env.example .env.local
```

### Git Bash

```bash
cp .env.example .env.local
```

## Instalação

Na raiz do projeto, execute:

```bash
npm install
```

## Execução em desenvolvimento

Inicie o servidor local com:

```bash
npm run dev
```

Depois abra:

```text
http://localhost:3000
```

## O que esperar ao abrir o app

Ao carregar a aplicação, o fluxo esperado é:

1. O layout global monta o `QueryClientProvider`.
2. O app consulta o perfil do atendente em `/me`.
3. A lista de conversas começa a sincronizar com polling.
4. Ao selecionar uma conversa, o histórico de mensagens é carregado e também passa a sincronizar.
5. O usuário pode enviar mensagens manualmente ou usar o botão de sugestão com IA para preencher o rascunho.

Se a API estiver acessível, o painel deve mostrar o estado de conexão como ativo e renderizar conversas reais.

## Scripts disponíveis

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:watch
npm run test:e2e
```

### O que cada script faz

- `npm run dev`: sobe o ambiente de desenvolvimento.
- `npm run build`: gera a build de produção.
- `npm run start`: sobe a aplicação já buildada.
- `npm run lint`: executa o ESLint do projeto.
- `npm run test`: executa a suite unitária e de componentes com Vitest.
- `npm run test:watch`: executa o Vitest em modo watch.
- `npm run test:e2e`: executa os testes E2E com Playwright.

## Testes automatizados

### Stack adotada

- Unitários e componentes: Vitest + React Testing Library.
- E2E: Playwright com mocks locais da API.

### Instalação do navegador do Playwright

Na primeira execução de E2E, instale o Chromium usado pelo Playwright:

```bash
npx playwright install chromium
```

### O que os testes cobrem hoje

- Utilitários de formatação em `src/lib/utils.ts`.
- Hooks de dados e mutação com React Query.
- Fluxos do `MessageComposer`, incluindo envio e sugestão de IA.
- Fluxo principal da inbox no navegador: listar, filtrar, selecionar conversa, enviar mensagem e preencher sugestão.

### Observação sobre os E2E

Os testes E2E não dependem da API AWS real. O Playwright intercepta as requisições e responde com mocks locais, para manter a suíte determinística e repetível.

Para uma explicação detalhada de cada teste e um roteiro rápido para apresentação, consulte [TESTS.md](TESTS.md).

## Fluxo recomendado para validação local

1. Instale dependências com `npm install`.
2. Rode `npm run dev`.
3. Abra `http://localhost:3000`.
4. Confirme se a lateral exibe conversas.
5. Selecione uma conversa para abrir o histórico.
6. Teste o botão `Sugerir com IA`.
7. Teste o envio de mensagem para validar o update otimista.
8. Execute `npm run lint`.
9. Execute `npm run test`.
10. Execute `npx playwright install chromium` se for a primeira vez.
11. Execute `npm run test:e2e`.
12. Execute `npm run build`.

## Build e execução de produção

Para validar o fluxo de produção localmente:

```bash
npm run build
npm run start
```

## Estrutura do projeto

```text
src/
  app/
  components/
    inbox/
    ui/
  hooks/
  lib/
```

- `src/app`: entrada do App Router, layout global e página raiz.
- `src/components/inbox`: componentes de domínio da inbox.
- `src/components/ui`: componentes base reutilizáveis.
- `src/hooks`: hooks de dados e mutações com React Query.
- `src/lib`: cliente da API, tipos, configuração do React Query e utilitários.

Para uma explicação completa da arquitetura e das decisões técnicas, consulte [ARQUITETURA.md](ARQUITETURA.md).

## Troubleshooting

### A aplicação não sobe ou o cache do Next ficou inconsistente

Se o `.next` estiver corrompido ou você quiser reinstalar tudo do zero, use um destes fluxos.

### PowerShell

```powershell
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npm run dev
```

### Git Bash

```bash
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### A API não responde

- Confirme o valor de `NEXT_PUBLIC_API_URL`.
- Verifique sua conexão com a internet.
- Recarregue a página depois de iniciar o app.
- Se necessário, copie novamente `.env.example` para `.env.local`.

### O lint ou build falhou

Use primeiro:

```bash
npm run lint
npm run build
```

Se o problema persistir, limpe `.next` e reinstale as dependências com o fluxo acima.

## Resumo técnico

Este projeto foi organizado para separar claramente responsabilidade de UI, estado assíncrono e integração com API. A lista de conversas, o chat e o composer são desacoplados em componentes específicos, enquanto os hooks encapsulam o acesso à API e a política de sincronização.
