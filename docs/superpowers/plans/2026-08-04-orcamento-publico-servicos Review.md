# Plano: Formulário público de orçamento + serviços persistidos no banco

Data: 2026-08-04
Status: Em revisão
Especificação: `docs/superpowers/specs/2026-08-04-orcamento-publico-servicos-design.md`

## Objetivo

Migrar os 4 serviços de marketing (hoje estáticos em `lib/landing.ts`) para a
tabela `ServicoMarketing` no banco e adicionar uma página pública `/orcamento`
com formulário que persiste o pedido como `Contato` (`canal=FORMULARIO`,
`tipo=DUVIDA`, `status=NOVO`), vinculando ao `Cliente` existente quando o email
ou telefone já cadastrado for localizado. Adicionar um terceiro CTA no hero da
landing apontando para `/orcamento`.

## Escopo (da spec aprovada)

- Nova tabela `ServicoMarketing` + seed com os 4 serviços atuais.
- API pública `GET /publico/servicos` e `POST /publico/orcamento`.
- Método `contatoService.criarPublico(...)` (sem `atendenteId`, não cria
  `Cliente`/`User`).
- Web: `listarServicos()`/`solicitarOrcamento()` em `api.ts`, hook
  `useServicos()`, página `OrcamentoPage`, rota `/orcamento`, HomePage e
  ServicosPage consumindo a API, terceiro CTA no Hero, remoção de `SERVICOS`
  de `lib/landing.ts`.

Fora de escopo: notificação interna, enum novo, CRUD admin de serviços,
criação de `Cliente`/`User` no submit, testes automatizados (projeto não tem
infra de testes — ver Constraint 1).

## Arquivos

Novos:
- `apps/api/src/services/servicoMarketing.service.ts`
- `apps/api/src/routes/publico.routes.ts`
- `apps/web/src/lib/useServicos.ts`
- `apps/web/src/pages/OrcamentoPage.tsx`

Modificados:
- `apps/api/prisma/schema.prisma` (modelo `ServicoMarketing`)
- `apps/api/prisma/seed.ts` (upsert dos 4 serviços)
- `apps/api/src/services/contato.service.ts` (método `criarPublico`)
- `apps/api/src/index.ts` (montar `/publico`)
- `apps/web/src/lib/api.ts` (interfaces + 2 funções)
- `apps/web/src/App.tsx` (rota `/orcamento`)
- `apps/web/src/pages/HomePage.tsx` e `apps/web/src/pages/ServicosPage.tsx`
- `apps/web/src/components/landing/Hero.tsx` (terceiro CTA)
- `apps/web/src/lib/landing.ts` (remover `SERVICOS`)

## Constraint 1: Verificação sem suíte de testes

O projeto **não possui infraestrutura de testes** (sem `*.test.ts` fora de
node_modules, sem vitest/jest, sem script `test` nos package.json). Portanto,
a verificação de cada fase é feita por:

1. `npm run typecheck` (raiz; roda shared+api+web) e/ou `npm run typecheck --workspace @imper/api` / `--workspace @imper/web`.
2. `npm run build` (raiz) para validar build de produção.
3. Testes manuais via `curl` na API (dev) e navegador na web.

**Não adicionar framework de testes nem scripts `test`** neste trabalho (fora
de escopo; evitaria o padrão do repo).

## Constraint 2: Padrões a seguir

- Schema em português, modelos nomeados no plural (ex.: `ServicoMarketing`),
  `id Int @id @default(autoincrement())`, `createdAt/updatedAt`.
- Banco é sincronizado com `prisma db push` (o repo não usa migrações —
  sem pasta `prisma/migrations`). Não criar arquivos de migração.
- Seed usa helpers `findOrCreate*`/`upsert` idempotentes (ver `seed.ts`).
- Services: objetos `export const xService = { ... }`, importam
  `prisma` de `../db`.
- Rotas: `wrap(fn)` de `lib/errors`, validação com `parseBody` de
  `lib/validators`, Turnstile com `verificarTurnstile(body.turnstileToken ?? "", req.ip)` de `lib/turnstile`.
- Web: `api.ts` usa `api.get/post<T>` com `API_BASE` absoluto; UI com
  componentes `ui/{button,card,input,label}`; `cn` de `lib/utils`.

## Fases

### Fase 1: Schema + seed do ServicoMarketing

1. Em `apps/api/prisma/schema.prisma`, adicionar após o modelo `Contato`
   (final do arquivo ou na seção de contatos):
   ```prisma
   model ServicoMarketing {
     id        Int      @id @default(autoincrement())
     titulo    String   @unique @db.VarChar(200)
     descricao String   @db.VarChar(500)
     icone     String   @db.VarChar(500)
     ativo     Boolean  @default(true)
     ordem     Int      @default(0)
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```
2. Rodar `npm run db:generate` e `npm run db:push`.
3. Em `apps/api/prisma/seed.ts`, adicionar helper
   `findOrCreateServicoMarketing(data)` (padrão dos demais `findOrCreate*`)
   e, no `main()`, a lista dos 4 serviços com **os mesmos títulos, descrições
   e ícones SVG** de `apps/web/src/lib/landing.ts` (SERVICOS), com `ordem`
   1..4 e `ativo: true`. Usar upsert por `titulo` para idempotência.
