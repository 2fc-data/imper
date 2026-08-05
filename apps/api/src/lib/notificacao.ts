import { Papel } from "@prisma/client";
import { prisma } from "../db";

interface NotificacaoInput {
  titulo: string;
  mensagem: string;
  link?: string;
  ordemServicoId?: number | null;
}

export async function notificarUsuarios(userIds: number[], input: NotificacaoInput): Promise<void> {
  const ids = [...new Set(userIds)];
  if (!ids.length) return;
  await prisma.notificacao.createMany({
    data: ids.map((userId) => ({
      userId,
      titulo: input.titulo,
      mensagem: input.mensagem,
      link: input.link ?? null,
      ordemServicoId: input.ordemServicoId ?? null,
    })),
  });
}

export async function notificarPapeis(papeis: Papel[], input: NotificacaoInput): Promise<void> {
  const users = await prisma.user.findMany({
    where: { papel: { in: papeis }, ativo: true },
    select: { id: true },
  });
  await notificarUsuarios(users.map((u) => u.id), input);
}
