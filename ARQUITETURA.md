# Arquitetura e Defesa Técnica

Este documento foi escrito para apoiar a apresentação do projeto em entrevista. A ideia é explicar a estrutura do código, o fluxo da aplicação e as principais decisões técnicas de forma objetiva e defensável.

## Objetivo do projeto

O app simula uma inbox de atendimento via WhatsApp. O frontend precisa listar conversas, abrir um chat, enviar mensagens com feedback imediato e oferecer uma sugestão de resposta gerada por IA.

O backend já existe, então o foco da implementação ficou em:

- composição de componentes;
- fluxo de dados;
- estados de loading, erro e vazio;
- sincronização com a API;
- clareza arquitetural;
- experiência de uso.

## Visão geral da estrutura

```text
src/
  app/
    globals.css
    layout.tsx
    page.tsx
  components/
    providers.tsx
    inbox/
      chat-panel.tsx
      conversation-list.tsx
      inbox-app.tsx
      inbox-states.tsx
      message-composer.tsx
    ui/
      badge.tsx
      button.tsx
      input.tsx
      skeleton.tsx
      textarea.tsx
  hooks/
    use-ai-suggest.ts
    use-conversations.ts
    use-messages.ts
    use-profile.ts
    use-send-message.ts
  lib/
    api.ts
    query.ts
    types.ts
    utils.ts
```

## Como a aplicação funciona

O fluxo principal é este:

1. A página raiz renderiza o container principal da inbox.
2. O provider global injeta um `QueryClient` do React Query na árvore.
3. O container carrega perfil, conversas e a conversa selecionada.
4. A lista lateral mostra as conversas e permite busca local.
5. O painel principal mostra mensagens, status do chat e composer.
6. O composer pode enviar mensagens ou pedir uma sugestão de IA.
7. O React Query mantém lista e histórico sincronizados via polling.

## App Router

### `src/app/globals.css`

É o ponto central de estilos globais.

- define os tokens visuais da aplicação;
- sustenta a identidade de cores, superfícies, bordas e tipografia;
- funciona como base para os componentes do domínio e para os componentes de UI.

Defesa técnica:

Eu preferi manter a linguagem visual centralizada no CSS global e deixar os componentes consumirem tokens e utilitários. Isso reduz inconsistência e evita espalhar decisões visuais estruturais por todo o JSX.

### `src/app/layout.tsx`

Responsável por configurar o layout global do App Router.

- Define `lang="pt-BR"`.
- Registra metadados da página.
- Aplica as fontes `Geist` e `Geist Mono`.
- Envolve a aplicação com o componente `Providers`.

Essa escolha deixa o bootstrap global pequeno e previsível.

### `src/app/page.tsx`

É a entrada da aplicação e renderiza diretamente `InboxApp`.

Eu mantive essa página propositalmente enxuta porque toda a regra de interface da feature mora no domínio da inbox, não na rota.

## Provider global

### `src/components/providers.tsx`

Responsável por instanciar o `QueryClientProvider`.

- Usa `useState(createQueryClient)` para garantir uma instância estável do client no ciclo de vida do app.
- Centraliza a infraestrutura de cache em um único ponto.

Essa separação evita espalhar configuração de React Query pelas telas.

## Container principal da feature

### `src/components/inbox/inbox-app.tsx`

Esse é o componente orquestrador da aplicação.

Responsabilidades:

- controla `selectedConversationId`;
- controla `searchTerm`;
- usa `useDeferredValue` para suavizar a busca local;
- consulta perfil, lista de conversas e mensagens da conversa ativa;
- decide o layout mobile e desktop;
- distribui dados e callbacks para `ConversationList` e `ChatPanel`.

Por que essa composição faz sentido:

- a tela tem um estado de coordenação claro;
- os componentes filhos recebem props objetivas;
- a regra de negócio não fica espalhada entre vários componentes visuais.

## Componentes da inbox

### `src/components/inbox/conversation-list.tsx`

Responsável pela lateral de conversas.

