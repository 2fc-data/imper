# Spec: Landing pública Imperpoços + migração Tailwind v4

**Status:** implementado
**Data:** 2026

## Objetivo

- Criar a landing page pública da **Imperpoços** (impermeabilização, Poços de Caldas-MG) servida em `/`.
- Manter o BOS interno movido para `/painel`; CLIENTE permanece em `/minha-conta`.
- Migrar o app para **Tailwind CSS v4.3+** com o plugin `@tailwindcss/vite` e cores **oklch** no `index.css`.
- Manter a abordagem **mobile-first** (Container `max-w-md`, safe-bottom, viewport `maximum-scale=1`).

## Dados oficiais da empresa

- Nome: Imperpoços (Impermeabilização de Piscinas).
- +20 anos de experiência.
- Serviços: aplicação e venda de impermeabilizantes, manta asfáltica, impermeabilização de piscinas, lajes e paredes.
- Endereço: Rua São Paulo, 511 — Centro, Poços de Caldas/MG.
- WhatsApp (35) 99999-4663 (CTA do Hero); tel (35) 3721-1674; e-mail impershop@imperpocos.com.br.
- Horário: Seg–Sex 07h15–12h e 13h–17h.
- Região: Poços de Caldas, Andradas, Campestre, Botelhos e cidades em MG, SP, BA, TO.
- Tom: profissional, técnico e confiável (infiltração = problema estrutural grave).

## Paleta (oklch) no `index.css`

| Token | Valor |
|---|---|
| `--color-background` | `oklch(92.1% 0.04 68.7)` |
| `--color-foreground` | `oklch(24.3% 0 0)` |
| `--color-primary` | `oklch(24.3% 0 0)` |
| `--color-primary-foreground` | `oklch(98% 0 0)` |
| `--color-secondary` | `oklch(73.1% 0.161 227.5)` |
| `--color-secondary-foreground` | `oklch(24.3% 0 0)` |
| `--color-muted` | `oklch(76.1% 0.08 252.5)` |
| `--color-accent` | `oklch(63.1% 0.11 258.3)` |
| `--color-accent-foreground` | `oklch(98% 0 0)` |
| `--color-gold` | `oklch(72.1% 0.15 45.6)` |
| `--color-card` | `oklch(97.5% 0.01 90)` |
| `--color-border` / `--color-input` | `oklch(85% 0.03 250)` |
| `--color-ring` | `oklch(63.1% 0.11 258.3)` |

Dark mode via `@custom-variant dark (&:where(.dark, .dark *));`.

## Migração Tailwind v3 → v4.3+

- `npm i -D tailwindcss@^4.3 @tailwindcss/vite@^4.3`; remover `autoprefixer` e `postcss`.
- Remover `tailwind.config.js` e `postcss.config.js`; tema agora declarado via `@theme` no `index.css`.
- `vite.config.ts`: adicionar `tailwindcss()` de `@tailwindcss/vite` aos plugins (mantendo `VitePWA`).
- `index.css`: `@import "tailwindcss";` substitui `@tailwind base/components/utilities`.

## Roteamento

| Rota | Destino |
|---|---|
| `/` | Landing pública (sem guard) |
| `/painel` | BOS (dashboard interno, papéis ADMIN/SUPERVISOR/ATENDENTE/TECNICO/ALMOXARIFE/CONTABILIDADE) |
| `/minha-conta` | CLIENTE (inalterado) |

- `homeFor(papel)` em `App.tsx`: CLIENTE → `/minha-conta`, senão `/painel`.
- `LoginPage.tsx`: pós-login → `/painel` para papéis internos.
- `AppLayout.tsx`: item nav "Início" → `/painel` (com `end`).

## Landing (`src/pages/LandingPage.tsx`)

Seções: Header (logo + "Office"), Hero (badge +20 anos, título, CTA WhatsApp), Serviços/Especialidades (4 cards), Como trabalhamos (4 etapas), Área de atuação (chips), Contato (WhatsApp, telefone, e-mail, endereço, horário) e Rodapé (© 2026 + Facebook). Cores: primary quase-preto, secondary azul-claro (CTAs), accent azul (destaques).

## Arquivos tocados

- `apps/web/package.json` — deps Tailwind v4.
- `apps/web/vite.config.ts` — plugin `tailwindcss()`.
- `apps/web/src/index.css` — reescrito com `@import "tailwindcss"` + `@theme` oklch.
- `apps/web/src/App.tsx` — rota `/` (landing), `/painel` (BOS), `homeFor`.
- `apps/web/src/pages/LandingPage.tsx` — novo.
- `apps/web/src/pages/LoginPage.tsx` — redirect pós-login `/painel`.
- `apps/web/src/components/layout/AppLayout.tsx` — nav "Início" `/painel`.
- `apps/web/index.html` — título/description Imperpoços.
- `apps/web/src/pages/PlaceholderPage.tsx`, `MinhaContaPage.tsx` — inalterados.
- Removidos: `tailwind.config.js`, `postcss.config.js`.

## Validação

- `npm run typecheck` e `npm run build` em `apps/web` passando.
- Bundle CSS contém os valores oklch esperados.
