import { useEffect, useState, type FormEvent } from "react";
import { Papel } from "@imper/shared";
import {
  definirPerfilUsuario,
  listarUsuarios,
  type Usuario,
} from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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

export default function UsuariosPage() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [saving, setSaving] = useState<number | null>(null);

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

  const filtrados = usuarios.filter((u) =>
    u.nome.toLowerCase().includes(busca.toLowerCase()) ||
    u.email.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
        <p className="text-sm text-muted-foreground">
          Defina o perfil dos clientes que se cadastraram no sistema
        </p>
      </div>

      <Input
        placeholder="Buscar por nome ou e-mail..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

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
