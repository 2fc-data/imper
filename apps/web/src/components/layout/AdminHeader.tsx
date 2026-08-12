import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { cn } from "../../lib/utils";
import { iniciais, itensPara } from "../../lib/nav";
import { ThemeToggle } from "../../theme/ThemeToggle";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  onLogout: () => void;
  timeLeft?: number;
  sessionDuration?: number;
}

function formatarTempo(totalSeg: number): string {
  const seg = Math.max(0, totalSeg);
  const min = Math.floor(seg / 60);
  const rest = seg % 60;
  return `${String(min).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function AdminHeader({
  onToggleSidebar,
  onLogout,
  timeLeft,
  sessionDuration,
}: AdminHeaderProps) {
  const { user } = useAuth();
  const itens = itensPara(user?.papel ?? null);
  const baixo = timeLeft !== undefined && timeLeft <= 60;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        aria-label="Abrir ações da página"
        onClick={onToggleSidebar}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-muted-foreground transition-colors hover:text-foreground lg:hidden"
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
          <path d="M3 6h18M3 12h18M9 18h12" />
        </svg>
      </button>

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
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
            <path d="M8 8h8M8 12h8M8 16h8" />
          </svg>
        </div>
        <span className="text-base font-semibold tracking-tight">ImperMeab</span>
      </div>

      {itens.length > 0 && (
        <nav
          aria-label="Navegação principal"
          className="ml-2 hidden items-center gap-1 md:flex"
        >
          {itens.map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/painel"}
              className={({ isActive }) =>
                cn(
                  "-ml-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-accent",
                  isActive && "text-foreground",
                  i === 0 && "-ml-3",
                )
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      )}

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        {user && (
          <>
            <span className="hidden max-w-[10rem] truncate text-sm text-muted-foreground sm:block">
              {user.nome}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
              {iniciais(user.nome)}
            </div>
          </>
        )}
        {timeLeft !== undefined && sessionDuration !== undefined && (
          <span
            title="Sessão expira em"
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md border border-transparent px-2 text-sm tabular-nums text-muted-foreground transition-colors sm:px-3",
              baixo && "border-destructive/40 bg-destructive/10 text-destructive",
            )}
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
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
            <span className="hidden sm:inline">
              {formatarTempo(timeLeft)}
            </span>
          </span>
        )}
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive sm:px-3"
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
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}