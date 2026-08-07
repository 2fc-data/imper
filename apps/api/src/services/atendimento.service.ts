import { CanalAtendimento, EnderecoRotulo, MotivoAtendimento, StatusAtendimento, TipoAtendimento, Urgencia } from "@prisma/client";
import { prisma } from "../db";
import { AppError } from "../lib/errors";

interface DadosEndereco {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export const atendimentoService = {
  async criarPublico(data: {
    nome: string;
    telefone?: string;
    email?: string;
    motivo: MotivoAtendimento;
    descricao?: string;
    endereco: DadosEndereco;
  }) {
    const buscaCliente: Array<Record<string, string>> = [];
    if (data.telefone) buscaCliente.push({ telefone: data.telefone });
    if (data.email) buscaCliente.push({ email: data.email });

    let cliente = buscaCliente.length
      ? await prisma.cliente.findFirst({ where: { OR: buscaCliente } })
      : null;

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          nome: data.nome,
          telefone: data.telefone,
          email: data.email,
        },
      });
    }

    if (data.endereco?.logradouro) {
      await prisma.endereco.create({
        data: {
          clienteId: cliente.id,
          rotulo: EnderecoRotulo.OBRA,
          principal: true,
          logradouro: data.endereco.logradouro,
          numero: data.endereco.numero,
          complemento: data.endereco.complemento,
          bairro: data.endereco.bairro,
          cidade: data.endereco.cidade,
          estado: data.endereco.estado,
          cep: data.endereco.cep,
        },
      });
    }

    return prisma.atendimento.create({
      data: {
        clienteId: cliente.id,
        canal: CanalAtendimento.FORMULARIO,
        motivo: data.motivo,
        status: StatusAtendimento.NOVO,
        descricao: data.descricao,
      },
      include: {
        cliente: { include: { enderecos: true } },
      },
    });
  },

  async listarPublico(id: number) {
    const atend = await prisma.atendimento.findUnique({
      where: { id },
      include: {
        cliente: {
          include: { enderecos: true },
        },
      },
    });
    if (!atend) throw new AppError(404, "Atendimento não encontrado");
    return atend;
  },

  async listar(filtro: {
    status?: string;
    q?: string;
    criadoDe?: string;
    criadoAte?: string;
    atualizadoDe?: string;
    atualizadoAte?: string;
  }) {
    const iniciarDia = (v?: string) => (v ? new Date(`${v}T00:00:00`) : undefined);
    const finalizarDia = (v?: string) => (v ? new Date(`${v}T23:59:59.999`) : undefined);
    return prisma.atendimento.findMany({
      where: {
        status: filtro.status ? (filtro.status as StatusAtendimento) : undefined,
        createdAt: {
          gte: iniciarDia(filtro.criadoDe),
          lte: finalizarDia(filtro.criadoAte),
        },
        updatedAt: {
          gte: iniciarDia(filtro.atualizadoDe),
          lte: finalizarDia(filtro.atualizadoAte),
        },
        OR: filtro.q
          ? [
              { cliente: { nome: { contains: filtro.q } } },
              { descricao: { contains: filtro.q } },
            ]
          : undefined,
      },
      include: {
        cliente: { select: { id: true, nome: true, telefone: true } },
        atendente: { select: { id: true, nome: true } },
        _count: { select: { visitas: true, os: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async criar(data: {
    clienteId: number | null;
    nome?: string;
    telefone?: string;
    email?: string;
    atendenteId: number;
    canal: CanalAtendimento;
    motivo: MotivoAtendimento;
    urgencia?: Urgencia;
    descricao?: string;
    enderecoNovo?: DadosEndereco;
  }) {
    let clienteId = data.clienteId;
    if (clienteId) {
      const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
      if (!cliente) throw new AppError(404, "Cliente não encontrado");
    } else {
      const novoCliente = await prisma.cliente.create({
        data: {
          nome: data.nome ?? "Cliente do atendimento",
          telefone: data.telefone,
          email: data.email,
        },
      });
      clienteId = novoCliente.id;
    }

    if (clienteId && data.enderecoNovo?.logradouro) {
      await prisma.endereco.create({
        data: {
          clienteId,
          rotulo: EnderecoRotulo.OBRA,
          principal: false,
          logradouro: data.enderecoNovo.logradouro,
          numero: data.enderecoNovo.numero,
          complemento: data.enderecoNovo.complemento,
          bairro: data.enderecoNovo.bairro,
          cidade: data.enderecoNovo.cidade,
          estado: data.enderecoNovo.estado,
          cep: data.enderecoNovo.cep,
        },
      });
    }

    return prisma.atendimento.create({
      data: {
        clienteId,
        atendenteId: data.atendenteId,
        canal: data.canal,
        motivo: data.motivo,
        urgencia: data.urgencia ?? Urgencia.NORMAL,
        status: StatusAtendimento.NOVO,
        descricao: data.descricao,
      },
      include: {
        cliente: {
          include: { enderecos: true },
        },
      },
    });
  },

  async detalhar(id: number) {
    const atendimento = await prisma.atendimento.findUnique({
      where: { id },
      include: {
        cliente: {
          include: { enderecos: true },
        },
        atendente: { select: { id: true, nome: true } },
        visitas: {
          include: { tecnico: { select: { id: true, nome: true } }, endereco: true },
          orderBy: { dataPrevista: "asc" },
        },
        os: { include: { orcamento: true }, orderBy: { createdAt: "desc" } },
        logs: {
          include: { atendente: { select: { id: true, nome: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!atendimento) throw new AppError(404, "Atendimento não encontrado");
    return atendimento;
  },

  async atualizarStatus(id: number, status: StatusAtendimento, atendenteId: number) {
    const atendimento = await prisma.atendimento.findUnique({ where: { id } });
    if (!atendimento) throw new AppError(404, "Atendimento não encontrado");
    const statusDe = atendimento.status;
    return prisma.$transaction([
      prisma.atendimento.update({ where: { id }, data: { status } }),
      prisma.atendimentoLog.create({
        data: {
          atendimentoId: id,
          atendenteId,
          tipo: TipoAtendimento.STATUS,
          statusDe,
          statusPara: status,
        },
      }),
    ]);
  },

  async registrarAtendimento(id: number, descricao: string, atendenteId: number) {
    await prisma.atendimento.findUniqueOrThrow({ where: { id } });
    return prisma.atendimentoLog.create({
      data: {
        atendimentoId: id,
        atendenteId,
        tipo: TipoAtendimento.TEXTO,
        descricao,
      },
    });
  },

  async listarLogs(id: number) {
    await prisma.atendimento.findUniqueOrThrow({ where: { id } });
    return prisma.atendimentoLog.findMany({
      where: { atendimentoId: id },
      include: { atendente: { select: { id: true, nome: true } } },
      orderBy: { createdAt: "desc" },
    });
  },
};