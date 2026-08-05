import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Papel } from "@prisma/client";
import { prisma } from "../db";
import { signToken } from "../lib/auth";
import { AppError } from "../lib/errors";
import { config } from "../config";

const selectPerfil = {
  id: true,
  nome: true,
  email: true,
  papel: true,
  telefone: true,
  cargoId: true,
} as const;

export async function login(email: string, senha: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.ativo) throw new AppError(401, "Credenciais inválidas");
  const ok = await bcrypt.compare(senha, user.senhaHash);
  if (!ok) throw new AppError(401, "Credenciais inválidas");
  const perfil = {
    id: user.id,
    nome: user.nome,
    email: user.email,
    papel: user.papel as Papel,
    telefone: user.telefone,
    cargoId: user.cargoId,
  };
  const token = signToken(perfil);
  return { token, user: perfil };
}

export async function cadastrar(data: {
  nome: string;
  email: string;
  telefone?: string;
  senha: string;
}) {
  const existente = await prisma.user.findUnique({ where: { email: data.email } });
  if (existente) throw new AppError(409, "E-mail já cadastrado");
  const senhaHash = await bcrypt.hash(data.senha, 10);

  const user = await prisma.$transaction(async (tx) => {
    let cliente = data.email
      ? await tx.cliente.findFirst({ where: { email: data.email } })
      : null;
    if (!cliente) {
      cliente = await tx.cliente.create({
        data: {
          nome: data.nome,
          email: data.email,
          telefone: data.telefone ?? null,
        },
      });
    }
    return tx.user.create({
      data: {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone ?? null,
        papel: Papel.CLIENTE,
        ativo: true,
        senhaHash,
        clienteId: cliente.id,
      },
      select: selectPerfil,
    });
  });

  const notificaveis = await prisma.user.findMany({
    where: {
      ativo: true,
      papel: { in: [Papel.ATENDENTE, Papel.SUPERVISOR, Papel.ADMIN] },
    },
    select: { id: true },
  });
  if (notificaveis.length) {
    await prisma.notificacao.createMany({
      data: notificaveis.map((u) => ({
        userId: u.id,
        titulo: "Novo cadastro de cliente",
        mensagem: `${user.nome} (${user.email}) se cadastrou no sistema e está aguardando a definição de perfil.`,
        link: "/usuarios",
      })),
    });
  }

  const token = signToken(user);
  return { token, user };
}

export async function recuperarSenha(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.ativo) return { ok: true };

  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usadoEm: null },
    data: { usadoEm: new Date() },
  });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiraEm: new Date(Date.now() + config.resetTokenExpiresMin * 60_000),
    },
  });

  const resetUrl = `${config.publicBaseUrl}/redefinir-senha?token=${token}`;
  console.log(`[recuperar-senha] Link de redefinição: ${resetUrl}`);

  if (config.isDev) return { ok: true, devToken: token };
  return { ok: true };
}

export async function redefinirSenha(token: string, novaSenha: string) {
  const registro = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!registro || registro.usadoEm) throw new AppError(400, "Link inválido ou já utilizado");
  if (registro.expiraEm < new Date()) throw new AppError(400, "Link expirado");

  const senhaHash = await bcrypt.hash(novaSenha, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: registro.userId }, data: { senhaHash } }),
    prisma.passwordResetToken.update({ where: { id: registro.id }, data: { usadoEm: new Date() } }),
  ]);
  return { ok: true };
}

export async function alterarSenha(
  userId: number,
  senhaAtual: string,
  novaSenha: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "Usuário não encontrado");
  const ok = await bcrypt.compare(senhaAtual, user.senhaHash);
  if (!ok) throw new AppError(401, "Senha atual incorreta");
  const senhaHash = await bcrypt.hash(novaSenha, 10);
  await prisma.user.update({ where: { id: userId }, data: { senhaHash } });
  return { ok: true };
}
