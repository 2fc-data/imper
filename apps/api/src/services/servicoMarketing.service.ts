import { prisma } from "../db";
import { AppError } from "../lib/errors";

function normalizar(valor: string): string {
  const t = valor.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function normalizarDescricao(valor: string): string {
  const t = valor.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export const servicoMarketingService = {
  async listarAtivos() {
    return prisma.servicoMarketing.findMany({
      where: { ativo: true },
      select: { id: true, titulo: true, descricao: true, icone: true },
      orderBy: { ordem: "asc" },
    });
  },

  async listar(filtro: { q?: string }) {
    return prisma.servicoMarketing.findMany({
      where: filtro.q
        ? { titulo: { contains: filtro.q } }
        : undefined,
      orderBy: { ordem: "asc" },
    });
  },

  async criar(data: { titulo: string; descricao: string; icone: string; ativo?: boolean }) {
    const titulo = normalizar(data.titulo);
    const duplicado = await prisma.servicoMarketing.findUnique({ where: { titulo } });
    if (duplicado) throw new AppError(409, "Já existe um serviço com esse título");
    return prisma.servicoMarketing.create({
      data: {
        titulo,
        descricao: normalizarDescricao(data.descricao),
        icone: data.icone.trim(),
        ativo: data.ativo ?? true,
      },
    });
  },

  async atualizar(
    id: number,
    data: Partial<{ titulo: string; descricao: string; icone: string; ativo: boolean }>,
  ) {
    const servico = await prisma.servicoMarketing.findUnique({ where: { id } });
    if (!servico) throw new AppError(404, "Serviço não encontrado");

    const update: { titulo?: string; descricao?: string; icone?: string; ativo?: boolean } = {};
    if (data.titulo !== undefined) {
      const titulo = normalizar(data.titulo);
      const duplicado = await prisma.servicoMarketing.findFirst({
        where: { titulo, NOT: { id } },
      });
      if (duplicado) throw new AppError(409, "Já existe um serviço com esse título");
      update.titulo = titulo;
    }
    if (data.descricao !== undefined) update.descricao = normalizarDescricao(data.descricao);
    if (data.icone !== undefined) update.icone = data.icone.trim();
    if (data.ativo !== undefined) update.ativo = data.ativo;

    return prisma.servicoMarketing.update({ where: { id }, data: update });
  },

  async excluir(id: number) {
    const servico = await prisma.servicoMarketing.findUnique({ where: { id } });
    if (!servico) throw new AppError(404, "Serviço não encontrado");
    await prisma.servicoMarketing.delete({ where: { id } });
    return { ok: true };
  },
};
