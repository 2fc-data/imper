import { FormaPagamento, OrigemLancamento, StatusVenda, TipoLancamento } from "@prisma/client";
import { prisma } from "../db";
import { AppError } from "../lib/errors";
import { Ctx } from "../lib/ctx";
import { aplicarMovimento } from "../lib/estoque";
import { gerarCodigo } from "../lib/prazos";

export const vendaService = {
  async listar(filtro: { status?: string; q?: string }) {
    return prisma.venda.findMany({
      where: {
        status: filtro.status ? (filtro.status as StatusVenda) : undefined,
        OR: filtro.q ? [{ codigo: { contains: filtro.q } }] : undefined,
      },
      include: {
        atendimento: { select: { id: true } },
        cliente: { select: { id: true, nome: true } },
        itens: { include: { material: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async detalhar(id: number) {
    const venda = await prisma.venda.findUnique({
      where: { id },
      include: {
        atendimento: { select: { id: true, cliente: { select: { id: true, nome: true } } } },
        cliente: true,
        ordemServico: { select: { id: true, codigo: true } },
        itens: { include: { material: true } },
      },
    });
    if (!venda) throw new AppError(404, "Venda não encontrada");
    return venda;
  },

  async criar(
    data: {
      atendimentoId?: number;
      clienteId?: number;
      ordemServicoId?: number;
      itens: { materialId: number; quantidade: number; valorUnitario: number }[];
    },
    ctx: Ctx,
  ) {
    if (!data.itens.length) throw new AppError(422, "Informe ao menos um item");
    return prisma.$transaction(async (tx) => {
      const codigo = await gerarCodigo(tx, "VEN");
      const venda = await tx.venda.create({
        data: {
          codigo,
          atendimentoId: data.atendimentoId,
          clienteId: data.clienteId,
          ordemServicoId: data.ordemServicoId,
          registradoPorId: ctx.userId,
        },
      });
      let valorTotal = 0;
      for (const item of data.itens) {
        const total = Number(item.quantidade) * Number(item.valorUnitario);
        valorTotal += total;
        await tx.vendaItem.create({
          data: {
            vendaId: venda.id,
            materialId: item.materialId,
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            valorTotal: total,
          },
        });
      }
      const atualizada = await tx.venda.update({
        where: { id: venda.id },
        data: { valorTotal },
      });
      return atualizada;
    });
  },

  async registrarPagamento(
    id: number,
    data: { valor: number; formaPagamento: FormaPagamento; observacoes?: string },
    ctx: Ctx,
  ) {
    return prisma.$transaction(async (tx) => {
      const venda = await tx.venda.findUnique({ where: { id }, include: { itens: true } });
      if (!venda) throw new AppError(404, "Venda não encontrada");
      if (venda.status !== "PENDENTE") throw new AppError(409, "Venda não está pendente");
      const atualizada = await tx.venda.update({
        where: { id },
        data: { status: "PAGA", formaPagamento: data.formaPagamento },
      });
      await tx.lancamentoFinanceiro.create({
        data: {
          tipo: TipoLancamento.ENTRADA,
          descricao: `Venda ${venda.codigo}`,
          valor: data.valor,
          formaPagamento: data.formaPagamento,
          origem: OrigemLancamento.VENDA,
          origemId: venda.id,
          criadoPorId: ctx.userId,
        },
      });
      for (const item of venda.itens) {
        await aplicarMovimento(tx, {
          materialId: item.materialId,
          tipo: "SAIDA",
          quantidade: Number(item.quantidade),
          vendaId: venda.id,
          registradoPorId: ctx.userId,
          observacao: `Baixa venda ${venda.codigo}`,
        });
      }
      return atualizada;
    });
  },

  async cancelar(id: number) {
    const venda = await prisma.venda.findUnique({ where: { id } });
    if (!venda) throw new AppError(404, "Venda não encontrada");
    if (venda.status !== "PENDENTE") throw new AppError(409, "Apenas vendas pendentes podem ser canceladas");
    return prisma.venda.update({ where: { id }, data: { status: "CANCELADA" } });
  },
};
