import { useState, useEffect } from "react";
import {
  ContatoItem,
  CanalContato,
  TipoContato,
  StatusContato,
  Urgencia,
  listarContatos,
  criarContato,
  atualizarStatusContato,
} from "../lib/api";

interface ContatosAnalisesProps {
  contatos: ContatoItem[];
}

export function ContatosAnalises({ contatos }: ContatosAnalisesProps) {
  const total = contatos.length;
  const novos = contatos.filter((c) => c.status === "NOVO").length;
  const emAndamento = contatos.filter((c) => c.status === "EM_ANDAMENTO").length;
  const concluidos = contatos.filter((c) => c.status === "CONCLUIDO").length;
  const inativos = contatos.filter((c) => c.status === "INATIVO").length;

  const porCanal = contatos.reduce((acc, c) => {
    acc[c.canal] = (acc[c.canal] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const porTipo = contatos.reduce((acc, c) => {
    acc[c.tipo] = (acc[c.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Análises de Contatos</h2>
        <p className="text-sm text-muted-foreground">
          Visão geral do volume, status e canais de atendimento dos contatos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total de Contatos</p>
          <p className="mt-2 text-2xl font-bold">{total}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Novos</p>
          <p className="mt-2 text-2xl font-bold">{novos}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Em Andamento</p>
          <p className="mt-2 text-2xl font-bold">{emAndamento}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Concluídos</p>
          <p className="mt-2 text-2xl font-bold">{concluidos}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Inativos</p>
          <p className="mt-2 text-2xl font-bold">{inativos}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
          <h3 className="font-semibold text-base">Distribuição por Canal</h3>
          <div className="space-y-2">
            {Object.entries(porCanal).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum dado registrado.</p>
            ) : (
              Object.entries(porCanal).map(([canal, qtd]) => {
                const perc = total ? Math.round((qtd / total) * 100) : 0;
                return (
                  <div key={canal} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{canal}</span>
                      <span>{qtd} ({perc}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-accent/40 overflow-hidden">
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
          <h3 className="font-semibold text-base">Distribuição por Tipo</h3>
          <div className="space-y-2">
            {Object.entries(porTipo).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum dado registrado.</p>
            ) : (
              Object.entries(porTipo).map(([tipo, qtd]) => {
                const perc = total ? Math.round((qtd / total) * 100) : 0;
                return (
                  <div key={tipo} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{tipo}</span>
                      <span>{qtd} ({perc}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-accent/40 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all"
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

interface ContatoListProps {
  contatos: ContatoItem[];
  loading: boolean;
  busca: string;
  onBuscaChange: (v: string) => void;
  statusFiltro: string;
  onStatusFiltroChange: (v: string) => void;
  onDesativar: (id: number) => void;
  onEditar: (contato: ContatoItem) => void;
}

export function ContatoList({
  contatos,
  loading,
  busca,
  onBuscaChange,
  statusFiltro,
  onStatusFiltroChange,
  onDesativar,
  onEditar,
}: ContatoListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Lista de Contatos</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie todas as interações e contatos recebidos.
          </p>
        </div>
      </div>

      {/* Barra de busca e filtros */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por nome, cliente ou descrição..."
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
          <option value="NOVO">NOVO</option>
          <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
          <option value="ENCAMINHADO">ENCAMINHADO</option>
          <option value="CONCLUIDO">CONCLUÍDO</option>
          <option value="INATIVO">INATIVO</option>
        </select>
      </div>

      {/* Tabela de contatos */}
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Canal / Tipo</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Carregando contatos...
                </td>
              </tr>
            ) : contatos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum contato encontrado.
                </td>
              </tr>
            ) : (
              contatos.map((item) => (
                <tr key={item.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{item.nome}</div>
                    {item.cliente && (
                      <div className="text-xs text-muted-foreground">Cliente: {item.cliente.nome}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.telefone}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold">{item.canal}</div>
                    <div className="text-xs text-muted-foreground">{item.tipo}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.status === "NOVO"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                          : item.status === "EM_ANDAMENTO"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          : item.status === "CONCLUIDO"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : item.status === "INATIVO"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEditar(item)}
                        className="rounded-md border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                      >
                        Editar
                      </button>
                      {item.status !== "INATIVO" && (
                        <button
                          type="button"
                          onClick={() => onDesativar(item.id)}
                          className="rounded-md border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                        >
                          Desativar
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

interface NovoContatoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function NovoContatoForm({ onSuccess, onCancel }: NovoContatoFormProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [canal, setCanal] = useState<CanalContato>("WHATSAPP");
  const [tipo, setTipo] = useState<TipoContato>("DUVIDA");
  const [urgencia, setUrgencia] = useState<Urgencia>("NORMAL");
  const [assunto, setAssunto] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    try {
      await criarContato({
        nome,
        telefone,
        canal,
        tipo,
        urgencia,
        assunto,
        descricao,
      });
      onSuccess();
    } catch (err: any) {
      setErro(err?.message || "Falha ao cadastrar contato");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Novo Contato</h2>
        <p className="text-sm text-muted-foreground">
          Registre uma nova interação ou atendimento a um contato.
        </p>
      </div>

      {erro && (
        <div className="rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 p-3 text-sm text-rose-700 dark:text-rose-300">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Nome *</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Nome do contato"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Telefone *</label>
            <input
              type="text"
              required
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Canal</label>
            <select
              value={canal}
              onChange={(e) => setCanal(e.target.value as CanalContato)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="WHATSAPP">WHATSAPP</option>
              <option value="FORMULARIO">FORMULÁRIO</option>
              <option value="LOJA">LOJA</option>
              <option value="TELEFONE">TELEFONE</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoContato)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="DUVIDA">DÚVIDA</option>
              <option value="AGENDAR_VISITA">AGENDAR VISITA</option>
              <option value="COMPRA_MATERIAL">COMPRA MATERIAL</option>
              <option value="COMPRA_EQUIPAMENTO">COMPRA EQUIPAMENTO</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Urgência</label>
            <select
              value={urgencia}
              onChange={(e) => setUrgencia(e.target.value as Urgencia)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="NORMAL">NORMAL</option>
              <option value="URGENTE">URGENTE</option>
              <option value="URGENTISSIMO">URGENTÍSSIMO</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Assunto *</label>
          <input
            type="text"
            required
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Assunto principal do atendimento"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Descrição</label>
          <textarea
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Detalhes da solicitação..."
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
            {loading ? "Salvando..." : "Salvar Contato"}
          </button>
        </div>
      </form>
    </div>
  );
}

interface ContatosAdminPageProps {
  initialView?: "analises" | "lista" | "novo";
  onNavegar?: (view: "analises" | "lista" | "novo") => void;
}

export function ContatosAdminPage({ initialView = "lista", onNavegar }: ContatosAdminPageProps) {
  const [viewAtiva, setViewAtiva] = useState<"analises" | "lista" | "novo">(initialView);
  const [contatos, setContatos] = useState<ContatoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [contatoEditando, setContatoEditando] = useState<ContatoItem | null>(null);

  const mudarView = (novaView: "analises" | "lista" | "novo") => {
    setViewAtiva(novaView);
    if (onNavegar) onNavegar(novaView);
  };

  const carregarContatos = async () => {
    setLoading(true);
    try {
      const data = await listarContatos({ status: statusFiltro || undefined, q: busca || undefined });
      setContatos(data);
    } catch (err) {
      console.error("Erro ao listar contatos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarContatos();
  }, [busca, statusFiltro]);

  const handleDesativar = async (id: number) => {
    try {
      await atualizarStatusContato(id, "INATIVO");
      await carregarContatos();
    } catch (err) {
      console.error("Erro ao desativar contato:", err);
    }
  };

  const handleAtualizarStatusModal = async (status: StatusContato) => {
    if (!contatoEditando) return;
    try {
      await atualizarStatusContato(contatoEditando.id, status);
      setContatoEditando(null);
      await carregarContatos();
    } catch (err) {
      console.error("Erro ao atualizar status do contato:", err);
    }
  };

  return (
    <div className="p-6">
      {viewAtiva === "analises" && <ContatosAnalises contatos={contatos} />}
      {viewAtiva === "lista" && (
        <ContatoList
          contatos={contatos}
          loading={loading}
          busca={busca}
          onBuscaChange={setBusca}
          statusFiltro={statusFiltro}
          onStatusFiltroChange={setStatusFiltro}
          onDesativar={handleDesativar}
          onEditar={(contato) => setContatoEditando(contato)}
        />
      )}
      {viewAtiva === "novo" && (
        <NovoContatoForm
          onSuccess={() => {
            mudarView("lista");
            carregarContatos();
          }}
          onCancel={() => mudarView("lista")}
        />
      )}

      {/* Modal de Edição de Status / Detalhes */}
      {contatoEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-5 shadow-lg space-y-4 border">
            <h3 className="text-lg font-bold">Editar Contato #{contatoEditando.id}</h3>
            <div className="text-sm space-y-1.5 text-muted-foreground">
              <p><strong className="text-foreground">Nome:</strong> {contatoEditando.nome}</p>
              <p><strong className="text-foreground">Telefone:</strong> {contatoEditando.telefone}</p>
              <p><strong className="text-foreground">Descrição:</strong> {contatoEditando.descricao || "Sem descrição"}</p>
              <p><strong className="text-foreground">Status Atual:</strong> {contatoEditando.status}</p>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-foreground">Alterar Status</label>
              <select
                defaultValue={contatoEditando.status}
                onChange={(e) => handleAtualizarStatusModal(e.target.value as StatusContato)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
              >
                <option value="NOVO">NOVO</option>
                <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
                <option value="ENCAMINHADO">ENCAMINHADO</option>
                <option value="CONCLUIDO">CONCLUÍDO</option>
                <option value="INATIVO">INATIVO</option>
              </select>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setContatoEditando(null)}
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
