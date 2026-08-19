import { useEffect, useState, type FormEvent } from "react";
import {
  atualizarEquipamento,
  categoriasApi,
  criarEquipamento,
  estadosConservacaoApi,
  excluirEquipamento,
  fornecedoresApi,
  listarEquipamentos,
  listarLookupsEquipamentos,
  listarUsuarios,
  localizacoesApi,
  marcasApi,
  registrarDevolucaoEquipamento,
  registrarRetiradaEquipamento,
  statusEquipamentoApi,
  subcategoriasApi,
  tiposManutencaoApi,
  type EquipamentoInput,
  type EquipamentoItem,
  type EquipamentoLookups,
  type FornecedorInput,
  type FornecedorItem,
  type LookupInput,
  type LookupItem,
  type SubcategoriaInput,
  type SubcategoriaItem,
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
import {
  formatarData,
  formatarValor,
  fromLocalDateTime,
  toLocalDateTime,
} from "../lib/datetime";
import { ItemForm, type ItemFormData } from "../components/ItemForm";



const selectClasses =
  "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";



export function BadgeAtivoEquipamento({ ativo }: { ativo: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        ativo
          ? "bg-emerald-500/10 text-emerald-600"
          : "bg-muted text-muted-foreground",
      )}
    >
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );
}

type ViewAtiva = "analises" | "lista" | "novo" | "catalogos";

interface EquipamentosAdminPageProps {
  viewAtiva: ViewAtiva;
  onNavegar: (view: ViewAtiva) => void;
}

interface EquipamentosAnalisesProps {
  equipamentos: EquipamentoItem[];
}

