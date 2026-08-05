# Hero na Landing — Imperpoços

Data: 2026-08-04
Status: Implementado

## Objetivo

Remover a imagem `Hero_Imper.webp` do fundo de `<main>` e movê-la para uma
seção Hero dedicada, com apenas os botões CTA, exibida somente na página
Início. O conteúdo das páginas fica abaixo do hero.

## Decisões

- O Hero aparece **apenas na rota `/`** (HomePage).
- O Hero contém **somente a imagem de fundo + os 2 botões CTA**: "Pedir
  orçamento" (WhatsApp) e "Conhecer serviços" (rota `/servicos`).
- O título/badge/parágrafo que existiam na HomePage são **removidos**.
- Altura do hero: **87vh**, imagem em `bg-cover bg-center`, botões centralizados.
- Abaixo do hero, a HomePage mostra um **resumo dos serviços** (grid com os 4
  itens de `SERVICOS`), mesmo padrão visual da página Serviços.
- As demais páginas (Serviços, Como trabalhamos, Área de atuação, Contato)
  permanecem sem alteração.

## Arquitetura

- **`components/landing/Hero.tsx`** (novo): seção `relative flex min-h-[87vh]
  items-center justify-center bg-cover bg-center` com `backgroundImage` via
  import Vite de `src/assets/Hero_Imper.webp`. Botões empilhados em mobile
  (`flex-col`) e lado a lado em desktop (`sm:flex-row`).
- **`pages/HomePage.tsx`**: renderiza `<Hero />` + seção de resumo de
  serviços (`mx-auto max-w-5xl`, grid `sm:grid-cols-2`, cards de `SERVICOS`).
- **`components/landing/LandingLayout.tsx`**: removidos o import de `heroBg`,
  o `style={{ backgroundImage }}` do `<main>` e o wrapper `bg-white/45`.
  `<main className="flex-1">{children}</main>`. Header, footer e NAV_LINKS
  intactos.

## Dependências

- Sem novas dependências. Imagem bundlada via Vite.
- Rota `/` continua exportando `HomePage` como default; `App.tsx` sem mudanças.

## Verificação

- `npm run typecheck` e `npm run build` em `apps/web` — OK.
- Inspeção visual via `npm run dev`: hero 87vh, botões centralizados, resumo
  de serviços abaixo, demais páginas intactas.
