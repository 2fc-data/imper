import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Papel } from "@imper/shared";
import { cn } from "../../lib/utils";

interface SidebarButtonProps {
  onClick?: () => void;
  active?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export function SidebarButton({
  onClick,
  active,
  icon,
  children,
}: SidebarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-accent-foreground",
        active && "border-border bg-card text-foreground shadow-sm",
      )}
    >
      {icon}
      <span className="truncate">{children}</span>
    </button>
  );
}

interface SidebarLinkProps {
  to: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function SidebarLink({ to, icon, children }: SidebarLinkProps) {
  return (
    <Link
      to={to}
      className="flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-accent-foreground"
    >
      {icon}
      <span className="truncate">{children}</span>
    </Link>
  );
}

export function SidebarNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed bg-card/60 px-3 py-2 text-xs text-muted-foreground">
      {children}
    </p>
  );
}

/* ---------- sidebars por página ---------- */

const icone = (d: string) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 shrink-0"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

export function DashboardSidebar() {
  return (
    <>
      <SidebarLink to="/contatos" icon={icone("M12 3a3 3 0 100 6 3 3 0 000-6zM8 21v-2a4 4 0 018 0v2")}>
        Novo contato
      </SidebarLink>
      <SidebarLink
        to="/orcamentos"
        icon={icone("M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2")}
      >
        Novo orçamento
      </SidebarLink>
      <SidebarLink to="/os" icon={icone("M9 12h6M9 16h6M8 8h8M20 12a8 8 0 11-16 0 8 8 0 0116 0z")}>
        Nova OS
      </SidebarLink>
      <SidebarLink
        to="/materiais"
        icon={icone("M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10")}
      >
        Materiais
      </SidebarLink>
    </>
  );
}

export function UsuariosSidebar({
  valor,
  onChange,
}: {
  valor: Papel | null;
  onChange: (p: Papel | null) => void;
}) {
  const papeis: Papel[] = [
    Papel.ADMIN,
    Papel.SUPERVISOR,
    Papel.ATENDENTE,
    Papel.TECNICO,
    Papel.ALMOXARIFE,
    Papel.CONTABILIDADE,
    Papel.CLIENTE,
  ];
  const rotulo: Record<Papel, string> = {
    [Papel.ADMIN]: "Administrador",
    [Papel.SUPERVISOR]: "Supervisor",
    [Papel.ATENDENTE]: "Atendente",
    [Papel.TECNICO]: "Técnico",
    [Papel.ALMOXARIFE]: "Almoxarife",
    [Papel.CONTABILIDADE]: "Contabilidade",
    [Papel.CLIENTE]: "Cliente",
  };

  return (
    <>
      <SidebarButton
        active={valor === null}
        onClick={() => onChange(null)}
        icon={icone("M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20")}
      >
        Todos os perfis
      </SidebarButton>
      {papeis.map((p) => (
        <SidebarButton
          key={p}
          active={valor === p}
          onClick={() => onChange(valor === p ? null : p)}
          icon={icone("M16 11a1 1 0 01-1 1H9a1 1 0 01-1-1V8a1 1 0 011-1h6a1 1 0 011 1v3z")}
        >
          {rotulo[p]}
        </SidebarButton>
      ))}
      <SidebarNote>
        Filtra a lista por perfil. Clique novamente para limpar o filtro.
      </SidebarNote>
    </>
  );
}

export function ClienteSidebar() {
  return (
    <>
      <SidebarNote>
        Portal do cliente: acompanhe seus dados e ordens de serviço.
      </SidebarNote>
    </>
  );
}

export function EmBreveSidebar({ texto }: { texto: string }) {
  return (
    <>
      <SidebarNote>{texto}</SidebarNote>
    </>
  );
}