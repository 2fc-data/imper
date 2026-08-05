import { StatusNotificacao } from "@prisma/client";
import { prisma } from "../db";
import { AppError } from "../lib/errors";

export const notificacaoService = {
  async listar(userId: number, filtro: { lida?: string }) {
    return prisma.notificacao.findMany({
      where: {
        userId,
        status: filtro.lida === "true"
          ? StatusNotificacao.LIDA
          : filtro.lida === "false"
            ? StatusNotificacao.NAO_LIDA
            : undefined,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  },

  async naoLidas(userId: number) {
    return prisma.notificacao.count({ where: { userId, status: StatusNotificacao.NAO_LIDA } });
  },

  async marcarLida(id: number, userId: number) {
    const notif = await prisma.notificacao.findFirst({ where: { id, userId } });
    if (!notif) throw new AppError(404, "Notificação não encontrada");
    return prisma.notificacao.update({ where: { id }, data: { status: StatusNotificacao.LIDA } });
  },

  async marcarTodasLidas(userId: number) {
    return prisma.notificacao.updateMany({
      where: { userId, status: StatusNotificacao.NAO_LIDA },
      data: { status: StatusNotificacao.LIDA },
    });
  },
};
