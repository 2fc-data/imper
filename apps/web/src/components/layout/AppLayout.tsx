import { type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Papel } from "@imper/shared";
import { cn } from "../../lib/utils";
import { ThemeToggle } from "../../theme/ThemeToggle";

interface NavItem {
  to: string;
  label: string;
  icon: string;
  roles?: Papel[];
}

const NAV_ITEMS: NavItem[] = [
  {
    to: "/painel",
    label: "Início",
    icon: "M3 12l9-9 9 9",
    roles: [
      Papel.ADMIN,
      Papel.SUPERVISOR,
      Papel.ATENDENTE,
      Papel.TECNICO,
      Papel.ALMOXARIFE,
      Papel.CONTABILIDADE,
    ],
  },
  {
    to: "/contatos",
    label: "Contatos",
    icon: "M12 3a3 3 0 100 6 3 3 0 000-6zM8 21v-2a4 4 0 018 0v2",
    roles: [Papel.ADMIN, Papel.SUPERVISOR, Papel.ATENDENTE],
  },
  {
    to: "/orcamentos",
    label: "Orçamentos",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    roles: [Papel.ADMIN, Papel.SUPERVISOR, Papel.ATENDENTE, Papel.CONTABILIDADE],
  },
  {
    to: "/os",
    label: "OS",
    icon: "M9 12h6M9 16h6M8 8h8M20 12a8 8 0 11-16 0 8 8 0 0116 0z",
    roles: [
      Papel.ADMIN,
      Papel.SUPERVISOR,
      Papel.ATENDENTE,
      Papel.TECNICO,
      Papel.ALMOXARIFE,
      Papel.CONTABILIDADE,
    ],
  },
  {
    to: "/materiais",
    label: "Materiais",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10",
    roles: [Papel.ADMIN, Papel.SUPERVISOR, Papel.TECNICO, Papel.ALMOXARIFE],
  },
  {
    to: "/usuarios",
    label: "Usuários",
    icon: "M16 11a1 1 0 01-1 1H9a1 1 0 01-1-1V8a1 1 0 011-1h6a1 1 0 011 1v3zM12 3a3 3 0 100 6 3 3 0 000-6zM8 21v-2a4 4 0 018 0v2",
    roles: [Papel.ADMIN, Papel.SUPERVISOR],
  },
  {
    to: "/minha-conta",
    label: "Minha conta",
    icon: "M16 11a1 1 0 01-1 1H9a1 1 0 01-1-1V8a1 1 0 011-1h6a1 1 0 011 1v3zM12 3a3 3 0 100 6 3 3 0 000-6zM8 21v-2a4 4 0 018 0v2",
    roles: [Papel.CLIENTE],
  },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d={d} />
    </svg>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const itens = user
    ? NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user.papel))
    : [];

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <NavIcon d="M8 8h8M8 12h8M8 16h8" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            ImperMeab
          </span>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{user.nome}</span>
            <ThemeToggle />
          </div>
        )}
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-10 border-t bg-background/95 backdrop-blur">
        <div
          className={cn(
            "mx-auto grid max-w-md",
            itens.length === 1
              ? "grid-cols-1"
              : itens.length === 2
                ? "grid-cols-2"
                : itens.length === 3
                  ? "grid-cols-3"
                  : itens.length === 4
                    ? "grid-cols-4"
                    : itens.length === 5
                      ? "grid-cols-5"
                      : "grid-cols-6",
          )}
        >
          {itens.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/painel"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground",
                  isActive && "text-primary",
                )
              }
            >
              <NavIcon d={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
