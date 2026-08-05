import bcrypt from "bcryptjs";
import { Papel } from "@prisma/client";
import { prisma } from "../db";
import { AppError } from "../lib/errors";
import { Ctx } from "../lib/ctx";

const selectPublico = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  papel: true,
  ativo: true,
  createdAt: true,
  cargoId: true,
};

export const usuariosService = {
  async listar() {
    const users = await prisma.user.findMany({
      select: { ...selectPublico, cargo: { select: { id: true, nome: true } } },
      orderBy: { nome: "asc" },
    });
    return users;
  },

  async criar(_ctx: Ctx, data: {
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
    papel: Papel;
    cargoId?: number | null;
  }) {
    const existente = await prisma.user.findUnique({ where: { email: data.email } });
    if (existente) throw new AppError(409, "E-mail já cadastrado");
    const senhaHash = await bcrypt.hash(data.senha, 10);
    const user = await prisma.user.create({
      data: {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        papel: data.papel,
        cargoId: data.cargoId ?? null,
        senhaHash,
      },
      select: selectPublico,
    });
    return user;
  },

  async atualizar(id: number, data: {
    nome?: string;
    telefone?: string;
    papel?: Papel;
    cargoId?: number | null;
    ativo?: boolean;
  }) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError(404, "Usuário não encontrado");
    return prisma.user.update({ where: { id }, data, select: selectPublico });
  },

  async resetarSenha(id: number, novaSenha: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError(404, "Usuário não encontrado");
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await prisma.user.update({ where: { id }, data: { senhaHash } });
    return { ok: true };
  },
};
