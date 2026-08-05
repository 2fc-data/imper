import { prisma } from "../db";

export const servicoMarketingService = {
  async listarAtivos() {
    return prisma.servicoMarketing.findMany({
      where: { ativo: true },
      select: { id: true, titulo: true, descricao: true, icone: true },
      orderBy: { ordem: "asc" },
    });
  },
};
