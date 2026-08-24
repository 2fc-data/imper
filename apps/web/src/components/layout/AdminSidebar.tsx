import { useEffect, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import { itensPara, iniciais, type NavItem } from "../../lib/nav";
import { cn } from "../../lib/utils";

interface AdminSidebarProps {
  openOnMobile: boolean;
  onClose: () => void;
  onLogout: () => void;
}

function RotuloSecao({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

function ItemMenu({ item, end }: { item: NavItem; end?: boolean }) {
  return (
    <NavLink
      to={item.to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary",
          isActive && "bg-primary/10 text-primary",
        )
      }
    >
      {item.icon}
      <span>{item.label}</span>
    </NavLink>
  );
}

export function AdminSidebar({ openOnMobile, onClose, onLogout }: AdminSidebarProps) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const itens = itensPara(user?.permissoes ?? []);
  const analiticos = itens.filter((item) => item.to === "/painel");
  const operacionais = itens.filter((item) => item.to !== "/painel");

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const navItems = (
    <>
      {analiticos.length > 0 && (
        <div>
          <RotuloSecao>Menu Analítico</RotuloSecao>
          <nav aria-label="Menu analítico" className="mt-2 flex flex-col gap-1">
            {analiticos.map((item) => (
              <ItemMenu key={item.to} item={item} end />
            ))}
          </nav>
        </div>
      )}

      {operacionais.length > 0 && (
        <div>
          <RotuloSecao>Menu operacional</RotuloSecao>
          <nav aria-label="Menu operacional" className="mt-2 flex flex-col gap-1">
            {operacionais.map((item) => (
              <ItemMenu key={item.to} item={item} />
            ))}
          </nav>
        </div>
      )}
    </>
  );

  const userBlock = user && (
    <div className="border-t p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {iniciais(user.nome)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user.nome}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="mt-3 inline-flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
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
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
        Sair
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop: fixa */}
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col border-r bg-card/60">
          <div className="flex-1 overflow-y-auto p-4">{navItems}</div>
          {userBlock}
        </div>
      </aside>

      {/* Mobile: drawer */}
      <AnimatePresence>
        {openOnMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-overlay/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r bg-background shadow-xl lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              <div className={cn("flex items-center justify-between border-b px-4 py-3 h-14")}>
                <span className="text-sm font-semibold">Menu</span>
                <button
                  type="button"
                  aria-label="Fechar"
                  onClick={onClose}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">{navItems}</div>
              {userBlock}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
