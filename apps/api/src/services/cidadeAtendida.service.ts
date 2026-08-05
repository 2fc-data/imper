import { prisma } from "../db";

export const cidadeAtendidaService = {
  async listarAtivas() {
    return prisma.cidadeAtendida.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        uf: true,
        lat: true,
        lng: true,
      },
      orderBy: { ordem: "asc" },
    });
  },
};