export function EquipamentosAnalises({
  equipamentos,
}: EquipamentosAnalisesProps) {
  const total = equipamentos.length;
  const ativos = equipamentos.filter((e) => e.ativo).length;
  const inativos = equipamentos.filter((e) => !e.ativo).length;
  const retirados = equipamentos.filter((e) => e.responsavel != null).length;
  const valorTotal = equipamentos.reduce(
    (acc, e) => acc + (e.valorAquisicao ?? 0),
    0,
  );

  const porCategoria = equipamentos.reduce((acc, e) => {
    const nome = e.categoria?.nome ?? "Sem categoria";
    acc[nome] = (acc[nome] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const porStatus = equipamentos.reduce((acc, e) => {
    const nome = e.status?.nome ?? "Sem status";
    acc[nome] = (acc[nome] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  function Barras({ dados }: { dados: Record<string, number> }) {
    return (
      <div className="space-y-2">
        {Object.entries(dados).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum dado registrado.</p>
        ) : (
          Object.entries(dados).map(([nome, qtd]) => {
            const perc = total ? Math.round((qtd / total) * 100) : 0;
            return (
              <div key={nome} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>{nome}</span>
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
    );
  }


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Análises de Equipamentos</h2>
        <p className="text-sm text-muted-foreground">
          Visão geral do patrimônio, conservação e movimentações.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border bg-card p-4 shadow-sm lg:col-span-1">
          <p className="text-xs font-medium text-muted-foreground">Total</p>
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
          <p className="text-xs font-medium text-warning">Em retirada</p>
          <p className="mt-2 text-2xl font-bold">{retirados}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm lg:col-span-1">
          <p className="text-xs font-medium text-muted-foreground">Valor total</p>
          <p className="mt-2 text-2xl font-bold">{formatarValor(valorTotal)}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-base">Distribuição por Categoria</h3>
        <Barras dados={porCategoria} />
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-base">Distribuição por Status</h3>
        <Barras dados={porStatus} />
      </div>
    </div>
  );
}

const emptyForm: ItemFormData = {
  codigo: "",
  numeroPatrimonio: undefined,
  descricao: "",
  modelo: undefined,
  numeroSerie: undefined,
  marcaId: undefined,
  categoriaId: undefined,
  subcategoriaId: undefined,
  localizacaoId: undefined,
  fornecedorId: undefined,
  statusId: 0,
  estadoConservacaoId: undefined,
  dataAquisicao: undefined,
  valorAquisicao: undefined,
  dataGarantia: undefined,
  observacoes: undefined,
};

export default function EquipamentosAdminPage({
  viewAtiva,
  onNavegar,
}: EquipamentosAdminPageProps) {
  const [equipamentos, setEquipamentos] = useState<EquipamentoItem[]>([]);
  const [lookups, setLookups] = useState<EquipamentoLookups | null>(null);
  const [usuarios, setUsuarios] = useState<{ id: number; nome: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const [editando, setEditando] = useState<EquipamentoItem | null>(null);
  const [form, setForm] = useState<ItemFormData>(emptyForm);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<number | null>(
    null,
  );
  const [excluindo, setExcluindo] = useState<number | null>(null);
  const [retiraForm, setRetiraForm] = useState<{
    equipamentoId: number;
    colaboradorId: number | "";
    observacao: string;
    salvando: boolean;
  }>({ equipamentoId: 0, colaboradorId: "", observacao: "", salvando: false });

  useEffect(() => {
    carregarTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarTodos() {
    setError(null);
    try {
      const [eqs, cats, usrs] = await Promise.all([
        listarEquipamentos(),
        listarLookupsEquipamentos(),
        listarUsuarios(),
      ]);
      setEquipamentos(eqs);
      setLookups(cats);
      setUsuarios(usrs.filter((u) => u.ativo));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Falha ao carregar equipamentos",
      );
    }
  }

  async function recarregarEquipamentos() {
    try {
      const lista = await listarEquipamentos();
      setEquipamentos(lista);
    } catch {
      /* mantém a lista atual */
    }
  }

  function comecarEdicao(e: EquipamentoItem) {
    setEditando(e);
    setForm({
      codigo: e.codigo,
      numeroPatrimonio: e.numeroPatrimonio ?? undefined,
      descricao: e.descricao,
      modelo: e.modelo ?? undefined,
      numeroSerie: e.numeroSerie ?? undefined,
      marcaId: e.marcaId ?? undefined,
      categoriaId: e.categoriaId ?? undefined,
      subcategoriaId: e.subcategoriaId ?? undefined,
      localizacaoId: e.localizacaoId ?? undefined,
      fornecedorId: e.fornecedorId ?? undefined,
      statusId: e.statusId,
      estadoConservacaoId: e.estadoConservacaoId ?? undefined,
      dataAquisicao: toLocalDateTime(e.dataAquisicao),
      valorAquisicao: e.valorAquisicao ?? undefined,
      dataGarantia: toLocalDateTime(e.dataGarantia),
      observacoes: e.observacoes ?? undefined,
    });
    setError(null);
  }

  function cancelarEdicao() {
    setEditando(null);
    setForm(emptyForm);
    setError(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: EquipamentoInput = {
        codigo: form.codigo,
        numeroPatrimonio: form.numeroPatrimonio || undefined,
        descricao: form.descricao || "",
        modelo: form.modelo || undefined,
        numeroSerie: form.numeroSerie || undefined,
        marcaId: form.marcaId,
        categoriaId: form.categoriaId,
        subcategoriaId: form.subcategoriaId,
        localizacaoId: form.localizacaoId,
        fornecedorId: form.fornecedorId,
        statusId: form.statusId || 0,
        estadoConservacaoId: form.estadoConservacaoId,
        dataAquisicao: fromLocalDateTime(form.dataAquisicao ?? ""),
        valorAquisicao: form.valorAquisicao,
        dataGarantia: fromLocalDateTime(form.dataGarantia ?? ""),
        observacoes: form.observacoes || undefined,
      };
      if (editando) {
        const atualizado = await atualizarEquipamento(editando.id, payload);
        setEquipamentos((prev) =>
          prev.map((x) => (x.id === atualizado.id ? atualizado : x)),
        );
        cancelarEdicao();
      } else {
        const criado = await criarEquipamento(payload);
        setEquipamentos((prev) => [criado, ...prev]);
        cancelarEdicao();
        onNavegar("lista");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar equipamento");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAtivo(e: EquipamentoItem) {
    setError(null);
    try {
      const atualizado = await atualizarEquipamento(e.id, { ativo: !e.ativo });
      setEquipamentos((prev) =>
        prev.map((x) => (x.id === atualizado.id ? atualizado : x)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar equipamento");
    }
  }

  async function handleExcluir(id: number) {
    setExcluindo(id);
    setError(null);
    try {
      await excluirEquipamento(id);
      setEquipamentos((prev) => prev.filter((x) => x.id !== id));
      setConfirmandoExclusao(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao excluir equipamento");
    } finally {
      setExcluindo(null);
    }
  }

  async function handleRetirar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!retiraForm.colaboradorId) return;
    setRetiraForm((r) => ({ ...r, salvando: true }));
    setError(null);
    try {
      await registrarRetiradaEquipamento(retiraForm.equipamentoId, {
        colaboradorId: Number(retiraForm.colaboradorId),
        observacao: retiraForm.observacao || undefined,
      });
      setRetiraForm({ equipamentoId: 0, colaboradorId: "", observacao: "", salvando: false });
      await recarregarEquipamentos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao registrar retirada");
      setRetiraForm((r) => ({ ...r, salvando: false }));
    }
  }

  async function handleDevolver(e: EquipamentoItem) {
    setError(null);
    try {
      await registrarDevolucaoEquipamento(e.id);
      await recarregarEquipamentos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao registrar devolução");
    }
  }

  const formulario = (
    <ItemForm
      tipo="EQUIPAMENTO"
      editando={!!editando}
      saving={saving}
      form={form}
      setForm={setForm}
      lookups={lookups}
      onSubmit={handleSubmit}
      onCancel={() => {
        cancelarEdicao();
        if (viewAtiva === "novo") onNavegar("lista");
      }}
    />
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Gestão de Equipamentos
        </h1>
        <p className="text-sm text-muted-foreground">
          Cadastro, patrimônio e controle de retiradas dos equipamentos.
        </p>
      </header>



      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {viewAtiva === "analises" && (
        <EquipamentosAnalises equipamentos={equipamentos} />
      )}

      {(viewAtiva === "novo" || editando) && formulario}

      {viewAtiva === "lista" && !editando && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar por código, descrição ou patrimônio..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <select
              value={categoriaFiltro}
              onChange={(e) =>
                setCategoriaFiltro(e.target.value ? Number(e.target.value) : "")
              }
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">TODAS AS CATEGORIAS</option>
              {(lookups?.categorias ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {equipamentos.filter(
              (e) =>
                (!categoriaFiltro || e.categoriaId === categoriaFiltro) &&
                (!busca ||
                  `${e.codigo} ${e.descricao} ${e.numeroPatrimonio ?? ""}`.toLowerCase().includes(busca.toLowerCase())),
            ).map((e) => {
              const retiradaEmAberto = e.responsavel != null;
              const novo = retiraForm.equipamentoId === e.id;
              return (
                <Card key={e.id}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-base">
                          {e.codigo}{" "}
                          {e.numeroPatrimonio && (
                            <span className="text-xs font-normal text-muted-foreground">
                              — {e.numeroPatrimonio}
                            </span>
                          )}
                        </CardTitle>
                        <BadgeAtivoEquipamento ativo={e.ativo} />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {e.status?.nome}
                      </span>
                    </div>
                    <CardDescription>{e.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      {e.marca && <span>Marca: {e.marca.nome} · </span>}
                      {e.categoria && <span>{e.categoria.nome}</span>}
                      {e.subcategoria && <span> / {e.subcategoria.nome}</span>}
                      {e.localizacao && <span> · {e.localizacao.nome}</span>}
                      {e.estadoConservacao && (
                        <span> · {e.estadoConservacao.nome}</span>
                      )}
                      {e.dataAquisicao && (
                        <span> · Aquisição: {formatarData(e.dataAquisicao)}</span>
                      )}
                      {e.valorAquisicao != null && (
                        <span> · {formatarValor(e.valorAquisicao)}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {retiradaEmAberto ? (
                          <span className="rounded-md bg-sky-500/10 px-2 py-1 text-xs font-medium text-sky-600">
                            Retirado por {e.responsavel?.nome}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Disponível para retirada
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {novo ? (
                              <form
                                onSubmit={handleRetirar}
                                className="flex flex-wrap items-center gap-2"
                              >
                                <select
                                  required
                                  value={retiraForm.colaboradorId}
                                  onChange={(ev) =>
                                    setRetiraForm({
                                      ...retiraForm,
                                      colaboradorId: ev.target.value
                                        ? Number(ev.target.value)
                                        : "",
                                    })
                                  }
                                  className={cn(selectClasses, "h-10 max-w-[220px]")}
                                >
                                  <option value="" disabled>
                                    Colaborador...
                                  </option>
                                  {usuarios.map((u) => (
                                    <option key={u.id} value={u.id}>
                                      {u.nome}
                                    </option>
                                  ))}
                                </select>
                                <Input
                                  placeholder="Observação (opcional)"
                                  value={retiraForm.observacao}
                                  onChange={(ev) =>
                                    setRetiraForm({
                                      ...retiraForm,
                                      observacao: ev.target.value,
                                    })
                                  }
                                  className="h-10 max-w-[220px]"
                                />
                                <Button
                                  type="submit"
                                  size="sm"
                                  disabled={retiraForm.salvando}
                                >
                                  {retiraForm.salvando ? "Salvando..." : "Confirmar"}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setRetiraForm({
                                      equipamentoId: 0,
                                      colaboradorId: "",
                                      observacao: "",
                                      salvando: false,
                                    })
                                  }
                                >
                                  Cancelar
                                </Button>
                              </form>
                            ) : retiradaEmAberto ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleDevolver(e)}
                              >
                                Registrar devolução
                              </Button>
                            ) : (
                              e.ativo && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setRetiraForm({
                                      equipamentoId: e.id,
                                      colaboradorId: "",
                                      observacao: "",
                                      salvando: false,
                                    })
                                  }
                                >
                                  Registrar retirada
                                </Button>
                              )
                            )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => comecarEdicao(e)}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={excluindo === e.id}
                          onClick={() => handleToggleAtivo(e)}
                        >
                          {e.ativo ? "Desativar" : "Ativar"}
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
              );
            })}
            {!error && equipamentos.filter(
              (e) =>
                (!categoriaFiltro || e.categoriaId === categoriaFiltro) &&
                (!busca ||
                  `${e.codigo} ${e.descricao} ${e.numeroPatrimonio ?? ""}`.toLowerCase().includes(busca.toLowerCase())),
            ).length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum equipamento encontrado.
              </p>
            )}
          </div>
        </>
      )}



      {viewAtiva === "catalogos" && (
        <CatalogosSection
          lookups={lookups}
          relerLookups={async () => {
            try {
              const cats = await listarLookupsEquipamentos();
              setLookups(cats);
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Falha ao recarregar catálogos",
              );
            }
          }}
          subcategoriasPadrao={() => (lookups?.subcategorias ?? []).filter((s) => s.ativo)}
        />
      )}
    </div>
  );
}

// ===========================================================================
// Catálogos (lookups)
// ===========================================================================

function SeletorAtualizacaoLookup({
  item,
  api,
  aoSalvar,
}: {
  item: LookupItem;
  api: {
    atualizar: (id: number, input: Partial<LookupInput> & { ativo?: boolean }) => Promise<unknown>;
  };
  aoSalvar: () => Promise<void>;
}) {
  const [value, setValue] = useState(item.descricao ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function salvar() {
    setBusy(true);
    setErr(null);
    try {
      await api.atualizar(item.id, { descricao: value || undefined });
      await aoSalvar();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Falha ao atualizar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={salvar}
        placeholder="Descrição (opcional)"
        className="h-9 max-w-[220px]"
      />
      {busy && <span className="text-xs text-muted-foreground">Salvando...</span>}
      {err && <span className="text-xs text-destructive">{err}</span>}
    </div>
  );
}

function LinhaLookup({
  item,
  api,
  aoSalvar,
  extra,
}: {
  item: LookupItem;
  api: {
    atualizar: (id: number, input: Partial<LookupInput> & { ativo?: boolean }) => Promise<unknown>;
    desativar: (id: number) => Promise<unknown>;
  };
  aoSalvar: () => Promise<void>;
  extra?: React.ReactNode;
}) {
  const [toggling, setToggling] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function alternarAtivo() {
    setToggling(true);
    setErr(null);
    try {
      await api.atualizar(item.id, { ativo: !item.ativo });
      await aoSalvar();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Falha ao atualizar");
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{item.nome}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              item.ativo
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-muted text-muted-foreground",
            )}
          >
            {item.ativo ? "Ativo" : "Inativo"}
          </span>
        </div>
        {item.descricao && (
          <span className="text-xs text-muted-foreground">{item.descricao}</span>
        )}
        {extra}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SeletorAtualizacaoLookup item={item} api={api} aoSalvar={aoSalvar} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={toggling}
          onClick={alternarAtivo}
        >
          {item.ativo ? "Desativar" : "Ativar"}
        </Button>
      </div>
      {err && <span className="w-full text-xs text-destructive">{err}</span>}
    </div>
  );
}

function CardCatologo({
  titulo,
  descricao,
  itens,
  api,
  aoSalvar,
  formularioNovo,
}: {
  titulo: string;
  descricao: string;
  itens: LookupItem[];
  api: {
    criar: (input: LookupInput) => Promise<unknown>;
    atualizar: (id: number, input: Partial<LookupInput> & { ativo?: boolean }) => Promise<unknown>;
    desativar: (id: number) => Promise<unknown>;
  };
  aoSalvar: () => Promise<void>;
  formularioNovo?: (form: LookupInput, setForm: (f: LookupInput) => void) => React.ReactNode;
}) {
  const [form, setForm] = useState<LookupInput>({ nome: "", descricao: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function criar() {
    if (!form.nome.trim()) return;
    setSaving(true);
    setErr(null);
    try {
      await api.criar({ nome: form.nome.trim(), descricao: form.descricao || undefined });
      setForm({ nome: "", descricao: "" });
      await aoSalvar();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Falha ao cadastrar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{titulo}</CardTitle>
        <CardDescription>{descricao}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Nome do item"
            />
          </div>
          {formularioNovo && formularioNovo(form, setForm)}
        </div>
        {form.descricao !== undefined && (
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input
              value={form.descricao ?? ""}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Descrição (opcional)"
            />
          </div>
        )}
        {err && <span className="text-xs text-destructive">{err}</span>}
        <Button type="button" size="sm" disabled={saving} onClick={criar}>
          {saving ? "Salvando..." : "Adicionar"}
        </Button>
        <div className="space-y-2 pt-2">
          {itens.map((item) => (
            <LinhaLookup key={item.id} item={item} api={api} aoSalvar={aoSalvar} />
          ))}
          {itens.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhum item cadastrado.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ItemFornecedor({ item }: { item: FornecedorItem }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{item.nome}</span>
      <span className="text-xs text-muted-foreground">
        {[item.cnpj && `CNPJ: ${item.cnpj}`, item.telefone && `Tel: ${item.telefone}`, item.email && `Email: ${item.email}`]
          .filter(Boolean)
          .join(" · ") || "Sem contato"}
      </span>
    </div>
  );
}

function CatalogosSection({
  lookups,
  relerLookups,
  subcategoriasPadrao,
}: {
  lookups: EquipamentoLookups | null;
  relerLookups: () => Promise<void>;
  subcategoriasPadrao: () => SubcategoriaItem[];
}) {
  const [categoriaParaSub, setCategoriaParaSub] = useState<number | "">("");
  const [formFornecedor, setFormFornecedor] = useState<FornecedorInput>({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
  });
  const [savingFornecedor, setSavingFornecedor] = useState(false);
  const [formSub, setFormSub] = useState<LookupInput>({ nome: "", descricao: "" });
  const [savingSub, setSavingSub] = useState(false);
  const [errSub, setErrSub] = useState<string | null>(null);
  const [errFornecedor, setErrFornecedor] = useState<string | null>(null);

  if (!lookups) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Carregando catálogos...
      </p>
    );
  }

  async function criarSubcategoria() {
    if (!formSub.nome.trim() || !categoriaParaSub) return;
    setSavingSub(true);
    setErrSub(null);
    try {
      const input: SubcategoriaInput = {
        nome: formSub.nome.trim(),
        descricao: formSub.descricao || undefined,
        categoriaId: Number(categoriaParaSub),
      };
      await subcategoriasApi.criar(input);
      setFormSub({ nome: "", descricao: "" });
      await relerLookups();
    } catch (e) {
      setErrSub(e instanceof Error ? e.message : "Falha ao cadastrar subcategoria");
    } finally {
      setSavingSub(false);
    }
  }

  async function criarFornecedor() {
    if (!formFornecedor.nome.trim()) return;
    setSavingFornecedor(true);
    setErrFornecedor(null);
    try {
      await fornecedoresApi.criar({
        nome: formFornecedor.nome.trim(),
        cnpj: formFornecedor.cnpj || undefined,
        telefone: formFornecedor.telefone || undefined,
        email: formFornecedor.email || undefined,
      });
      setFormFornecedor({ nome: "", cnpj: "", telefone: "", email: "" });
      await relerLookups();
    } catch (e) {
      setErrFornecedor(e instanceof Error ? e.message : "Falha ao cadastrar fornecedor");
    } finally {
      setSavingFornecedor(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <CardCatologo
        titulo="Categorias"
        descricao="Agrupamentos gerais dos equipamentos."
        itens={lookups.categorias}
        api={categoriasApi}
        aoSalvar={relerLookups}
      />
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Subcategorias</CardTitle>
          <CardDescription>Refinamento das categorias.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Categoria pai</Label>
              <select
                value={categoriaParaSub}
                onChange={(e) =>
                  setCategoriaParaSub(e.target.value ? Number(e.target.value) : "")
                }
                className={selectClasses}
              >
                <option value="">Selecione...</option>
                {lookups.categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input
                value={formSub.nome}
                onChange={(e) => setFormSub({ ...formSub, nome: e.target.value })}
                placeholder="Nome da subcategoria"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input
              value={formSub.descricao ?? ""}
              onChange={(e) => setFormSub({ ...formSub, descricao: e.target.value })}
              placeholder="Descrição (opcional)"
            />
          </div>
          {errSub && <span className="text-xs text-destructive">{errSub}</span>}
          <Button type="button" size="sm" disabled={savingSub} onClick={criarSubcategoria}>
            {savingSub ? "Salvando..." : "Adicionar"}
          </Button>
          <div className="space-y-2 pt-2">
            {subcategoriasPadrao()
              .concat()
              .map((s) => {
                const nomeCategoria = lookups.categorias.find(
                  (c) => c.id === s.categoriaId,
                )?.nome;

                return (
                  <LinhaLookup
                    key={s.id}
                    item={s}
                    api={subcategoriasApi}
                    aoSalvar={relerLookups}
                    extra={
                      <span className="text-xs text-muted-foreground">
                        Categoria: {nomeCategoria ?? "—"}
                      </span>
                    }
                  />
                );
              })}
            {subcategoriasPadrao().length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhuma subcategoria cadastrada.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <CardCatologo
        titulo="Marcas"
        descricao="Fabricantes dos equipamentos."
        itens={lookups.marcas}
        api={marcasApi}
        aoSalvar={relerLookups}
      />
      <CardCatologo
        titulo="Localizações"
        descricao="Onde os equipamentos ficam instalados."
        itens={lookups.localizacoes}
        api={localizacoesApi}
        aoSalvar={relerLookups}
      />
      <CardCatologo
        titulo="Status de equipamento"
        descricao="Situação operacional do equipamento."
        itens={lookups.statuses}
        api={statusEquipamentoApi}
        aoSalvar={relerLookups}
      />
      <CardCatologo
        titulo="Estados de conservação"
        descricao="Condição física do equipamento."
        itens={lookups.estadosConservacao}
        api={estadosConservacaoApi}
        aoSalvar={relerLookups}
      />
      <CardCatologo
        titulo="Tipos de manutenção"
        descricao="Classificação das manutenções."
        itens={lookups.tiposManutencao}
        api={tiposManutencaoApi}
        aoSalvar={relerLookups}
      />
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Fornecedores</CardTitle>
          <CardDescription>Empresas que fornecem equipamentos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input
                value={formFornecedor.nome}
                onChange={(e) =>
                  setFormFornecedor({ ...formFornecedor, nome: e.target.value })
                }
                placeholder="Nome do fornecedor"
              />
            </div>
            <div className="space-y-1.5">
              <Label>CNPJ</Label>
              <Input
                value={formFornecedor.cnpj ?? ""}
                onChange={(e) =>
                  setFormFornecedor({ ...formFornecedor, cnpj: e.target.value })
                }
                placeholder="Opcional"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input
                value={formFornecedor.telefone ?? ""}
                onChange={(e) =>
                  setFormFornecedor({ ...formFornecedor, telefone: e.target.value })
                }
                placeholder="Opcional"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={formFornecedor.email ?? ""}
                onChange={(e) =>
                  setFormFornecedor({ ...formFornecedor, email: e.target.value })
                }
                placeholder="Opcional"
              />
            </div>
          </div>
          {errFornecedor && <span className="text-xs text-destructive">{errFornecedor}</span>}
          <Button
            type="button"
            size="sm"
            disabled={savingFornecedor}
            onClick={criarFornecedor}
          >
            {savingFornecedor ? "Salvando..." : "Adicionar"}
          </Button>
          <div className="space-y-2 pt-2">
            {lookups.fornecedores.map((item) => (
              <LinhaLookup
                key={item.id}
                item={item as unknown as LookupItem}
                api={fornecedoresApi}
                aoSalvar={relerLookups}
                extra={<ItemFornecedor item={item} />}
              />
            ))}
            {lookups.fornecedores.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum fornecedor cadastrado.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}