import bcrypt from "bcryptjs";
import { prisma } from "../db";
import { AppError } from "../lib/errors";
import { Ctx } from "../lib/ctx";

const selectPublico = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  ativo: true,
  createdAt: true,
  cargoId: true,
  papeis: {
    select: {
      papel: { select: { id: true, nome: true, descricao: true } },
    },
  },
};

export const usuariosService = {
  async listar() {
    const users = await prisma.user.findMany({
      select: { ...selectPublico, cargo: { select: { id: true, nome: true } } },
      orderBy: { nome: "asc" },
    });
    return users.map((u) => ({
      ...u,
      papeis: u.papeis.map((up) => up.papel),
    }));
  },

  async criar(_ctx: Ctx, data: {
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
    papelId: number;
    cargoId?: number | null;
  }) {
    const existente = await prisma.user.findUnique({ where: { email: data.email } });
    if (existente) throw new AppError(409, "E-mail já cadastrado");

    const papel = await prisma.papelRbac.findUnique({ where: { id: data.papelId } });
    if (!papel) throw new AppError(400, "Papel inválido");

    const senhaHash = await bcrypt.hash(data.senha, 10);
    const user = await prisma.$transaction(async (tx) => {
      const novoUser = await tx.user.create({
        data: {
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          cargoId: data.cargoId ?? null,
          senhaHash,
        },
        select: selectPublico,
      });
      await tx.usuarioPapel.create({
        data: { userId: novoUser.id, papelId: data.papelId },
      });
      return novoUser;
    });
    return { ...user, papeis: [papel] };
  },

  async atualizar(id: number, data: {
    nome?: string;
    telefone?: string;
    papelId?: number;
    cargoId?: number | null;
    ativo?: boolean;
  }) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError(404, "Usuário não encontrado");

    const updateData: Record<string, any> = { ...data };
    if (data.papelId !== undefined) {
      const papel = await prisma.papelRbac.findUnique({ where: { id: data.papelId } });
      if (!papel) throw new AppError(400, "Papel inválido");
      delete updateData.papelId;
      // Atualizar vinculação
      await prisma.usuarioPapel.deleteMany({ where: { userId: id } });
      await prisma.usuarioPapel.create({ data: { userId: id, papelId: data.papelId } });
    }

    const updated = await prisma.user.update({ where: { id }, data: updateData, select: selectPublico });
    const papeis = await prisma.usuarioPapel.findMany({
      where: { userId: id },
      select: { papel: { select: { id: true, nome: true, descricao: true } } },
    });
    return { ...updated, papeis: papeis.map((up) => up.papel) };
  },

  async resetarSenha(id: number, novaSenha: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError(404, "Usuário não encontrado");
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await prisma.user.update({ where: { id }, data: { senhaHash } });
    return { ok: true };
  },
};
