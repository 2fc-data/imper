import { useEffect, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import { itensPara, type NavItem } from "../../lib/nav";
import { cn } from "../../lib/utils";

interface AdminSidebarProps {
  openOnMobile: boolean;
  onClose: () => void;
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

export function AdminSidebar({ openOnMobile, onClose }: AdminSidebarProps) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const itens = itensPara(user?.papel ?? null);
  const analiticos = itens.filter((item) => item.to === "/painel");
  const operacionais = itens.filter((item) => item.to !== "/painel");

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const conteudo = (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4">
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
    </div>
  );

  return (
    <>
      {/* Desktop: fixa */}
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] border-r bg-card/60">
          {conteudo}
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
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r bg-background shadow-xl lg:hidden"
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
              {conteudo}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
