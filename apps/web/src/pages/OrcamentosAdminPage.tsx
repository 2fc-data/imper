import { useState, useEffect } from "react";
import {
  OrcamentoAdminItem,
  TipoItemServico,
  ItemOrcamentoInput,
  listarOrcamentosAdmin,
  criarOrcamentoAdmin,
  enviarOrcamentoAdmin,
} from "../lib/api";

interface OrcamentosAnalisesProps {
  orcamentos: OrcamentoAdminItem[];
}

export function OrcamentosAnalises({ orcamentos }: OrcamentosAnalisesProps) {
  const total = orcamentos.length;
  const rascunho = orcamentos.filter((o) => o.status === "RASCUNHO").length;
  const enviados = orcamentos.filter((o) => o.status === "ENVIADO").length;
  const aprovados = orcamentos.filter((o) => o.status === "APROVADO").length;
  const recusados = orcamentos.filter((o) => o.status === "RECUSADO").length;

  const valorTotalSum = orcamentos.reduce(
    (acc, o) => acc + Number(o.valorTotal || 0),
    0
  );

  const valorAprovadoSum = orcamentos
    .filter((o) => o.status === "APROVADO")
    .reduce((acc, o) => acc + Number(o.valorTotal || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Análises de Orçamentos</h2>
        <p className="text-sm text-muted-foreground">
          Métricas financeiras, conversão e visão geral dos orçamentos emitidos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Emitido</p>
          <p className="mt-2 text-2xl font-bold">
            R$ {valorTotalSum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{total} orçamentos</p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Total Aprovado</p>
          <p className="mt-2 text-2xl font-bold">
            R$ {valorAprovadoSum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{aprovados} aprovados</p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Aguardando Envio/Aprovação</p>
          <p className="mt-2 text-2xl font-bold">{rascunho + enviados}</p>
          <p className="text-xs text-muted-foreground mt-1">{rascunho} rascunho / {enviados} enviados</p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Recusados / Expirados</p>
          <p className="mt-2 text-2xl font-bold">{recusados}</p>
        </div>
      </div>
    </div>
  );
}

interface OrcamentoListProps {
  orcamentos: OrcamentoAdminItem[];
  loading: boolean;
  busca: string;
  onBuscaChange: (v: string) => void;
  statusFiltro: string;
  onStatusFiltroChange: (v: string) => void;
  onEnviar: (id: number) => void;
  onVisualizar: (orcamento: OrcamentoAdminItem) => void;
}

export function OrcamentoList({
  orcamentos,
  loading,
  busca,
  onBuscaChange,
  statusFiltro,
  onStatusFiltroChange,
  onEnviar,
  onVisualizar,
}: OrcamentoListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Lista de Orçamentos</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os orçamentos da empresa e seus status.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por código ou contato..."
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <select
          value={statusFiltro}
          onChange={(e) => onStatusFiltroChange(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Todos os status</option>
          <option value="RASCUNHO">RASCUNHO</option>
          <option value="ENVIADO">ENVIADO</option>
          <option value="APROVADO">APROVADO</option>
          <option value="RECUSADO">RECUSADO</option>
          <option value="EXPIRADO">EXPIRADO</option>
          <option value="CANCELADO">CANCELADO</option>
        </select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Contato / Visita</th>
              <th className="px-4 py-3">Valor Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Validade</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Carregando orçamentos...
                </td>
              </tr>
            ) : orcamentos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum orçamento encontrado.
                </td>
              </tr>
            ) : (
              orcamentos.map((item) => (
                <tr key={item.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground">{item.codigo}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">
                      {item.visita?.contato?.nome || `Visita #${item.visitaId}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    R$ {Number(item.valorTotal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.status === "RASCUNHO"
                          ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          : item.status === "ENVIADO"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                          : item.status === "APROVADO"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : item.status === "RECUSADO" || item.status === "CANCELADO"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(item.validade).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onVisualizar(item)}
                        className="rounded-md border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                      >
                        Visualizar
                      </button>
                      {item.status === "RASCUNHO" && (
                        <button
                          type="button"
                          onClick={() => onEnviar(item.id)}
                          className="rounded-md border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                        >
                          Enviar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface NovoOrcamentoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function NovoOrcamentoForm({ onSuccess, onCancel }: NovoOrcamentoFormProps) {
  const [visitaId, setVisitaId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [itens, setItens] = useState<ItemOrcamentoInput[]>([
    { nome: "", tipo: "SERVICO", quantidade: 1, unidade: "UN", valorUnitario: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const adicionarItem = () => {
    setItens([
      ...itens,
      { nome: "", tipo: "SERVICO", quantidade: 1, unidade: "UN", valorUnitario: 0 },
    ]);
  };

  const removerItem = (index: number) => {
    if (itens.length === 1) return;
    setItens(itens.filter((_, i) => i !== index));
  };

  const atualizarItem = (index: number, field: keyof ItemOrcamentoInput, val: any) => {
    const novosItens = [...itens];
    novosItens[index] = { ...novosItens[index], [field]: val };
    setItens(novosItens);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    try {
      await criarOrcamentoAdmin({
        visitaId: Number(visitaId),
        observacoes,
        itens,
      });
      onSuccess();
    } catch (err: any) {
      setErro(err?.message || "Falha ao criar orçamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Novo Orçamento</h2>
        <p className="text-sm text-muted-foreground">
          Gere uma nova proposta orçamentária associada a uma Visita Técnica.
        </p>
      </div>

      {erro && (
        <div className="rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 p-3 text-sm text-rose-700 dark:text-rose-300">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-card p-5 shadow-sm">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">ID da Visita Técnica *</label>
          <input
            type="number"
            required
            value={visitaId}
            onChange={(e) => setVisitaId(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Ex: 1"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">Itens do Orçamento *</label>
            <button
              type="button"
              onClick={adicionarItem}
              className="text-xs font-medium text-primary hover:underline"
            >
              + Adicionar Item
            </button>
          </div>

          {itens.map((item, idx) => (
            <div key={idx} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-12 items-center bg-muted/20">
              <div className="sm:col-span-4">
                <input
                  type="text"
                  required
                  placeholder="Nome do item/serviço"
                  value={item.nome}
                  onChange={(e) => atualizarItem(idx, "nome", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <select
                  value={item.tipo}
                  onChange={(e) => atualizarItem(idx, "tipo", e.target.value as TipoItemServico)}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                >
                  <option value="SERVICO">SERVIÇO</option>
                  <option value="MATERIAL">MATERIAL</option>
                  <option value="EQUIPAMENTO">EQUIPAMENTO</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Qtd"
                  value={item.quantidade}
                  onChange={(e) => atualizarItem(idx, "quantidade", Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Valor Unit. R$"
                  value={item.valorUnitario}
                  onChange={(e) => atualizarItem(idx, "valorUnitario", Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => removerItem(idx)}
                  className="text-xs text-rose-500 hover:underline"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Observações</label>
          <textarea
            rows={3}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Observações internas ou adicionais..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Gerando..." : "Gerar Orçamento"}
          </button>
        </div>
      </form>
    </div>
  );
}

interface OrcamentosAdminPageProps {
  initialView?: "analises" | "lista" | "novo";
  onNavegar?: (view: "analises" | "lista" | "novo") => void;
}

export function OrcamentosAdminPage({ initialView = "lista", onNavegar }: OrcamentosAdminPageProps) {
  const [viewAtiva, setViewAtiva] = useState<"analises" | "lista" | "novo">(initialView);
  const [orcamentos, setOrcamentos] = useState<OrcamentoAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState<OrcamentoAdminItem | null>(null);

  const mudarView = (novaView: "analises" | "lista" | "novo") => {
    setViewAtiva(novaView);
    if (onNavegar) onNavegar(novaView);
  };

  const carregarOrcamentos = async () => {
    setLoading(true);
    try {
      const data = await listarOrcamentosAdmin({ status: statusFiltro || undefined, q: busca || undefined });
      setOrcamentos(data);
    } catch (err) {
      console.error("Erro ao listar orçamentos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarOrcamentos();
  }, [busca, statusFiltro]);

  const handleEnviar = async (id: number) => {
    try {
      await enviarOrcamentoAdmin(id);
      await carregarOrcamentos();
    } catch (err) {
      console.error("Erro ao enviar orçamento:", err);
    }
  };

  return (
    <div className="p-6">
      {viewAtiva === "analises" && <OrcamentosAnalises orcamentos={orcamentos} />}
      {viewAtiva === "lista" && (
        <OrcamentoList
          orcamentos={orcamentos}
          loading={loading}
          busca={busca}
          onBuscaChange={setBusca}
          statusFiltro={statusFiltro}
          onStatusFiltroChange={setStatusFiltro}
          onEnviar={handleEnviar}
          onVisualizar={(orcamento) => setOrcamentoSelecionado(orcamento)}
        />
      )}
      {viewAtiva === "novo" && (
        <NovoOrcamentoForm
          onSuccess={() => {
            mudarView("lista");
            carregarOrcamentos();
          }}
          onCancel={() => mudarView("lista")}
        />
      )}

      {/* Modal de Visualização */}
      {orcamentoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-card p-5 shadow-lg space-y-4 border">
            <h3 className="text-lg font-bold">Orçamento #{orcamentoSelecionado.codigo}</h3>
            <div className="text-sm space-y-2 text-muted-foreground">
              <p><strong className="text-foreground">Contato:</strong> {orcamentoSelecionado.visita?.contato?.nome || "N/A"}</p>
              <p><strong className="text-foreground">Status:</strong> {orcamentoSelecionado.status}</p>
              <p><strong className="text-foreground">Valor Total:</strong> R$ {Number(orcamentoSelecionado.valorTotal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p><strong className="text-foreground">Validade:</strong> {new Date(orcamentoSelecionado.validade).toLocaleDateString("pt-BR")}</p>
              <p><strong className="text-foreground">Observações:</strong> {orcamentoSelecionado.observacoes || "Nenhuma observação registrada."}</p>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setOrcamentoSelecionado(null)}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
