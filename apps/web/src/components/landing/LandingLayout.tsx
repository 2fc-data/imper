import { type ReactNode, useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, m } from "framer-motion";
import { cn } from "../../lib/utils";
import { ThemeToggle } from "../../theme/ThemeToggle";

const NAV_LINKS = [
  { to: "/", label: "Início" },
  { to: "/servicos", label: "Serviços" },
  { to: "/como-trabalhamos", label: "Como trabalhamos" },
  { to: "/area-de-atuacao", label: "Área de atuação" },
  { to: "/contato", label: "Contato" },
];

const SECTION_BY_ROUTE: Record<string, string> = {
  "/": "inicio",
  "/servicos": "servicos",
  "/como-trabalhamos": "como-trabalhamos",
  "/area-de-atuacao": "area-de-atuacao",
  "/contato": "contato",
};

export function LandingLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const id = SECTION_BY_ROUTE[pathname];
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    const header = document.querySelector("header");
    const offset = header ? header.offsetHeight : 0;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }, [pathname]);

  return (
    <div className="flex min-h-full flex-col bg-background">
      <m.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-10 border-b bg-white dark:bg-background"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-x-4 px-4 py-3">
          <Link to="/" className="text-lg font-bold tracking-tight">
            IMPERPOÇOS
          </Link>
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-x-1">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "rounded-lg px-3 py-2 text-sm font-medium 35% 0.010 240transition-colors hover:text-primary",
                        isActive && "text-primary",
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium 35% 0.010 240transition-colors hover:text-primary lg:block"
            >
              Área do cliente
            </Link>
            <button
              type="button"
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg 35% 0.010 240transition-colors hover:bg-accent hover:text-foreground lg:hidden"
            >
              {menuOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Backdrop para escurecer o fundo da página */}
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
              />
              
              {/* Menu com efeito drawer deslizando de cima para baixo */}
              <m.nav
                initial={{ y: "-100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ type: "spring", damping: 26, stiffness: 280 }}
                className="absolute top-full left-0 right-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-md shadow-2xl lg:hidden"
              >
                <ul className="mx-auto flex max-w-6xl flex-col gap-y-1 px-4 py-5 sm:px-6">
                  {NAV_LINKS.map((link) => (
                    <li key={link.to}>
                      <NavLink
                        to={link.to}
                        end={link.to === "/"}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "block rounded-md px-4 py-3 text-base font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-accent/50",
                            isActive && "text-foreground font-semibold bg-accent/70",
                          )
                        }
                      >
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                  <li className="pt-3 border-t border-border/60 flex flex-col gap-2.5 mt-2">
                    <Link
                      to="/orcamento"
                      onClick={() => setMenuOpen(false)}
                      className="block text-center rounded-md bg-gold px-4 py-3 text-sm font-semibold text-slate-950 shadow-xs hover:bg-gold-hover transition-all"
                    >
                      Solicitar Orçamento
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block text-center rounded-md border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/40 transition-colors"
                    >
                      Área do cliente
                    </Link>
                  </li>
                </ul>
              </m.nav>
            </>
          )}
        </AnimatePresence>
      </m.header>

      <main className="flex-1 bg-white dark:bg-background h-full">{children}</main>

      <footer className="border-t bg-primary text-primary-foreground/80 py-8 dark:bg-background">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
            <span className="text-lg font-bold tracking-tight">Imperpoços</span>
            <p className="max-w-xl text-md">
              Engenharia em Impermeabilização.
            </p>
            <p className="max-w-xl text-sm">
              Rua São Paulo, 511 — Centro, Poços de Caldas/MG.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-center sm:items-center">
            <p className="text-sm font-semibold tracking-tight">
              Redes sociais
            </p>
            <div className="flex flex-col items-center gap-3">
              <a
                href="https://www.facebook.com/imperpocos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-secondary"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M13.5 21.9v-8h2.7l.4-3.1h-3.1V8.8c0-.9.25-1.5 1.55-1.5h1.65v-2.8c-.3-.04-1.3-.12-2.45-.12-2.4 0-4.05 1.47-4.05 4.17v2.32H7.5v3.1h2.7v8h3.3z" />
                </svg>
                /imperpocos
              </a>
              <a
                href="https://www.instagram.com/imperpocos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium 35% 0.010 240transition-colors hover:text-secondary"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                @imperpocos
              </a>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 sm:items-end sm:text-right">
            <p className="text-sm font-semibold tracking-tight">Mapa do site</p>
            <ul className="flex flex-col items-center gap-2 sm:items-end">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm 35% 0.010 240transition-colors hover:text-secondary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/login"
                  className="text-sm 35% 0.010 240transition-colors hover:text-secondary"
                >
                  Área do cliente
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 pt-8 text-center">
          <p className="text-xs">
            © 2026 Imperpoços. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
