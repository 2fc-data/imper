import { prisma } from "../db";
import { AppError } from "../lib/errors";

export const configService = {
  async listar() {
    return prisma.configuracao.findMany({ orderBy: { chave: "asc" } });
  },

  async salvar(dados: { chave: string; valor: string }[]) {
    const registros = [];
    for (const d of dados) {
      const reg = await prisma.configuracao.upsert({
        where: { chave: d.chave },
        update: { valor: d.valor },
        create: { chave: d.chave, valor: d.valor },
      });
      registros.push(reg);
    }
    return registros;
  },

  async atualizar(chave: string, valor: string) {
    const existente = await prisma.configuracao.findUnique({ where: { chave } });
    if (!existente) throw new AppError(404, "Configuração não encontrada");
    return prisma.configuracao.update({ where: { chave }, data: { valor } });
  },
};
