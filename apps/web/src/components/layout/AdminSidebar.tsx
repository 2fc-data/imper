import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_ITEMS } from "../../lib/nav";
import { cn } from "../../lib/utils";

interface AdminSidebarProps {
  openOnMobile: boolean;
  onClose: () => void;
  sidebar?: ReactNode;
}

function tituloDaRota(pathname: string): string {
  const item = [...NAV_ITEMS].reverse().find((it) => pathname.startsWith(it.to));
  return item?.label ?? "";
}

export function AdminSidebar({
  openOnMobile,
  onClose,
  sidebar,
}: AdminSidebarProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);



  const conteudo = (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {tituloDaRota(pathname)}
        </p>
        <p className="mt-1 text-sm font-medium">Ações</p>
      </div>
      <div className="flex flex-1 flex-col gap-3">{sidebar}</div>
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
              aria-label="Ações da página"
            >
              <div className={cn("flex items-center justify-between border-b px-4 py-3 h-14")}>
                <span className="text-sm font-semibold">Ações da página</span>
                <button
                  type="button"
                  aria-label="Fechar"
                  onClick={onClose}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
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