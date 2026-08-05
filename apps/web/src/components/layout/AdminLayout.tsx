import { useCallback, useState, type ReactNode } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useSessionTimer } from "../../lib/useSessionTimer";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

const SESSAO_SEGUNDOS = 15 * 60;

interface AdminLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export function AdminLayout({ children, sidebar }: AdminLayoutProps) {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const segundosRestantes = useSessionTimer(SESSAO_SEGUNDOS, logout);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <div className="flex min-h-full flex-col">
      <AdminHeader
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onLogout={handleLogout}
        timeLeft={segundosRestantes}
        sessionDuration={SESSAO_SEGUNDOS}
      />
      <div className="flex flex-1">
        <AdminSidebar
          openOnMobile={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sidebar={sidebar}
        />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6 lg:pr-8">
          {children}
        </main>
      </div>
    </div>
  );
}