4. Rodar `npm run db:seed` duas vezes para confirmar idempotência (sem erro
   na segunda execução).

### Fase 2: API — serviço e rota pública

1. Criar `apps/api/src/services/servicoMarketing.service.ts`:
   ```ts
   import { prisma } from "../db";

   export const servicoMarketingService = {
     async listarAtivos() {
       return prisma.servicoMarketing.findMany({
         where: { ativo: true },
         orderBy: { ordem: "asc" },
         select: { id: true, titulo: true, descricao: true, icone: true },
       });
     },
   };
   ```
2. Criar `apps/api/src/routes/publico.routes.ts`:
   - `GET /servicos` → `wrap(async (_req, res) => { res.json(await servicoMarketingService.listarAtivos()); })`. Retornar **array** direto.
   - `POST /orcamento` → schema zod local:
     ```ts
     const OrcamentoSchema = z.object({
       nome: z.string().trim().min(2).max(120),
       telefone: z.string().trim().min(8).max(20),
       email: z.string().trim().email().max(120),
       servico: z.string().trim().min(2).max(150),
       mensagem: z.string().trim().max(700).optional().default(""),
       turnstileToken: z.string().optional(),
     });
   ```
   Corpo do handler:
     1. `parseBody(OrcamentoSchema, req.body)`.
     2. `await verificarTurnstile(body.turnstileToken ?? "", req.ip)`.
     3. Montar `descricao = ["Serviço:", body.servico, "", body.mensagem].filter(Boolean).join("\n")`. Tamanho máximo teórico:
        `"Serviço:\n"` (9) + servico (≤150) + `"\n\n"` (2) + mensagem (≤700) = **861 chars**, seguro abaixo de `VarChar(1000)`.
     4. `const contato = await contatoService.criarPublico({ nome: body.nome, telefone: body.telefone, email: body.email, descricao });`
     5. `res.status(201).json({ id: contato.id, nome: contato.nome, canal: contato.canal, tipo: contato.tipo, status: contato.status, createdAt: contato.createdAt });`
   - Exportar `Router` com prefixo definido apenas na montagem (usar rotas sem `/publico` no path, ex.: `router.get("/servicos", ...)`, `router.post("/orcamento", ...)`).
3. Em `apps/api/src/index.ts`, importar `publicoRoutes` e adicionar `app.use("/publico", publicoRoutes);`.

### Fase 3: API — criarPublico em contato.service.ts

Adicionar ao objeto `contatoService` (sem `atendenteId`):

```ts
async criarPublico(data: { nome: string; telefone: string; email?: string; descricao: string }) {
  const cliente = await prisma.cliente.findFirst({
    where: data.email
      ? { OR: [{ email: data.email }, { telefone: data.telefone }] }
      : { telefone: data.telefone },
    select: { id: true },
  });
  return prisma.contato.create({
    data: {
      clienteId: cliente?.id ?? null,
      nome: data.nome,
      telefone: data.telefone,
      email: data.email ?? null,
      canal: CanalContato.FORMULARIO,
      tipo: TipoContato.DUVIDA,
      descricao: data.descricao,
    },
  });
}
```

Importar `CanalContato`/`TipoContato` já presentes no import de `@prisma/client`.

### Fase 4: Web — cliente API

Em `apps/web/src/lib/api.ts`, adicionar:

```ts
export interface ServicoMarketing {
  id: number;
  titulo: string;
  descricao: string;
  icone: string;
}

export async function listarServicos(): Promise<ServicoMarketing[]> {
  return api.get<ServicoMarketing[]>("/publico/servicos");
}

export interface OrcamentoInput {
  nome: string;
  telefone: string;
  email: string;
  servico: string;
  mensagem?: string;
  turnstileToken?: string;
}

export interface OrcamentoResult {
  id: number;
  nome: string;
  canal: string;
  tipo: string;
  status: string;
  createdAt: string;
}

export async function solicitarOrcamento(input: OrcamentoInput): Promise<OrcamentoResult> {
  return api.post<OrcamentoResult>("/publico/orcamento", input);
}
```

### Fase 5: Web — hook useServicos

Criar `apps/web/src/lib/useServicos.ts`:

```ts
import { useEffect, useState } from "react";
import { listarServicos, ServicoMarketing } from "./api";

export function useServicos() {
  const [servicos, setServicos] = useState<ServicoMarketing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    listarServicos()
      .then((data) => { if (ativo) { setServicos(data); setError(null); } })
      .catch(() => { if (ativo) setError("Não foi possível carregar os serviços."); })
      .finally(() => { if (ativo) setLoading(false); });
    return () => { ativo = false; };
  }, []);

  return { servicos, loading, error };
}
```

### Fase 6: Web — OrcamentoPage + rota

