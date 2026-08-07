import { prisma } from "../db";

export const dashboardService = {
  async resumo() {
    const [atendimentosNovos, osAguardando, osAgendadas, osAndamento, orcamentosAbertos, comprasPendentes, materiaisBaixo] =
      await Promise.all([
        prisma.atendimento.count({ where: { status: "NOVO" } }),
        prisma.ordemServico.count({ where: { status: "AGUARDANDO_APROVACAO" } }),
        prisma.ordemServico.count({ where: { status: "AGENDADO" } }),
        prisma.ordemServico.count({ where: { status: "EM_ANDAMENTO" } }),
        prisma.orcamento.count({ where: { status: { in: ["RASCUNHO", "ENVIADO"] } } }),
        prisma.compra.count({ where: { status: { in: ["PENDENTE", "APROVADA"] } } }),
        prisma.material.findMany({
          where: { status: "ATIVO" },
          include: { saldo: true },
        }),
      ]);
    const baixaEstoque = materiaisBaixo.filter(
      (m) => m.saldo && Number(m.saldo.saldo) <= Number(m.quantidadeMinima ?? 0),
    );
    return {
      atendimentosNovos,
      osAguardando,
      osAgendadas,
      osAndamento,
      orcamentosAbertos,
      comprasPendentes,
      baixaEstoque: baixaEstoque.length,
    };
  },

  async kanbanOs() {
    const status = [
      "AGUARDANDO_APROVACAO",
      "AGENDADO",
      "EM_SEPARACAO",
      "SEPARADO",
      "EM_ANDAMENTO",
      "CONCLUIDO",
      "CONFIRMADO",
      "ENTREGUE",
      "CANCELADO",
    ] as const;
    const colunas: Record<string, unknown[]> = {};
    for (const s of status) {
      colunas[s] = await prisma.ordemServico.findMany({
        where: { status: s },
        include: {
          cliente: { select: { nome: true } },
          tecnicoResponsavel: { select: { nome: true } },
        },
        orderBy: { dataInicioPrevista: "asc" },
      });
    }
    return colunas;
  },
};
