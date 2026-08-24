import { prisma } from "../db";

export const clienteService = {
  async buscar(q: string) {
    return prisma.cliente.findMany({
      where: { nome: { contains: q } },
      select: {
        id: true,
        nome: true,
        cpfCnpj: true,
        telefone: true,
        email: true,
        enderecos: true,
      },
      orderBy: { nome: "asc" },
      take: 20,
    });
  },

  async me(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        cliente: {
          select: {
            id: true,
            nome: true,
            cpfCnpj: true,
            telefone: true,
            email: true,
            enderecos: { select: { id: true, logradouro: true, numero: true, bairro: true, cidade: true, estado: true, rotulo: true, principal: true } },
          },
        },
      },
    });
    if (!user) return null;
    return {
      ...user,
      cliente: user.cliente ?? null,
    };
  },

  async listarOs(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { clienteId: true },
    });
    if (!user?.clienteId) return [];
    return prisma.ordemServico.findMany({
      where: { clienteId: user.clienteId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        codigo: true,
        status: true,
        urgencia: true,
        valorTotal: true,
        endereco: true,
        dataInicioPrevista: true,
        confirmadoPorCliente: true,
        confirmadoEm: true,
        createdAt: true,
        orcamento: { select: { codigo: true, valorTotal: true, status: true } },
      },
    });
  },
};
