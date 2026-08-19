import { useEffect, useState, type FormEvent } from "react";
import { Papel } from "@imper/shared";
import {
  definirPerfilUsuario,
  listarUsuarios,
  type Usuario,
} from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { cn } from "../lib/utils";

const PAPEIS: Papel[] = [
  Papel.ATENDENTE,
  Papel.SUPERVISOR,
  Papel.TECNICO,
  Papel.ALMOXARIFE,
  Papel.CONTABILIDADE,
  Papel.CLIENTE,
];

const ROTULO_PAPEL: Record<Papel, string> = {
  [Papel.ADMIN]: "Administrador",
  [Papel.SUPERVISOR]: "Supervisor",
  [Papel.ATENDENTE]: "Atendente",
  [Papel.TECNICO]: "Técnico",
  [Papel.ALMOXARIFE]: "Almoxarife",
  [Papel.CONTABILIDADE]: "Contabilidade",
  [Papel.CLIENTE]: "Cliente",
};

function badgetColor(papel: Papel) {
  switch (papel) {
    case Papel.ADMIN:
      return "bg-destructive/10 text-destructive";
    case Papel.SUPERVISOR:
      return "bg-primary/10 text-primary";
    case Papel.ATENDENTE:
    case Papel.TECNICO:
    case Papel.ALMOXARIFE:
    case Papel.CONTABILIDADE:
      return "bg-secondary text-secondary-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function FormatoData({ value }: { value: string }) {
  return (
    <span className="text-xs text-muted-foreground">
      {new Date(value).toLocaleDateString("pt-BR")}
    </span>
  );
}

interface UsuariosAnalisesProps {
  usuarios: Usuario[];
}

export function UsuariosAnalises({ usuarios }: UsuariosAnalisesProps) {
  const total = usuarios.length;
  const ativos = usuarios.filter((u) => u.ativo).length;
  const inativos = usuarios.filter((u) => !u.ativo).length;
  const semPerfil = usuarios.filter((u) => u.papel === Papel.CLIENTE).length;

  const porPapel = usuarios.reduce((acc, u) => {
    acc[u.papel] = (acc[u.papel] || 0) + 1;
    return acc;
  }, {} as Record<Papel, number>);

  const porCargo = usuarios.reduce((acc, u) => {
    const nome = u.cargo?.nome ?? "Sem cargo";
    acc[nome] = (acc[nome] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Análises de Usuários</h2>
        <p className="text-sm text-muted-foreground">
          Visão geral dos usuários cadastrados e seus perfis de acesso.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total de Usuários</p>
          <p className="mt-2 text-2xl font-bold">{total}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-success">Ativos</p>
          <p className="mt-2 text-2xl font-bold">{ativos}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-warning">Inativos</p>
          <p className="mt-2 text-2xl font-bold">{inativos}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Sem Perfil Definido</p>
          <p className="mt-2 text-2xl font-bold">{semPerfil}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
          <h3 className="font-semibold text-base">Distribuição por Perfil</h3>
          <div className="space-y-2">
            {Object.entries(porPapel).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum dado registrado.</p>
            ) : (
              Object.entries(porPapel).map(([papel, qtd]) => {
                const perc = total ? Math.round((qtd / total) * 100) : 0;
                return (
                  <div key={papel} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{ROTULO_PAPEL[papel as Papel] ?? papel}</span>
                      <span>{qtd} ({perc}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-primary/40 overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${perc}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
          <h3 className="font-semibold text-base">Distribuição por Cargo</h3>
          <div className="space-y-2">
            {Object.entries(porCargo).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum dado registrado.</p>
            ) : (
              Object.entries(porCargo).map(([cargo, qtd]) => {
                const perc = total ? Math.round((qtd / total) * 100) : 0;
                return (
                  <div key={cargo} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{cargo}</span>
                      <span>{qtd} ({perc}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-primary/40 overflow-hidden">
                      <div
                        className="h-full bg-warning transition-all"
                        style={{ width: `${perc}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UsuariosPage({
  viewAtiva = "lista",
  onNavegar,
  filtroPapel,
  onFiltroPapelChange,
}: {
  viewAtiva?: "analises" | "lista";
  onNavegar?: (v: "analises" | "lista") => void;
  filtroPapel?: Papel;
  onFiltroPapelChange?: (p: Papel | null) => void;
}) {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroLocal, setFiltroLocal] = useState<Papel | "">(filtroPapel ?? "");
  const [saving, setSaving] = useState<number | null>(null);

  const valorPapel = onFiltroPapelChange ? filtroPapel ?? "" : filtroLocal;

  function handleFiltroPapel(v: string) {
    const p = (v === "" ? null : v) as Papel | null;
    setFiltroLocal(v as Papel | "");
    onFiltroPapelChange?.(p);
  }

  useEffect(() => {
    listarUsuarios()
      .then(setUsuarios)
      .catch((err) => setError(err instanceof Error ? err.message : "Falha ao listar usuários"));
  }, []);

  const podeDefinirPerfil =
    user?.papel === Papel.ADMIN ||
    user?.papel === Papel.SUPERVISOR ||
    user?.papel === Papel.ATENDENTE;

  async function handlePerfil(e: FormEvent<HTMLFormElement>, id: number) {
    e.preventDefault();
    setSaving(id);
    setError(null);
    try {
      const form = e.currentTarget;
      const select = form.elements.namedItem("papel") as HTMLSelectElement;
      const atualizado = await definirPerfilUsuario(id, select.value as Papel);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === atualizado.id ? { ...u, papel: atualizado.papel } : u)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao definir perfil");
    } finally {
      setSaving(null);
    }
  }

  const filtrados = usuarios.filter(
    (u) =>
      (!filtroPapel || u.papel === filtroPapel) &&
      (u.nome.toLowerCase().includes(busca.toLowerCase()) ||
        u.email.toLowerCase().includes(busca.toLowerCase())),
  );

  if (viewAtiva === "analises") {
    return (
      <div className="space-y-4">
        <UsuariosAnalises usuarios={usuarios} />
        {onNavegar && (
          <Button type="button" variant="outline" onClick={() => onNavegar("lista")}>
            ← Voltar para a lista
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
          <p className="text-sm text-muted-foreground">
            Defina o perfil dos clientes que se cadastraram no sistema
          </p>
        </div>
        {onNavegar && (
          <Button type="button" variant="outline" onClick={() => onNavegar("analises")}>
            📊 Análises
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <select
          value={valorPapel}
          onChange={(e) => handleFiltroPapel(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">TODOS OS PERFIS</option>
          {PAPEIS.map((p) => (
            <option key={p} value={p}>
              {ROTULO_PAPEL[p]}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {filtrados.map((u) => (
          <Card key={u.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{u.nome}</CardTitle>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    badgetColor(u.papel),
                  )}
                >
                  {ROTULO_PAPEL[u.papel]}
                </span>
              </div>
              <CardDescription className="break-all">{u.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-3">
                  {u.telefone && (
                    <span className="text-xs text-muted-foreground">{u.telefone}</span>
                  )}
                  <FormatoData value={u.createdAt} />
                </div>
                {podeDefinirPerfil && u.papel !== Papel.ADMIN && (
                  <form onSubmit={(e) => handlePerfil(e, u.id)} className="flex items-center gap-2">
                    <select
                      name="papel"
                      defaultValue={u.papel}
                      className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      disabled={saving === u.id}
                    >
                      {PAPEIS.map((p) => (
                        <option key={p} value={p}>
                          {ROTULO_PAPEL[p]}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" size="sm" disabled={saving === u.id}>
                      {saving === u.id ? "Salvando..." : "Definir"}
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {!error && filtrados.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum usuário encontrado.
          </p>
        )}
      </div>
    </div>
  );
}