O que faz:

- mostra título e resumo da área;
- renderiza o campo de busca;
- exibe skeletons enquanto carrega;
- exibe erro com ação de retry;
- exibe estado vazio quando o filtro não encontra resultados;
- lista cada conversa com nome, telefone, hora, prévia da mensagem e indicador de não lidas.

Ponto importante para defender:

Esse componente é visual e interativo, mas não busca dados por conta própria. Ele recebe tudo via props. Isso melhora reuso, previsibilidade e testabilidade.

### `src/components/inbox/chat-panel.tsx`

Responsável pela área principal do chat.

O que faz:

- mostra o cabeçalho da conversa ativa;
- exibe botão de voltar no mobile;
- faz auto-scroll quando a conversa muda ou quando o número de mensagens muda;
- trata loading, erro e vazio;
- renderiza as bolhas separando mensagens de entrada e saída;
- mostra status e horário de cada mensagem;
- renderiza o `MessageComposer` quando o chat está saudável.

Defesa técnica:

O `useEffect` de auto-scroll foi concentrado aqui porque este é o ponto em que a lista visual de mensagens realmente existe. Assim, a regra fica perto do elemento que precisa ser controlado.

### `src/components/inbox/message-composer.tsx`

Responsável pelo envio da mensagem e pela integração com sugestão de IA.

O que faz:

- mantém o rascunho local com `useState`;
- chama a mutação de envio;
- chama a mutação de sugestão com IA;
- usa `startTransition` para preencher o rascunho sem tratar essa atualização como urgente;
- mostra feedback textual de sucesso e erro.

Defesa técnica:

O rascunho fica local porque ele é estado puramente de interface. Não faz sentido levar isso para React Query ou contexto global.

### `src/components/inbox/inbox-states.tsx`

Centraliza estados genéricos de interface.

- `EmptyState`: usado para mensagens de vazio e orientação ao usuário.
- `SidebarState`: usado na lateral para vazio e erro com possível ação.

Defesa técnica:

Separar estados reaproveitáveis evita repetição de markup e mantém consistência visual entre loading indireto, erro e vazio.

## Componentes base de UI

### `src/components/ui/button.tsx`

Botão reutilizável com variantes usando `class-variance-authority`.

- variantes como `default`, `outline`, `secondary`, `ghost`, `destructive` e `link`;
- tamanhos `default`, `sm`, `lg` e `icon`;
- suporte a composição via `Slot.Root`.

### `src/components/ui/input.tsx`

Input base usado na busca da lista de conversas.

- centraliza estilo, foco, borda, placeholder e estados desabilitados.

### `src/components/ui/textarea.tsx`

Textarea base do composer.

- mantém estilo consistente com a linguagem visual do restante da aplicação.

### `src/components/ui/badge.tsx`

Badge de status reutilizável.

- usado para online, sincronização, estado de leitura e conexão.

### `src/components/ui/skeleton.tsx`

Componente simples para placeholders de carregamento.

## Hooks

Os hooks encapsulam acesso à API, regras de cache e mutações.

### `src/hooks/use-profile.ts`

- busca o perfil do atendente em `/me`.
- usa `queryKeys.profile`.

### `src/hooks/use-conversations.ts`

- busca a lista de conversas em `/conversations`.
- aplica polling com `POLLING_INTERVALS.conversations`.

### `src/hooks/use-messages.ts`

- busca mensagens de uma conversa específica em `/conversations/{id}/messages`.
- só habilita a query quando existe `conversationId`.
- aplica polling apenas quando há conversa ativa.

### `src/hooks/use-send-message.ts`

Esse é um dos pontos mais importantes da implementação.

O hook:

- cria uma mutação para envio de mensagens;
- cancela queries relacionadas antes da mutação;
- cria uma mensagem otimista com id temporário;
- injeta essa mensagem imediatamente no cache das mensagens;
- atualiza a prévia da conversa na lateral;
- limpa o contador de não lidas da conversa ativa;
- faz rollback se a requisição falhar;
- substitui a mensagem otimista pela resposta real quando a API responde;
- invalida as queries no final para garantir consistência.