1. Criar `apps/web/src/pages/OrcamentoPage.tsx` modelado em `RegisterPage.tsx`
   (layout `Card`/`CardContent`, `Input`, `Label`, `Button`, `Turnstile`):
   - Estado: `nome`, `telefone`, `email`, `servico` (select), `mensagem`,
     `turnstileToken`, `enviando`, `erro`, `sucesso`.
   - Select nativo (`<select>`) com as classes de `Input`/`cn`, options de
     `useServicos()`; valor default "" + placeholder "Selecione um serviço".
   - Textarea nativo com `maxLength={700}` e contador opcional de caracteres.
   - Validação no submit (mensagens amigáveis em pt-BR): nome ≥ 2, telefone
     válido, email válido, serviço selecionado.
   - Submit: `solicitarOrcamento({ ... })`; em sucesso, exibir tela de
     confirmação (substituir o form) com texto "Pedido enviado! Em breve
     retornaremos com um orçamento."; em erro, exibir `err.message` na tela.
   - Botão desabilitado enquanto `enviando` ou sem `turnstileToken`.
   - Cabeçalho da página com `h1` "Solicite um orçamento" e texto de apoio.
2. Em `apps/web/src/App.tsx`, adicionar rota
   `{ path: "/orcamento", element: <LandingLayout><OrcamentoPage /></LandingLayout> }`
   (conferir como as rotas de landing estão montadas, ex. `/servicos`).

### Fase 7: Web — HomePage e ServicosPage

- Substituir `import { SERVICOS } from "../lib/landing"` por
  `import { useServicos } from "../lib/useServicos";`.
- Trocar o `SERVICOS.map((servico) => ...)` por `servicos.map((servico) => ...)`
  usando `key={servico.id}`, `servico.titulo`, `servico.descricao`,
  `servico.icone` (o SVG já usa `path d={servico.icon}` → `servico.icone`).
- Enquanto `loading`: renderizar esqueleto simples (ex.: 4 `div` com
  `animate-pulse`); se `error`: exibir a mensagem no lugar da grid.

### Fase 8: Web — CTA no Hero + remoção de SERVICOS

1. Em `apps/web/src/components/landing/Hero.tsx`, adicionar terceiro CTA após
   o link "Conhecer serviços", com o mesmo estilo de botão outline e texto
   "Orçamento online", apontando para `/orcamento`:
   ```tsx
   <Link
     to="/orcamento"
     className="inline-flex items-center justify-center rounded-lg border bg-card px-6 py-3.5 text-lg font-semibold text-foreground transition-colors hover:bg-muted/40"
   >
     Orçamento online
   </Link>
   ```
   O container já é `flex flex-col gap-3 px-4 sm:flex-row sm:items-center`,
   então o terceiro botão empilha em mobile e fica ao lado em desktop.
2. Em `apps/web/src/lib/landing.ts`, remover o bloco `SERVICOS`.
   Confirmar que nenhum outro arquivo o importa (`grep -rn "SERVICOS" apps/web/src`).

## Plano de verificação

### Fase 1
- `npm run db:generate && npm run db:push`
- `npm run db:seed` (2× sem erro)
- Conferir no Prisma Studio (`npm run db:studio`) que existem 4 registros.

### Fases 2–3 (API)
- `npm run typecheck --workspace @imper/api`
- `npm run dev` (API) e:
  - `curl -s http://localhost:3333/publico/servicos` → array com 4 itens.
  - `curl -s -X POST http://localhost:3333/publico/orcamento -H "Content-Type: application/json" -d '{"nome":"Fulano","telefone":"(35)99999-0000","email":"fulano@exemplo.com","servico":"Manta asfáltica","mensagem":"Teste","turnstileToken":"dev-bypass"}'` → 201 com `{ id, nome, canal:"FORMULARIO", tipo:"DUVIDA", status:"NOVO", createdAt }`.
  - `curl` sem `nome` → 400.
  - `curl` com `mensagem` de 701+ chars → 400.
- Conferir o registro criado via rota autenticada `/contatos` (login com
  `admin@imper.local/admin123` para obter token) ou no Prisma Studio.

### Fases 4–8 (Web)
- `npm run typecheck --workspace @imper/web` e `npm run build`.
- Navegador em `/` (hero com 3 CTAs, seção "Nossas especialidades" carregada
  da API), `/servicos` (mesmos cards), `/orcamento`:
  - sem turnstile key: aparece aviso amarelo "modo de desenvolvimento".
  - enviar form válido → tela de confirmação; conferir no banco.
  - enviar form inválido → mensagens de validação.
- Rodar `npm run typecheck` e `npm run build` na raiz ao final.

## Rollback

- Reverter alterações web é trivial (git não disponível — fazer backup manual
  dos arquivos modificados antes de começar, ex. cópia em `/tmp/opencode/`).
- Banco: `ServicoMarketing` pode ser removido com `DROP TABLE` via Prisma
  Studio ou `prisma db push` após remover o modelo do schema.
