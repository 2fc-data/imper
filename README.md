# imper_v01 — Gestão de Impermeabilização

Sistema de gestão de impermeabilização (mobile-first) com atendimento → visita técnica → orçamento → obra → almoxarifado → financeiro, com suporte offline para a equipe de campo.

## Stack

| Camada   | Tecnologia |
|----------|-----------|
| API      | Node.js + Express + TypeScript + Prisma + MySQL 8 |
| Web      | Vite + React + TypeScript + Tailwind CSS + shadcn/ui |
| PWA      | vite-plugin-pwa (Workbox) |
| Offline  | Dexie (IndexedDB) + outbox de sincronização |
| Compartilhado | `packages/shared` (enums, schemas zod, tipos) |

## Estrutura

```
imper_v01/
├── apps/
│   ├── api/         # API Express + Prisma
│   └── web/         # Frontend PWA (React)
├── packages/
│   └── shared/      # Enums, schemas zod e tipos compartilhados
└── package.json     # workspaces npm
```

## Como rodar

### 1. Banco de dados (MySQL 8 local)

O projeto usa um MySQL 8 local já existente. Ajuste `DATABASE_URL` em `apps/api/.env` com as credenciais do banco `impermeab`.

### 2. Instalar dependências

```bash
npm install
```

### 3. Gerar Prisma Client, criar schema e rodar seed

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Rodar

```bash
npm run dev        # API (http://localhost:3000)
npm run dev:web    # Web (http://localhost:5173)
```

### Credenciais seed (default)

| Papel | Login | Senha |
|-------|-------|-------|
| ADMIN | admin@imper.local | admin123 |

Outros usuários de seed seguem `nome@imper.local` / `123456` (ver `apps/api/prisma/seed.ts`).

## Papéis (RBAC)

`ADMIN | SUPERVISOR | TECNICO | ALMOXARIFE | CONTABILIDADE | ATENDENTE` + `CLIENTE` (acesso via link, sem senha).

## Fluxo principal

```
Contato → VisitaTecnica (auto-agendada 5/3/1) → Orçamento (urgência) → cliente aprova
  → baixa de estoque + auto-agendamento da execução (10/3/1) + OS AGUARDANDO_APROVACAO
  → ADMIN aprova → consulta de disponibilidade → compra pendente se faltar → OS AGENDADO
  → T-3 dias: alerta almoxarife + Separacao por fase → retirada → conferência → execução
  → CONFIRMADO (cliente via link) → ENTREGUE
```

## Configurações (editáveis ADMIN/SUPERVISOR)

- `urgencia.visitaNormal`=5, `urgencia.visitaUrgente`=3, `urgencia.visitaUrgentissimo`=1
- `urgencia.execucaoNormal`=10, `urgencia.execucaoUrgente`=3, `urgencia.execucaoUrgentissimo`=1
- `separacao.diasAntecedencia`=3
- `orcamento.validadeDias`=15, `compra.compraAutomatica`=true, `acesso.linkDias`=30