Defesa técnica:

Esse desenho equilibra UX e consistência. O usuário vê resposta imediata, mas o estado final ainda é reconciliado com a API.

### `src/hooks/use-ai-suggest.ts`

- dispara `POST /ai/suggest`;
- retorna a sugestão para preencher o rascunho do composer.

Defesa técnica:

A IA foi desacoplada do envio. Isso é importante porque a sugestão ajuda o atendente, mas a decisão final de mandar a mensagem continua humana.

## Camada `lib`

### `src/lib/types.ts`

Define os contratos de domínio usados na aplicação.

- `AgentProfile`
- `Conversation`
- `Message`
- `SendMessageInput`
- `SuggestionResponse`

Defesa técnica:

Tipagem centralizada reduz duplicação, melhora autocomplete e torna os contratos explícitos.

### `src/lib/api.ts`

Concentra o cliente HTTP.

O que faz:

- lê `NEXT_PUBLIC_API_URL` do ambiente;
- usa `fetch` nativo;
- define cabeçalhos JSON padrão;
- cria `ApiError` com mensagem e status HTTP;
- implementa `getProfile`, `getConversations`, `getMessages`, `sendMessage` e `getSuggestion`.

Defesa técnica:

Eu preferi uma camada de API pequena e explícita em vez de espalhar `fetch` dentro dos componentes. Isso reduz acoplamento e facilita manutenção.

### `src/lib/query.ts`

Centraliza a configuração do React Query.

- define intervalos de polling;
- define `queryKeys`;
- define o `QueryClient` com `staleTime`, `gcTime`, `retry` e `refetchOnWindowFocus`.

Defesa técnica:

Essa configuração num ponto único evita números mágicos espalhados pelo projeto e deixa a política de cache fácil de explicar.

### `src/lib/utils.ts`

Contém utilitários de apresentação.

- `cn` para merge de classes;
- formatação de hora e data;
- geração de iniciais;
- formatação de telefone;
- tradução de status da mensagem.

Defesa técnica:

Essas funções são pequenas, puras e isoladas. Isso tira formatação do JSX e melhora legibilidade.

## Arquivos de configuração da raiz

Além de `src/`, a raiz do projeto também comunica escolhas de stack e organização.

### `package.json`

- declara scripts de `dev`, `build`, `start` e `lint`;
- concentra dependências do app, como Next, React Query, Radix, shadcn e utilitários de estilo.

### `tsconfig.json`

- define a base da configuração TypeScript do projeto;
- ajuda a manter imports, tipos e checagem estática consistentes.

### `next.config.ts`

- concentra ajustes de configuração do Next quando necessários;
- mantém a aplicação alinhada ao runtime esperado do framework.

### `eslint.config.mjs`

- padroniza regras de qualidade e consistência do código;
- dá suporte ao script `npm run lint`.

### `postcss.config.mjs`

- integra o pipeline de CSS do projeto com Tailwind CSS 4.

### `components.json`

- registra a configuração usada pela camada de componentes no estilo shadcn;
- ajuda a manter consistência na geração e organização dos componentes de UI.

### `.env` e `.env.example`

- guardam a configuração de ambiente usada pela aplicação;
- neste projeto, o ponto principal é `NEXT_PUBLIC_API_URL`.

### `public/`

- fica reservado para assets estáticos públicos;
- mesmo quando pouco usado no desafio, continua sendo parte importante da estrutura padrão do Next.

## Fluxo de dados

```text
page.tsx
  -> InboxApp
    -> useProfile
    -> useConversations
    -> useMessages(conversationId)
    -> ConversationList
    -> ChatPanel
      -> MessageComposer
        -> useSendMessage
        -> useAiSuggest
```

## Responsividade e UX

As decisões principais de UX foram:

