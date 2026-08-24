import { prisma } from "../db";
import { AppError } from "../lib/errors";

function normalize(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export const rbacService = {
  async listarPapeis() {
    const papeis = await prisma.papelRbac.findMany({
      include: {
        permissoes: {
          include: { permissao: true },
        },
      },
    });
    return papeis.map((p) => ({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      permissoes: p.permissoes.map((pp) => ({
        id: pp.permissao.id,
        chave: pp.permissao.chave,
        descricao: pp.permissao.descricao,
        categoria: pp.permissao.categoria,
      })),
    }));
  },

  async criarPapel(data: { nome: string; descricao?: string }) {
    const exists = await prisma.papelRbac.findFirst({
      where: { nome: normalize(data.nome) },
    });
    if (exists) throw new AppError(409, "Papel já existe");
    return prisma.papelRbac.create({
      data: { nome: normalize(data.nome), descricao: data.descricao },
    });
  },

  async atualizarPapel(
    id: number,
    data: { nome?: string; descricao?: string }
  ) {
    if (data.nome) {
      const exists = await prisma.papelRbac.findFirst({
        where: { nome: normalize(data.nome), NOT: { id } },
      });
      if (exists) throw new AppError(409, "Papel já existe");
    }
    return prisma.papelRbac.update({
      where: { id },
      data: {
        nome: data.nome ? normalize(data.nome) : undefined,
        descricao: data.descricao,
      },
    });
  },

  async excluirPapel(id: number) {
    const hasUsers = await prisma.usuarioPapel.findFirst({
      where: { papelId: id },
    });
    if (hasUsers) {
      throw new AppError(409, "Papel vinculado a usuários — remova-os antes");
    }
    await prisma.papelPermissao.deleteMany({ where: { papelId: id } });
    return prisma.papelRbac.delete({ where: { id } });
  },

  async listarPermissoes() {
    return prisma.permissao.findMany({ orderBy: { categoria: "asc" } });
  },

  async listarPermissoesPorPapel(papelId: number) {
    const papel = await prisma.papelRbac.findUnique({
      where: { id: papelId },
      include: { permissoes: { select: { permissaoId: true } } },
    });
    if (!papel) throw new AppError(404, "Papel não encontrado");
    return papel.permissoes.map((pp) => pp.permissaoId);
  },

  async definirPermissoes(papelId: number, permissoesIds: number[]) {
    const papel = await prisma.papelRbac.findUnique({ where: { id: papelId } });
    if (!papel) throw new AppError(404, "Papel não encontrado");

    await prisma.papelPermissao.deleteMany({ where: { papelId } });
    if (permissoesIds.length === 0) return { ok: true } as const;

    await prisma.papelPermissao.createMany({
      data: permissoesIds.map((permissaoId) => ({ papelId, permissaoId })),
    });
    return { ok: true } as const;
  },
};
