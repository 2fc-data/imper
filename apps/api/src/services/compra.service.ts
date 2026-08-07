import { StatusCompra } from "@prisma/client";
import { prisma } from "../db";
import { AppError } from "../lib/errors";
import { Ctx } from "../lib/ctx";
import { aplicarMovimento } from "../lib/estoque";

export const compraService = {
  async listar(filtro: { status?: string; q?: string }) {
    return prisma.compra.findMany({
      where: {
        status: filtro.status ? (filtro.status as StatusCompra) : undefined,
        OR: filtro.q ? [{ codigo: { contains: filtro.q } }] : undefined,
      },
      include: {
        ordemServico: { select: { codigo: true } },
        criadoPor: { select: { id: true, nome: true } },
        itens: { include: { material: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async detalhar(id: number) {
    const compra = await prisma.compra.findUnique({
      where: { id },
      include: {
        ordemServico: { include: { cliente: true, atendimento: { select: { id: true } } } },
        criadoPor: { select: { id: true, nome: true } },
        aprovadoPor: { select: { id: true, nome: true } },
        itens: { include: { material: { include: { saldo: true } } } },
      },
    });
    if (!compra) throw new AppError(404, "Compra não encontrada");
    return compra;
  },

  async aprovar(id: number, ctx: Ctx) {
    const compra = await prisma.compra.findUnique({ where: { id } });
    if (!compra) throw new AppError(404, "Compra não encontrada");
    if (compra.status !== "PENDENTE") throw new AppError(409, "Compra precisa estar pendente");
    return prisma.compra.update({
      where: { id },
      data: { status: "APROVADA", aprovadoPorId: ctx.userId, aprovadoEm: new Date() },
    });
  },

  async recusar(id: number, observacoes: string | undefined, ctx: Ctx) {
    const compra = await prisma.compra.findUnique({ where: { id } });
    if (!compra) throw new AppError(404, "Compra não encontrada");
    if (compra.status !== "PENDENTE") throw new AppError(409, "Compra precisa estar pendente");
    return prisma.compra.update({
      where: { id },
      data: { status: "RECUSADA", observacoes, aprovadoPorId: ctx.userId, aprovadoEm: new Date() },
    });
  },

  async receber(id: number, ctx: Ctx) {
    return prisma.$transaction(async (tx) => {
      const compra = await tx.compra.findUnique({
        where: { id },
        include: { itens: true, ordemServico: { select: { id: true, status: true } } },
      });
      if (!compra) throw new AppError(404, "Compra não encontrada");
      if (compra.status === "RECEBIDA") throw new AppError(409, "Compra já recebida");
      if (compra.status !== "APROVADA") {
        throw new AppError(409, "Compra precisa estar APROVADA para receber");
      }
      for (const item of compra.itens) {
        if (item.status === "RECEBIDO") continue;
        await aplicarMovimento(tx, {
          materialId: item.materialId,
          tipo: "ENTRADA",
          quantidade: Number(item.quantidade),
          compraItemId: item.id,
          registradoPorId: ctx.userId,
          observacao: `Recebimento compra ${compra.codigo}`,
        });
        if (compra.ordemServicoId) {
          await aplicarMovimento(tx, {
            materialId: item.materialId,
            tipo: "SAIDA",
            quantidade: Number(item.quantidade),
            ordemServicoId: compra.ordemServicoId,
            registradoPorId: ctx.userId,
            observacao: `Reserva OS (após recebimento) ${compra.codigo}`,
          });
        }
        await tx.compraItem.update({
          where: { id: item.id },
          data: { quantidadeRecebida: item.quantidade, status: "RECEBIDO" },
        });
      }
      const atualizada = await tx.compra.update({
        where: { id },
        data: { status: "RECEBIDA", recebidoEm: new Date() },
      });
      if (compra.ordemServicoId) {
        const pendentes = await tx.compra.count({
          where: { ordemServicoId: compra.ordemServicoId, status: { in: ["PENDENTE", "APROVADA"] } },
        });
        if (pendentes === 0) {
          await tx.ordemServico.update({
            where: { id: compra.ordemServicoId },
            data: { status: "AGENDADO" },
          });
        }
      }
      return atualizada;
    });
  },
};
