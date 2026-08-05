import { useState, useEffect } from "react";
import {
  OrdemServicoAdminItem,
  listarOSAdmin,
  aprovarOSAdmin,
  iniciarOSAdmin,
  concluirOSAdmin,
  cancelarOSAdmin,
} from "../lib/api";

interface OSAnalisesProps {
  osList: OrdemServicoAdminItem[];
}

export function OSAnalises({ osList }: OSAnalisesProps) {
  const total = osList.length;
  const aguardandoAprovacao = osList.filter((o) => o.status === "AGUARDANDO_APROVACAO").length;
  const agendadas = osList.filter((o) => o.status === "AGENDADO").length;
  const emAndamento = osList.filter((o) => o.status === "EM_ANDAMENTO").length;
  const concluidas = osList.filter((o) => o.status === "CONCLUIDO" || o.status === "CONFIRMADO" || o.status === "ENTREGUE").length;
  const canceladas = osList.filter((o) => o.status === "CANCELADO").length;

  const valorTotalSum = osList.reduce((acc, o) => acc + Number(o.valorTotal || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Análises de Ordens de Serviço</h2>
        <p className="text-sm text-muted-foreground">
          Métricas de execução de obras, status das OS e faturamento.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total de OS</p>
          <p className="mt-2 text-2xl font-bold">{total}</p>
          <p className="text-xs text-muted-foreground mt-1">
            R$ {valorTotalSum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Aguardando Aprovação</p>
          <p className="mt-2 text-2xl font-bold">{aguardandoAprovacao}</p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Agendadas / Em Separação</p>
          <p className="mt-2 text-2xl font-bold">{agendadas}</p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Em Andamento</p>
          <p className="mt-2 text-2xl font-bold">{emAndamento}</p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Concluídas / Entregues</p>
          <p className="mt-2 text-2xl font-bold">{concluidas}</p>
          <p className="text-xs text-muted-foreground mt-1">{canceladas} canceladas</p>
        </div>
      </div>
    </div>
  );
}

interface OSListProps {
  osList: OrdemServicoAdminItem[];
  loading: boolean;
  busca: string;
  onBuscaChange: (v: string) => void;
  statusFiltro: string;
  onStatusFiltroChange: (v: string) => void;
  onAprovar: (id: number) => void;
  onIniciar: (id: number) => void;
  onConcluir: (id: number) => void;
  onCancelar: (id: number) => void;
  onVisualizar: (os: OrdemServicoAdminItem) => void;
}

export function OSList({
  osList,
  loading,
  busca,
  onBuscaChange,
  statusFiltro,
  onStatusFiltroChange,
  onAprovar,
  onIniciar,
  onConcluir,
  onCancelar,
  onVisualizar,
}: OSListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Lista de Ordens de Serviço</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie o progresso e execução das obras e serviços.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por código, cliente ou endereço..."
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
          <option value="AGUARDANDO_APROVACAO">AGUARDANDO APROVAÇÃO</option>
          <option value="AGENDADO">AGENDADO</option>
          <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
          <option value="CONCLUIDO">CONCLUÍDO</option>

          <option value="CANCELADO">CANCELADO</option>
        </select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Cliente / Contato</th>
              <th className="px-4 py-3">Valor Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Início Previsto</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Carregando ordens de serviço...
                </td>
              </tr>
            ) : osList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhuma ordem de serviço encontrada.
                </td>
              </tr>
            ) : (
              osList.map((item) => (
                <tr key={item.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground">{item.codigo}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">
                      {item.cliente?.nome || item.contato?.nome || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    R$ {Number(item.valorTotal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.status === "AGUARDANDO_APROVACAO"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          : item.status === "EM_ANDAMENTO"
                          ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300"
                          : item.status === "CONCLUIDO" || item.status === "ENTREGUE" || item.status === "CONFIRMADO"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : item.status === "CANCELADO"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {item.dataInicioPrevista
                      ? new Date(item.dataInicioPrevista).toLocaleDateString("pt-BR")
                      : "A definir"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onVisualizar(item)}
                        className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-accent transition-colors"
                      >
                        Ver
                      </button>
                      {item.status === "AGUARDANDO_APROVACAO" && (
                        <button
                          type="button"
                          onClick={() => onAprovar(item.id)}
                          className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                        >
                          Aprovar
                        </button>
                      )}
                      {item.status === "AGENDADO" && (
                        <button
                          type="button"
                          onClick={() => onIniciar(item.id)}
                          className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                        >
                          Iniciar
                        </button>
                      )}
                      {item.status === "EM_ANDAMENTO" && (
                        <button
                          type="button"
                          onClick={() => onConcluir(item.id)}
                          className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                        >
                          Concluir
                        </button>
                      )}
                      {item.status !== "CANCELADO" && item.status !== "CONCLUIDO" && (
                        <button
                          type="button"
                          onClick={() => onCancelar(item.id)}
                          className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100 transition-colors"
                        >
                          Cancelar
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

interface NovaOSInfoProps {
  onGoToOrcamentos: () => void;
}

export function NovaOSInfo({ onGoToOrcamentos }: NovaOSInfoProps) {
  return (
    <div className="max-w-xl space-y-4 rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-bold tracking-tight">Nova Ordem de Serviço</h2>
      <p className="text-sm text-muted-foreground">
        As Ordens de Serviço (OS) são geradas automaticamente a partir da confirmação/aprovação de um <strong>Orçamento</strong>.
      </p>
      <p className="text-sm text-muted-foreground">
        Para criar um novo serviço, vá até o menu de Orçamentos e emita uma nova proposta vinculada a uma Visita Técnica.
      </p>
      <div className="pt-2">
        <button
          type="button"
          onClick={onGoToOrcamentos}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          Ir para Orçamentos
        </button>
      </div>
    </div>
  );
}

interface OSAdminPageProps {
  viewAtiva?: "analises" | "lista" | "novo";
  onGoToOrcamentos?: () => void;
}

export function OSAdminPage({ viewAtiva = "lista", onGoToOrcamentos }: OSAdminPageProps) {
  const [osList, setOsList] = useState<OrdemServicoAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [osSelecionada, setOsSelecionada] = useState<OrdemServicoAdminItem | null>(null);



  const carregarOS = async () => {
    setLoading(true);
    try {
      const data = await listarOSAdmin({ status: statusFiltro || undefined, q: busca || undefined });
      setOsList(data);
    } catch (err) {
      console.error("Erro ao listar ordens de serviço:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarOS();
  }, [busca, statusFiltro]);

  const handleAprovar = async (id: number) => {
    try {
      await aprovarOSAdmin(id);
      await carregarOS();
    } catch (err) {
      console.error("Erro ao aprovar OS:", err);
    }
  };

  const handleIniciar = async (id: number) => {
    try {
      await iniciarOSAdmin(id);
      await carregarOS();
    } catch (err) {
      console.error("Erro ao iniciar OS:", err);
    }
  };

  const handleConcluir = async (id: number) => {
    try {
      await concluirOSAdmin(id);
      await carregarOS();
    } catch (err) {
      console.error("Erro ao concluir OS:", err);
    }
  };

  const handleCancelar = async (id: number) => {
    try {
      await cancelarOSAdmin(id);
      await carregarOS();
    } catch (err) {
      console.error("Erro ao cancelar OS:", err);
    }
  };

  return (
    <div className="p-6">
      {viewAtiva === "analises" && <OSAnalises osList={osList} />}
      {viewAtiva === "lista" && (
        <OSList
          osList={osList}
          loading={loading}
          busca={busca}
          onBuscaChange={setBusca}
          statusFiltro={statusFiltro}
          onStatusFiltroChange={setStatusFiltro}
          onAprovar={handleAprovar}
          onIniciar={handleIniciar}
          onConcluir={handleConcluir}
          onCancelar={handleCancelar}
          onVisualizar={(os) => setOsSelecionada(os)}
        />
      )}
      {viewAtiva === "novo" && (
        <NovaOSInfo onGoToOrcamentos={onGoToOrcamentos || (() => {})} />
      )}

      {/* Modal de Detalhes da OS */}
      {osSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-card p-5 shadow-lg space-y-4 border">
            <h3 className="text-lg font-bold">Ordem de Serviço #{osSelecionada.codigo}</h3>
            <div className="text-sm space-y-2 text-muted-foreground">
              <p><strong className="text-foreground">Cliente / Contato:</strong> {osSelecionada.cliente?.nome || osSelecionada.contato?.nome || "N/A"}</p>
              <p><strong className="text-foreground">Status:</strong> {osSelecionada.status}</p>
              <p><strong className="text-foreground">Urgência:</strong> {osSelecionada.urgencia}</p>
              <p><strong className="text-foreground">Valor Total:</strong> R$ {Number(osSelecionada.valorTotal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p><strong className="text-foreground">Endereço:</strong> {osSelecionada.endereco || "Não especificado"}</p>
              <p><strong className="text-foreground">Técnico Responsável:</strong> {osSelecionada.tecnicoResponsavel?.nome || "Não atribuído"}</p>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setOsSelecionada(null)}
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
