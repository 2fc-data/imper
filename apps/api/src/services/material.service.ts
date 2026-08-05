import { TipoMaterial, UnidadeMedida } from "@prisma/client";
import { prisma } from "../db";
import { AppError } from "../lib/errors";
import { Ctx } from "../lib/ctx";
import { aplicarMovimento } from "../lib/estoque";

export const materialService = {
  async listar(filtro: { q?: string; tipo?: string }) {
    return prisma.material.findMany({
      where: {
        status: "ATIVO",
        tipo: filtro.tipo ? (filtro.tipo as TipoMaterial) : undefined,
        OR: filtro.q ? [{ nome: { contains: filtro.q } }] : undefined,
      },
      include: { saldo: true },
      orderBy: { nome: "asc" },
    });
  },

  async detalhar(id: number) {
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        saldo: true,
        itensServico: { where: { ativo: true } },
        movimentos: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });
    if (!material) throw new AppError(404, "Material não encontrado");
    return material;
  },

  async criar(data: {
    nome: string;
    tipo: TipoMaterial;
    unidade: UnidadeMedida;
    quantidadeMinima?: number;
    custoUnitario?: number;
  }) {
    return prisma.material.create({
      data: {
        nome: data.nome,
        tipo: data.tipo,
        unidade: data.unidade,
        quantidadeMinima: data.quantidadeMinima,
        custoUnitario: data.custoUnitario,
      },
    });
  },

  async atualizar(id: number, data: Partial<{
    nome: string;
    tipo: TipoMaterial;
    unidade: UnidadeMedida;
    quantidadeMinima: number;
    custoUnitario: number;
    status: "ATIVO" | "INATIVO";
  }>) {
    const material = await prisma.material.findUnique({ where: { id } });
    if (!material) throw new AppError(404, "Material não encontrado");
    return prisma.material.update({ where: { id }, data });
  },

  async entrada(data: { materialId: number; quantidade: number; observacao?: string }, ctx: Ctx) {
    const material = await prisma.material.findUnique({ where: { id: data.materialId } });
    if (!material) throw new AppError(404, "Material não encontrado");
    return prisma.$transaction((tx) =>
      aplicarMovimento(tx, {
        materialId: data.materialId,
        tipo: "ENTRADA",
        quantidade: data.quantidade,
        registradoPorId: ctx.userId,
        observacao: data.observacao,
      }),
    );
  },

  async saida(data: { materialId: number; quantidade: number; observacao?: string }, ctx: Ctx) {
    const material = await prisma.material.findUnique({ where: { id: data.materialId } });
    if (!material) throw new AppError(404, "Material não encontrado");
    return prisma.$transaction((tx) =>
      aplicarMovimento(tx, {
        materialId: data.materialId,
        tipo: "SAIDA",
        quantidade: data.quantidade,
        registradoPorId: ctx.userId,
        observacao: data.observacao,
      }),
    );
  },
};
