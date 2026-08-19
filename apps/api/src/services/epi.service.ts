import { prisma } from "../db";
import { AppError } from "../lib/errors";
import { Ctx } from "../lib/ctx";

export const epiService = {
  async listar(filtro: { q?: string; ativo?: boolean }) {
    return prisma.epi.findMany({
      where: {
        ativo: filtro.ativo,
        OR: filtro.q
          ? [
              { codigo: { contains: filtro.q } },
              { nome: { contains: filtro.q } },
              { categoria: { contains: filtro.q } },
              { numeroCa: { contains: filtro.q } },
            ]
          : undefined,
      },
      orderBy: [{ ativo: "desc" }, { nome: "asc" }],
    });
  },

  async detalhar(id: number) {
    const epi = await prisma.epi.findUnique({
      where: { id },
      include: {
        entregas: {
          include: { colaborador: { select: { id: true, nome: true } }, registradoPor: { select: { id: true, nome: true } } },
          orderBy: { data: "desc" },
          take: 50,
        },
      },
    });
    if (!epi) throw new AppError(404, "EPI não encontrado");
    return epi;
  },

  async criar(data: {
    codigo: string;
    nome: string;
    categoria: string;
    numeroCa?: string;
    dataValidade?: Date | string;
    quantidade?: number;
    quantidadeMinima?: number;
  }) {
    const codigoNorm = data.codigo.trim().toUpperCase();
    if (await prisma.epi.findUnique({ where: { codigo: codigoNorm } }))
      throw new AppError(400, "Código já cadastrado");
    return prisma.epi.create({ data: { ...data, codigo: codigoNorm } });
  },

  async atualizar(id: number, data: Partial<{
    codigo: string;
    nome: string;
    categoria: string;
    numeroCa: string;
    dataValidade: Date | string | null;
    quantidade: number;
    quantidadeMinima: number | null;
    ativo: boolean;
  }>) {
    const existente = await prisma.epi.findUnique({ where: { id } });
    if (!existente) throw new AppError(404, "EPI não encontrado");
    if (data.codigo) {
      const codigoNorm = data.codigo.trim().toUpperCase();
      const dup = await prisma.epi.findUnique({ where: { codigo: codigoNorm } });
      if (dup && dup.id !== id) throw new AppError(400, "Código já cadastrado");
      data.codigo = codigoNorm;
    }
    return prisma.epi.update({ where: { id }, data });
  },

  async desativar(id: number) {
    const existente = await prisma.epi.findUnique({ where: { id } });
    if (!existente) throw new AppError(404, "EPI não encontrado");
    return prisma.epi.update({ where: { id }, data: { ativo: false } });
  },

  async reativar(id: number) {
    const existente = await prisma.epi.findUnique({ where: { id } });
    if (!existente) throw new AppError(404, "EPI não encontrado");
    return prisma.epi.update({ where: { id }, data: { ativo: true } });
  },

  async entrega(data: { epiId: number; colaboradorId: number; quantidade: number; observacao?: string }, ctx: Ctx) {
    const epi = await prisma.epi.findUnique({ where: { id: data.epiId } });
    if (!epi) throw new AppError(404, "EPI não encontrado");
    if (!epi.ativo) throw new AppError(400, "EPI inativo");
    const colaborador = await prisma.user.findUnique({ where: { id: data.colaboradorId } });
    if (!colaborador) throw new AppError(404, "Colaborador não encontrado");
    if (Number(epi.quantidade) < data.quantidade)
      throw new AppError(400, "Estoque insuficiente de EPI");
    return prisma.$transaction(async (tx) => {
      const entrega = await tx.entregaEpi.create({
        data: {
          epiId: data.epiId,
          colaboradorId: data.colaboradorId,
          quantidade: data.quantidade,
          observacao: data.observacao,
          registradoPorId: ctx.userId,
        },
        include: { colaborador: { select: { id: true, nome: true } } },
      });
      await tx.epi.update({
        where: { id: data.epiId },
        data: { quantidade: { decrement: data.quantidade } },
      });
      return entrega;
    });
  },
};