- no desktop, lista e chat aparecem lado a lado;
- no mobile, a navegação alterna entre lista e conversa ativa;
- skeletons ajudam a evitar salto visual durante carregamento;
- estados de vazio e erro foram tratados explicitamente;
- badges de status deixam a interface mais legível sem depender só de texto corrido.

## Por que escolhi shadcn com primitives

Essa é uma decisão importante para defender na entrevista.

Minha justificativa seria:

1. Eu queria velocidade de implementação sem abrir mão de controle fino da UI.
2. O shadcn não me prende a uma caixa-preta grande; ele entrega componentes editáveis no próprio código do projeto.
3. O uso de primitives do Radix ajuda em composição, acessibilidade e estrutura sem forçar aparência pronta.
4. Com `button`, `input`, `textarea`, `badge` e `skeleton`, eu resolvi a base visual mantendo consistência de spacing, estados e foco.
5. Para um desafio técnico, isso é um bom equilíbrio entre produtividade e clareza arquitetural.

Em outras palavras: eu não escolhi shadcn só para "ter componente pronto". Eu escolhi porque ele acelera a base sem esconder implementação e sem limitar customização.

## Por que mantive React Query

Minha justificativa seria:

1. O problema central do app é sincronização com API, não apenas estado local.
2. React Query resolve cache, retry, invalidação, polling e mutações sem eu precisar reinventar essa infraestrutura.
3. O fluxo de update otimista fica muito mais seguro quando o cache já está organizado por query keys.
4. Como a aplicação consulta lista de conversas e histórico de mensagens em ritmos diferentes, React Query encaixa bem na separação dessas responsabilidades.
5. Ele também reduz acoplamento entre componentes e chamadas HTTP.

Em resumo: continuar com React Query foi uma decisão pragmática. Eu mantive uma ferramenta que já era adequada ao problema e foquei energia no comportamento do produto.

## Por que usei IA para me ajudar

Aqui a resposta precisa ser madura.

Minha defesa seria:

1. Eu usei IA como acelerador de produtividade, não como substituto de entendimento técnico.
2. Ela ajuda a explorar alternativas, revisar nomenclatura, destravar boilerplate e ganhar velocidade em tarefas repetitivas.
3. Toda decisão incorporada no código foi validada manualmente contra o problema, a estrutura do projeto e o comportamento esperado.
4. Em um cenário real, usar IA com critério melhora throughput, desde que a pessoa continue responsável por arquitetura, qualidade e revisão.

Se quiser resumir em uma frase na entrevista:

"Usei IA para acelerar execução e comparar opções, mas a responsabilidade pelas decisões, pelos trade-offs e pela revisão final continuou sendo minha."

## IA no produto versus IA no desenvolvimento

Vale separar esses dois usos para evitar confusão:

- IA no produto: o botão `Sugerir com IA` chama o backend e preenche o rascunho da resposta.
- IA no desenvolvimento: serviu como apoio para produtividade e refinamento de implementação.

Essa separação mostra maturidade, porque uma coisa é feature de negócio; a outra é ferramenta de trabalho.

## Comando para limpar `.next` e reinstalar tudo

Esse é o fluxo que pode ser citado quando o ambiente fica inconsistente.

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

## Pontos fortes para destacar na entrevista

- Componentização com papéis claros.
- Boa separação entre UI, hooks e infraestrutura.
- Polling e atualização otimista bem encaixados no React Query.
- Integração de IA desacoplada do envio final.
- Escolhas pragmáticas de stack sem excesso de abstração.

## O que eu diria que faria com mais tempo

- testes de componentes e hooks;
- tratamento mais rico de falhas por tipo de erro da API;
- telemetry ou logs de comportamento do usuário;
- refinamento de acessibilidade com navegação por teclado mais extensa;
- possível evolução de polling para canal em tempo real se o backend suportasse.

## Resumo final

Este projeto foi estruturado para ser simples de entender, rápido de manter e coerente com o problema proposto. A arquitetura prioriza separação de responsabilidades, UX consistente e decisões fáceis de justificar tecnicamente.