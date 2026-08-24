import { useEffect, useState, type FormEvent } from "react";
import {
  criarUsuario,
  definirPerfilUsuario,
  listarPapeis,
  listarUsuarios,
  type PapelRbac,
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
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const ROTULO_PAPEL: Record<string, string> = {
  ADMIN: "Administrador",
  SUPERVISOR: "Supervisor",
  ATENDENTE: "Atendente",
  TECNICO: "Técnico",
  ALMOXARIFE: "Almoxarife",
  CONTABILIDADE: "Contabilidade",
  CLIENTE: "Cliente",
};

function badgetColor(nomePapel: string) {
  switch (nomePapel) {
    case "ADMIN":
      return "bg-destructive/10 text-destructive";
    case "SUPERVISOR":
      return "bg-primary/10 text-primary";
    case "ATENDENTE":
    case "TECNICO":
    case "ALMOXARIFE":
    case "CONTABILIDADE":
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
  const semPerfil = usuarios.filter((u) => u.papel === "CLIENTE").length;

  const porPapel = usuarios.reduce((acc, u) => {
    const nome = u.papeis?.[0]?.nome ?? u.papel ?? "Sem perfil";
    acc[nome] = (acc[nome] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
                      <span>{ROTULO_PAPEL[papel] ?? papel}</span>
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

const selectClasses =
  "flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

interface NovoUsuarioFormProps {
  onVoltar: () => void;
  onCriado: () => void;
}

function NovoUsuarioForm({ onVoltar, onCriado }: NovoUsuarioFormProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [papelId, setPapelId] = useState<number>(0);
  const [papeis, setPapeis] = useState<PapelRbac[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listarPapeis().then(setPapeis).catch(() => {});
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await criarUsuario({
        nome,
        email,
        senha,
        telefone: telefone || undefined,
        papelId,
      });
      onCriado();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar usuário");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Novo Usuário</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre um novo usuário no sistema
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onVoltar}>
          ← Voltar para a lista
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Usuário</CardTitle>
          <CardDescription>
            Preencha as informações abaixo para criar uma nova conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome completo"
                  required
                  minLength={2}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="papel">Perfil de Acesso *</Label>
                <select
                  id="papel"
                  value={papelId}
                  onChange={(e) => setPapelId(Number(e.target.value))}
                  className={selectClasses}
                  disabled={saving}
                  required
                >
                  <option value={0} disabled>Selecione...</option>
                  {papeis.map((p) => (
                    <option key={p.id} value={p.id}>
                      {ROTULO_PAPEL[p.nome] ?? p.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onVoltar} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Criar Usuário"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UsuariosPage({
  viewAtiva = "lista",
  onNavegar,
}: {
  viewAtiva?: "analises" | "lista" | "novo";
  onNavegar?: (v: "analises" | "lista" | "novo") => void;
}) {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [papeis, setPapeis] = useState<PapelRbac[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroLocal, setFiltroLocal] = useState<string>("");
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      listarUsuarios().catch((err) => setError(err instanceof Error ? err.message : "Falha ao listar usuários")),
      listarPapeis().catch(() => {}),
    ]).then(([usuariosResult, papeisResult]) => {
      if (usuariosResult) setUsuarios(usuariosResult);
      if (papeisResult) setPapeis(papeisResult);
    });
  }, []);

  const podeDefinirPerfil =
    user?.permissoes?.includes("editar_usuario") ||
    user?.permissoes?.includes("definir_perfil");

  async function handlePerfil(e: FormEvent<HTMLFormElement>, id: number) {
    e.preventDefault();
    setSaving(id);
    setError(null);
    try {
      const form = e.currentTarget;
      const select = form.elements.namedItem("papel") as HTMLSelectElement;
      const atualizado = await definirPerfilUsuario(id, Number(select.value));
      setUsuarios((prev) =>
        prev.map((u) => (u.id === atualizado.id ? { ...u, papel: atualizado.papel, papeis: atualizado.papeis } : u)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao definir perfil");
    } finally {
      setSaving(null);
    }
  }

  const filtrados = usuarios.filter(
    (u) =>
      (!filtroLocal || u.papel === filtroLocal || u.papeis?.some((p) => p.nome === filtroLocal)) &&
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

  if (viewAtiva === "novo") {
    return (
      <NovoUsuarioForm onVoltar={() => onNavegar?.("lista")} onCriado={() => onNavegar?.("lista")} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os usuários do sistema e seus perfis de acesso.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onNavegar?.("analises")}>
            Análises
          </Button>
          <Button onClick={() => onNavegar?.("novo")}>Novo Usuário</Button>
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="sm:max-w-xs"
        />
        <select
          value={filtroLocal}
          onChange={(e) => setFiltroLocal(e.target.value)}
          className={selectClasses + " sm:max-w-[200px]"}
        >
          <option value="">Todos os perfis</option>
          {papeis.map((p) => (
            <option key={p.id} value={p.nome}>
              {ROTULO_PAPEL[p.nome] ?? p.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Perfil</th>
                <th className="px-4 py-3">Cargo</th>
                <th className="px-4 py-3">Criado em</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filtrados.map((u) => {
                  const nomePapel = u.papeis?.[0]?.nome ?? u.papel;
                  return (
                    <tr key={u.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{u.nome}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.telefone ?? "—"}</td>
                      <td className="px-4 py-3">
                        {podeDefinirPerfil ? (
                          <form onSubmit={(e) => handlePerfil(e, u.id)} className="flex items-center gap-1">
                            <select
                              name="papel"
                              defaultValue={nomePapel}
                              className="h-8 rounded border border-input bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              disabled={saving === u.id}
                            >
                              {papeis.map((p) => (
                                <option key={p.id} value={p.nome}>
                                  {ROTULO_PAPEL[p.nome] ?? p.nome}
                                </option>
                              ))}
                            </select>
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              disabled={saving === u.id}
                              className="h-8 px-2 text-xs"
                            >
                              {saving === u.id ? "..." : "Salvar"}
                            </Button>
                          </form>
                        ) : (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgetColor(nomePapel)}`}>
                            {ROTULO_PAPEL[nomePapel] ?? nomePapel}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.cargo?.nome ?? "—"}</td>
                      <td className="px-4 py-3">
                        <FormatoData value={u.createdAt} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${u.ativo ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                          {u.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
