import { FormaPagamento, OrigemLancamento, TipoLancamento } from "@prisma/client";
import { prisma } from "../db";
import { AppError } from "../lib/errors";
import { Ctx } from "../lib/ctx";

export const financeiroService = {
  async resumo(filtro: { de?: string; ate?: string }) {
    const onde = {
      data: {
        gte: filtro.de ? new Date(filtro.de) : undefined,
        lte: filtro.ate ? new Date(filtro.ate) : undefined,
      },
    };
    const [entradas, saidas, lancamentos] = await Promise.all([
      prisma.lancamentoFinanceiro.aggregate({
        _sum: { valor: true },
        where: { ...onde, tipo: "ENTRADA" },
      }),
      prisma.lancamentoFinanceiro.aggregate({
        _sum: { valor: true },
        where: { ...onde, tipo: "SAIDA" },
      }),
      prisma.lancamentoFinanceiro.findMany({
        where: onde,
        include: { criadoPor: { select: { nome: true } } },
        orderBy: { data: "desc" },
        take: 100,
      }),
    ]);
    return {
      entradas: Number(entradas._sum.valor ?? 0),
      saidas: Number(saidas._sum.valor ?? 0),
      saldo: Number(entradas._sum.valor ?? 0) - Number(saidas._sum.valor ?? 0),
      lancamentos,
    };
  },

  async listarLancamentos(filtro: { tipo?: string; origem?: string }) {
    return prisma.lancamentoFinanceiro.findMany({
      where: {
        tipo: filtro.tipo ? (filtro.tipo as TipoLancamento) : undefined,
        origem: filtro.origem ? (filtro.origem as OrigemLancamento) : undefined,
      },
      include: { criadoPor: { select: { nome: true } } },
      orderBy: { data: "desc" },
      take: 500,
    });
  },

  async registrarPagamentoOs(
    osId: number,
    data: { valor: number; formaPagamento: FormaPagamento; observacoes?: string },
    ctx: Ctx,
  ) {
    return prisma.$transaction(async (tx) => {
      const os = await tx.ordemServico.findUnique({ where: { id: osId } });
      if (!os) throw new AppError(404, "Ordem de serviço não encontrada");
      const lancamento = await tx.lancamentoFinanceiro.create({
        data: {
          tipo: TipoLancamento.ENTRADA,
          descricao: `Pagamento OS ${os.codigo}`,
          valor: data.valor,
          formaPagamento: data.formaPagamento,
          origem: OrigemLancamento.PAGAMENTO,
          origemId: osId,
          criadoPorId: ctx.userId,
        },
      });
      return tx.pagamentoOS.create({
        data: {
          ordemServicoId: osId,
          valor: data.valor,
          formaPagamento: data.formaPagamento,
          observacoes: data.observacoes,
          registradoPorId: ctx.userId,
          lancamentoId: lancamento.id,
        },
      });
    });
  },
};
