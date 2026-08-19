import { useEffect, useState, type FormEvent } from "react";
import {
  atualizarEpi,
  criarEpi,
  excluirEpi,
  listarEpis,
  type EpiInput,
  type EpiItem,
} from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { cn } from "../lib/utils";

function BadgeAtivo({ ativo }: { ativo: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        ativo ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
      )}
    >
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );
}

function FormatoValidade({ value }: { value: string | null }) {
  if (!value) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span className="text-xs text-muted-foreground">
      Validade: {new Date(value).toLocaleDateString("pt-BR")}
    </span>
  );
}

function toLocalDateTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalDateTime(value: string): string | undefined {
  const v = value.trim();
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

const vazio: EpiInput = {
  codigo: "",
  nome: "",
  categoria: "",
  numeroCa: "",
  dataValidade: undefined,
  quantidade: 0,
  quantidadeMinima: 0,
};

interface EpisAnalisesProps {
  epis: EpiItem[];
}

function ehVencido(dataValidade: string | null): boolean {
  if (!dataValidade) return false;
  return new Date(dataValidade).getTime() < Date.now();
}

function venceEm30Dias(dataValidade: string | null): boolean {
  if (!dataValidade) return false;
  const d = new Date(dataValidade).getTime();
  const hoje = Date.now();
  const limite = hoje + 30 * 24 * 60 * 60 * 1000;
  return d >= hoje && d <= limite;
}

export function EpisAnalises({ epis }: EpisAnalisesProps) {
  const total = epis.length;
  const ativos = epis.filter((e) => e.ativo).length;
  const inativos = epis.filter((e) => !e.ativo).length;
  const estoqueTotal = epis.reduce((acc, e) => acc + e.quantidade, 0);
  const vencidos = epis.filter((e) => ehVencido(e.dataValidade)).length;
  const vencendo = epis.filter((e) => venceEm30Dias(e.dataValidade)).length;

  const porCategoria = epis.reduce((acc, e) => {
    const cat = e.categoria || "Sem categoria";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Análises de EPIs</h2>
        <p className="text-sm text-muted-foreground">
          Situação do estoque e validade dos equipamentos de proteção individual.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total de EPIs</p>
          <p className="mt-2 text-2xl font-bold">{total}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-success">Ativos</p>
          <p className="mt-2 text-2xl font-bold">{ativos}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Inativos</p>
          <p className="mt-2 text-2xl font-bold">{inativos}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Unidades em Estoque</p>
          <p className="mt-2 text-2xl font-bold">{estoqueTotal}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-destructive">Vencidos</p>
          <p className="mt-2 text-2xl font-bold">{vencidos}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-warning">Vencendo em 30 dias</p>
          <p className="mt-2 text-2xl font-bold">{vencendo}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-base">Distribuição por Categoria</h3>
        <div className="space-y-2">
          {Object.entries(porCategoria).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum dado registrado.</p>
          ) : (
            Object.entries(porCategoria).map(([cat, qtd]) => {
              const perc = total ? Math.round((qtd / total) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{cat}</span>
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
    </div>
  );
}

export default function EpisAdminPage({
  viewAtiva = "lista",
  onNavegar,
}: {
  viewAtiva?: "analises" | "lista" | "novo";
  onNavegar?: (v: "analises" | "lista" | "novo") => void;
}) {
  const [epis, setEpis] = useState<EpiItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [saving, setSaving] = useState(false);
  const [editando, setEditando] = useState<EpiItem | null>(null);
  const [form, setForm] = useState<EpiInput>(vazio);
  const [toggling, setToggling] = useState<number | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<number | null>(
    null,
  );
  const [excluindo, setExcluindo] = useState<number | null>(null);

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregar(q?: string) {
    setError(null);
    try {
      const lista = await listarEpis(q ? { q } : undefined);
      setEpis(lista);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao listar EPIs");
    }
  }

  function comecarEdicao(e: EpiItem) {
    setEditando(e);
    setForm({
      codigo: e.codigo,
      nome: e.nome,
      categoria: e.categoria,
      numeroCa: e.numeroCa ?? "",
      dataValidade: toLocalDateTime(e.dataValidade),
      quantidade: e.quantidade,
      quantidadeMinima: e.quantidadeMinima ?? 0,
    });
    setError(null);
  }

  function cancelarEdicao() {
    setEditando(null);
    setForm(vazio);
    setError(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editando) {
        const atualizado = await atualizarEpi(editando.id, {
          nome: form.nome,
          categoria: form.categoria,
          numeroCa: form.numeroCa || undefined,
          dataValidade: fromLocalDateTime(form.dataValidade ?? "") ?? null,
          quantidade: form.quantidade,
          quantidadeMinima: form.quantidadeMinima ?? null,
        });
        setEpis((prev) => prev.map((x) => (x.id === atualizado.id ? atualizado : x)));
        cancelarEdicao();
      } else {
        const criado = await criarEpi(form);
        setEpis((prev) => [criado, ...prev]);
        cancelarEdicao();
        onNavegar?.("lista");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar EPI");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAtivo(e: EpiItem) {
    setToggling(e.id);
    setError(null);
    try {
      const atualizado = await atualizarEpi(e.id, { ativo: !e.ativo });
      setEpis((prev) => prev.map((x) => (x.id === atualizado.id ? atualizado : x)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao alterar EPI");
    } finally {
      setToggling(null);
    }
  }

  async function handleExcluir(id: number) {
    setExcluindo(id);
    setError(null);
    try {
      await excluirEpi(id);
      setEpis((prev) => prev.filter((x) => x.id !== id));
      setConfirmandoExclusao(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao excluir EPI");
    } finally {
      setExcluindo(null);
    }
  }

  const categorias = Array.from(
    new Set(epis.map((e) => e.categoria).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));

  const filtrados = epis.filter((e) => {
    if (categoriaFiltro && e.categoria !== categoriaFiltro) return false;
    return busca.trim()
      ? `${e.codigo} ${e.nome} ${e.categoria} ${e.numeroCa ?? ""}`
          .toLowerCase()
          .includes(busca.trim().toLowerCase())
      : true;
  });

  const formulario = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {editando ? `Editar EPI ${editando.codigo}` : "Novo EPI"}
        </CardTitle>
        <CardDescription>
          Código, CA e validade devem ser conferidos antes do cadastro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                required
                maxLength={50}
                placeholder="Ex.: CAP-01"
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                required
                placeholder="Ex.: Capacete de segurança"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                id="categoria"
                required
                placeholder="Ex.: Proteção da cabeça"
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numeroCa">Número CA</Label>
              <Input
                id="numeroCa"
                placeholder="Ex.: 12345"
                value={form.numeroCa ?? ""}
                onChange={(e) => setForm({ ...form, numeroCa: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataValidade">Validade</Label>
              <Input
                id="dataValidade"
                type="datetime-local"
                value={form.dataValidade ?? ""}
                onChange={(e) =>
                  setForm({ ...form, dataValidade: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                min={0}
                step={1}
                required
                value={form.quantidade}
                onChange={(e) =>
                  setForm({ ...form, quantidade: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantidadeMinima">Quantidade mínima</Label>
              <Input
                id="quantidadeMinima"
                type="number"
                min={0}
                step={1}
                value={form.quantidadeMinima ?? 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    quantidadeMinima: e.target.value === "" ? 0 : Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving
                ? "Salvando..."
                : editando
                  ? "Salvar alterações"
                  : "Cadastrar"}
            </Button>
            {editando && (
              <Button type="button" variant="outline" onClick={cancelarEdicao}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );

  if (viewAtiva === "analises") {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">EPIs</h1>
          <p className="text-sm text-muted-foreground">
            Cadastro e gestão de equipamentos de proteção individual.
          </p>
        </header>

        <EpisAnalises epis={epis} />

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
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Novo EPI</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre um novo equipamento de proteção individual.
          </p>
        </header>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {formulario}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">EPIs</h1>
        <p className="text-sm text-muted-foreground">
          Cadastro e gestão de equipamentos de proteção individual.
        </p>
      </header>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar EPI por código, nome ou categoria..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">TODAS AS CATEGORIAS</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {editando ? (
        formulario
      ) : (
        <Button
          type="button"
          onClick={() => onNavegar?.("novo")}
          className="w-full sm:w-auto"
        >
          + Novo EPI
        </Button>
      )}

      <div className="space-y-3">
        {filtrados.map((e) => (
          <Card key={e.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">
                    {e.codigo} — {e.nome}
                  </CardTitle>
                  <BadgeAtivo ativo={e.ativo} />
                </div>
                <span className="text-xs text-muted-foreground">{e.categoria}</span>
              </div>
              <CardDescription>
                CA: {e.numeroCa ?? "—"} · Estoque: {e.quantidade}{" "}
                {e.quantidadeMinima !== null && `(mín. ${e.quantidadeMinima})`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <FormatoValidade value={e.dataValidade} />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={toggling === e.id}
                    onClick={() => handleToggleAtivo(e)}
                  >
                    {toggling === e.id ? "Salvando..." : e.ativo ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => comecarEdicao(e)}
                  >
                    Editar
                  </Button>
                  {confirmandoExclusao === e.id ? (
                    <>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={excluindo === e.id}
                        onClick={() => handleExcluir(e.id)}
                      >
                        {excluindo === e.id ? "Excluindo..." : "Confirmar exclusão"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmandoExclusao(null)}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmandoExclusao(e.id)}
                    >
                      Excluir
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!error && filtrados.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum EPI encontrado.
          </p>
        )}
      </div>
    </div>
  );
}