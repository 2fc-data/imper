import { StatusManutencao } from "@prisma/client";
import { prisma } from "../db";
import { AppError } from "../lib/errors";
import { Ctx } from "../lib/ctx";

export const manutencaoService = {
  async listar(filtro: { equipamentoId?: number; status?: StatusManutencao }) {
    return prisma.manutencao.findMany({
      where: {
        equipamentoId: filtro.equipamentoId,
        status: filtro.status,
      },
      include: {
        equipamento: { select: { id: true, codigo: true, descricao: true, numeroPatrimonio: true } },
        tipo: true,
        responsavelManutencao: { select: { id: true, nome: true } },
      },
      orderBy: [{ data: "desc" }, { createdAt: "desc" }],
    });
  },

  async detalhar(id: number) {
    const manutencao = await prisma.manutencao.findUnique({
      where: { id },
      include: {
        equipamento: {
          include: {
            marca: true,
            categoria: true,
            subcategoria: true,
            localizacao: true,
            status: true,
            estadoConservacao: true,
            responsavel: { select: { id: true, nome: true } },
          },
        },
        tipo: true,
        responsavelManutencao: { select: { id: true, nome: true } },
      },
    });
    if (!manutencao) throw new AppError(404, "Manutenção não encontrada");
    return manutencao;
  },

  async criar(data: {
    equipamentoId: number;
    tipoId: number;
    data: Date | string;
    descricao: string;
    custo?: number;
    responsavelManutencaoId?: number;
    proximaManutencao?: Date | string;
  }, ctx: Ctx) {
    const equipamento = await prisma.equipamento.findUnique({ where: { id: data.equipamentoId } });
    if (!equipamento) throw new AppError(404, "Equipamento não encontrado");
    const tipo = await prisma.tipoManutencao.findUnique({ where: { id: data.tipoId } });
    if (!tipo) throw new AppError(404, "Tipo de manutenção não encontrado");
    return prisma.manutencao.create({
      data: {
        equipamentoId: data.equipamentoId,
        tipoId: data.tipoId,
        data: data.data,
        descricao: data.descricao,
        custo: data.custo,
        responsavelManutencaoId: data.responsavelManutencaoId ?? ctx.userId,
        proximaManutencao: data.proximaManutencao,
      },
      include: {
        equipamento: { select: { id: true, codigo: true, descricao: true } },
        tipo: true,
        responsavelManutencao: { select: { id: true, nome: true } },
      },
    });
  },

  async atualizar(id: number, data: Partial<{
    tipoId: number;
    data: Date | string;
    descricao: string;
    custo: number;
    status: StatusManutencao;
    responsavelManutencaoId: number;
    proximaManutencao: Date | string | null;
  }>) {
    const manutencao = await prisma.manutencao.findUnique({ where: { id } });
    if (!manutencao) throw new AppError(404, "Manutenção não encontrada");
    return prisma.manutencao.update({
      where: { id },
      data,
      include: {
        equipamento: { select: { id: true, codigo: true, descricao: true } },
        tipo: true,
        responsavelManutencao: { select: { id: true, nome: true } },
      },
    });
  },

  async excluir(id: number) {
    const manutencao = await prisma.manutencao.findUnique({ where: { id } });
    if (!manutencao) throw new AppError(404, "Manutenção não encontrada");
    return prisma.manutencao.delete({ where: { id } });
  },
};