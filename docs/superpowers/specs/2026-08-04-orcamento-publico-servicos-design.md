# Formulário público de orçamento + Serviços no banco — Imperpoços

Data: 2026-08-04
Status: Em revisão

## Objetivo

Mover os 4 serviços de marketing (Piscinas, Manta asfáltica, Lajes e
paredes, Venda de impermeabilizantes) de um array fixo no frontend para uma
tabela própria servida por API pública, e adicionar um formulário público de
pedido de orçamento em página dedicada `/orcamento`, persistindo os contatos
no banco via `Contato`.

**Abordagem escolhida:** Abordagem A — nova tabela `ServicoMarketing` + rotas
públicas + página `/orcamento` + CTA adicional no hero.

## Goals

- Serviços persistidos em `ServicoMarketing`, servidos via `GET /publico/servicos`
  (sem auth) e renderizados em `HomePage` e `ServicosPage`.
- Formulário público em `/orcamento` com campos: nome, telefone (obrigatório),
  e-mail (obrigatório), serviço desejado, mensagem.
- Submissão persistida em `Contato` (`canal=FORMULARIO`, `tipo=DUVIDA`,
  `status=NOVO`), com serviço + mensagem em `Contato.descricao` no formato
  `Serviço: {servico}\n\n{mensagem}`.
- Vínculo de `clienteId` **se** já existir `Cliente` com mesmo e-mail ou
  telefone — sem criar cliente novo, sem cadastro de usuário.
- Proteção anti-bot via Turnstile (mesmo padrão de `/auth/cadastro`).
- CTA adicional "Solicitar orçamento" no hero, mantendo WhatsApp como primário.

## Non-goals

- **Não** criar `Cliente`/`User` automaticamente ao submeter o formulário.
- **Não** criar novo enum `TipoContato` (usa `DUVIDA`).
- **Não** criar painel admin de CRUD de serviços (apenas seed; tarefa futura).
- **Não** gerar notificação interna para novos orçamentos (decisão do usuário).
- **Não** validar telefone além de obrigatório e não vazio.
- **Não** alterar `contatoSchema`/schemas de `packages/shared`.

## Decisões

- Serviços vêm do banco via `GET /publico/servicos`; `HomePage` e `ServicosPage`
  consomem um hook `useServicos()` em vez do array `SERVICOS`.
- `lib/landing.ts` perde `SERVICOS`; mantém `WHATSAPP_*`, `ETAPAS`, `REGIAO`.
- Página `/orcamento` segue o padrão visual de `RegisterPage`
  (`Card`/`Input`/`Label`/`Button`/`Turnstile`) em `section` estilo `ContatoPage`.
- Sucesso do envio substitui o formulário por mensagem de confirmação.
- Hero ganha um terceiro CTA (`Link` → `/orcamento`); 3 CTAs empilhados em
  coluna no mobile, em linha no desktop.

## Arquitetura

### Backend — Prisma

Novo model em `apps/api/prisma/schema.prisma`:

```prisma
model ServicoMarketing {
  id         Int      @id @default(autoincrement())
  titulo     String   @db.VarChar(120)
  descricao  String   @db.VarChar(500)
  icone      String   @db.VarChar(100)
  ordem      Int      @default(0)
  ativo      Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

**Seed** (`apps/api/prisma/seed.ts`): upsert idempotente dos 4 serviços atuais
(título, descrição, ícone SVG path, ordem 1–4).

### Backend — Serviços

- **`src/services/servicoMarketing.service.ts`** (novo):
  `listarAtivos()` → `findMany({ where: { ativo: true }, orderBy: { ordem: "asc" } })`.
- **`src/services/contato.service.ts`**: novo método `criarPublico({ nome,
  telefone, email, descricao })`:
  1. `prisma.cliente.findFirst({ where: { OR: [{ email }, { telefone }] } })`.
  2. Se encontrado, usa `clienteId`; senão `clienteId: null`.
  3. `prisma.contato.create` com `canal: FORMULARIO`, `tipo: DUVIDA`,
     `status: NOVO`, `nome`, `telefone`, `email`, `descricao`, `clienteId`.
  - Não cria `Cliente`, não cria `User`.

### Backend — Rotas

- **`src/routes/publico.routes.ts`** (novo), montado em
  `app.use("/publico", publicoRoutes)` no `src/index.ts`:
  - `GET /publico/servicos` → `listarAtivos()`.
  - `POST /publico/orcamento` → zod local `{ nome, telefone, email?,
    servico?, mensagem?, turnstileToken? }`; `servico` ≤ 150 chars e
    `mensagem` ≤ 700 chars (máx. `descricao` = 9 + 150 + 2 + 700 = 861 chars,
    abaixo do `Contato.descricao` VarChar 1000);
    `verificarTurnstile(body.turnstileToken ?? "", req.ip)`;
    `descricao = ["Serviço:", servico, "", mensagem].filter(Boolean).join("\n")`;
    `criarPublico(...)`; 201 com projeção segura
    `{ id, nome, canal, tipo, status, createdAt }`.

### Web — Client API (`src/lib/api.ts`)

- `interface ServicoMarketing { id; titulo; descricao; icone; ordem }`.
- `listarServicos(): Promise<ServicoMarketing[]>` → `GET /publico/servicos`.
- `interface SolicitarOrcamentoInput { nome; telefone; email?; servico?; mensagem?; turnstileToken? }`.
- `solicitarOrcamento(input)` → `POST /publico/orcamento` (reusa o `request` e o
  tratamento de erro `.status`/`.details` existente).

### Web — Página e componentes

- **`src/pages/OrcamentoPage.tsx`** (novo): formulário com nome, telefone
  (obrigatório), e-mail (obrigatório), select de serviço (via `listarServicos`),
  textarea de mensagem e `Turnstile`; estados `loading`/`error`; confirmação no
  sucesso.
- **`src/App.tsx`**: rota `/orcamento` com `LandingLayout`.
- **`src/lib/useServicos.ts`** (novo): hook com estados `loading`/`error`/`servicos`.
- **`src/pages/HomePage.tsx`** e **`src/pages/ServicosPage.tsx`**: passam a usar
  `useServicos()`.
- **`src/components/landing/Hero.tsx`**: terceiro CTA `Link` "Solicitar orçamento".

## Dependências

- Sem novas dependências (Prisma/Express no API; React Router + `ui/*` no web).
- Migração `migrate dev --create-only` para o novo model + seed idempotente.

## Verificação

- `GET /publico/servicos` retorna os 4 serviços ativos ordenados, sem auth.
- `POST /publico/orcamento`: 201 válido; 400 sem telefone; 400 turnstile inválido.
- Contato criado com `canal=FORMULARIO`, `tipo=DUVIDA`, `status=NOVO`,
  `descricao = "Serviço: X\n\nmsg"`.
- Vínculo `clienteId` quando existe cliente com e-mail/telefone iguais; `null`
  quando não existe; nenhum `Cliente`/`User` criado.
- `/orcamento` valida campos obrigatórios e mostra confirmação ao enviar.
- Home/Serviços carregam serviços da API.
- `npm run lint` e typecheck em `apps/api` e `apps/web`.
