import { CanalContato, StatusContato, TipoContato, Urgencia } from "@prisma/client";
import { prisma } from "../db";
import { AppError } from "../lib/errors";

export const contatoService = {
  async criarPublico(data: {
    nome: string;
    telefone: string;
    email?: string;
    descricao: string;
    cep?: string;
    endereco?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    numero?: string;
    complemento?: string;
  }) {
    const cliente = data.email || data.telefone
      ? await prisma.cliente.findFirst({
          where: {
            OR: [
              ...(data.email ? [{ email: data.email }] : []),
              ...(data.telefone ? [{ telefone: data.telefone }] : []),
            ],
          },
          select: { id: true },
        })
      : null;

    return prisma.contato.create({
      data: {
        clienteId: cliente?.id ?? null,
        nome: data.nome,
        telefone: data.telefone,
        email: data.email,
        canal: CanalContato.FORMULARIO,
        tipo: TipoContato.DUVIDA,
        status: StatusContato.NOVO,
        descricao: data.descricao,
        endereco: data.endereco,
        cep: data.cep,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        numero: data.numero,
        complemento: data.complemento,
      },
    });
  },

  async listar(filtro: { status?: string; q?: string }) {
    return prisma.contato.findMany({
      where: {
        status: filtro.status ? (filtro.status as StatusContato) : undefined,
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
    nome: string;
    telefone: string;
    canal: CanalContato;
    tipo: TipoContato;
    urgencia?: Urgencia;
    assunto: string;
    descricao?: string;
    endereco?: string;
  }, atendenteId: number) {
    return prisma.contato.create({
      data: {
        clienteId: data.clienteId,
        nome: data.nome,
        telefone: data.telefone,
        canal: data.canal,
        tipo: data.tipo,
        urgencia: data.urgencia ?? "NORMAL",
        descricao: data.descricao ?? data.assunto,
        endereco: data.endereco,
        atendenteId,
      },
      include: { cliente: { select: { id: true, nome: true } } },
    });
  },

  async detalhar(id: number) {
    const contato = await prisma.contato.findUnique({
      where: { id },
      include: {
        cliente: true,
        atendente: { select: { id: true, nome: true } },
        visitas: { include: { tecnico: { select: { id: true, nome: true } } }, orderBy: { dataPrevista: "asc" } },
        os: { include: { orcamento: true }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!contato) throw new AppError(404, "Contato não encontrado");
    return contato;
  },

  async atualizarStatus(id: number, status: StatusContato) {
    const contato = await prisma.contato.findUnique({ where: { id } });
    if (!contato) throw new AppError(404, "Contato não encontrado");
    return prisma.contato.update({ where: { id }, data: { status } });
  },
};
