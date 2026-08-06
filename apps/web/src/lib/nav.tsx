import { type ReactNode, type SVGProps } from "react";
import { Papel } from "@imper/shared";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  roles?: Papel[];
}

function Icon({
  d,
  children,
  ...props
}: { d?: string; children?: ReactNode } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
      {...props}
    >
      {d ? <path d={d} /> : children}
    </svg>
  );
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: "/painel",
    label: "Início",
    icon: <Icon d="M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10" />,
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
    icon: <Icon d="M12 3a3 3 0 100 6 3 3 0 000-6zM8 21v-2a4 4 0 018 0v2" />,
    roles: [Papel.ADMIN, Papel.SUPERVISOR, Papel.ATENDENTE],
  },
  {
    to: "/orcamentos",
    label: "Orçamentos",
    icon: (
      <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    ),
    roles: [Papel.ADMIN, Papel.SUPERVISOR, Papel.ATENDENTE, Papel.CONTABILIDADE],
  },
  {
    to: "/os",
    label: "OS",
    icon: (
      <Icon d="M9 12h6M9 16h6M8 8h8M20 12a8 8 0 11-16 0 8 8 0 0116 0z" />
    ),
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
    icon: <Icon d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />,
    roles: [Papel.ADMIN, Papel.SUPERVISOR, Papel.TECNICO, Papel.ALMOXARIFE],
  },
  {
    to: "/servicos-admin",
    label: "Serviços",
    icon: <Icon d="M19 9l-7 12-7-12a7 7 0 1114 0z" />,
    roles: [Papel.ADMIN, Papel.SUPERVISOR],
  },
  {
    to: "/usuarios",
    label: "Usuários",
    icon: (
      <Icon d="M16 11a1 1 0 01-1 1H9a1 1 0 01-1-1V8a1 1 0 011-1h6a1 1 0 011 1v3zM12 3a3 3 0 100 6 3 3 0 000-6zM8 21v-2a4 4 0 018 0v2" />
    ),
    roles: [Papel.ADMIN, Papel.SUPERVISOR],
  },
  {
    to: "/minha-conta",
    label: "Minha conta",
    icon: (
      <Icon d="M16 11a1 1 0 01-1 1H9a1 1 0 01-1-1V8a1 1 0 011-1h6a1 1 0 011 1v3zM12 3a3 3 0 100 6 3 3 0 000-6zM8 21v-2a4 4 0 018 0v2" />
    ),
    roles: [Papel.CLIENTE],
  },
];

export function itensPara(papel: Papel | null): NavItem[] {
  if (!papel) return [];
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(papel));
}

export function homeFor(papel: Papel): string {
  return papel === Papel.CLIENTE ? "/minha-conta" : "/painel";
}

export function iniciais(nome: string | undefined): string {
  if (!nome) return "?";
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}