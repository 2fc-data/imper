import { StatusAgendamento, TipoAgendamento } from "@prisma/client";
import { prisma } from "../db";
import { AppError } from "../lib/errors";
import { notificarUsuarios } from "../lib/notificacao";

export const agendamentoService = {
  async listar(filtro: {
    status?: string;
    tipo?: string;
    clienteId?: number;
    userId?: number;
    dataDe?: string;
    dataAte?: string;
  }) {
    return prisma.agendamento.findMany({
      where: {
        status: filtro.status ? (filtro.status as StatusAgendamento) : undefined,
        tipo: filtro.tipo ? (filtro.tipo as TipoAgendamento) : undefined,
        clienteId: filtro.clienteId ?? undefined,
        userId: filtro.userId ?? undefined,
        dataPrevista: {
          gte: filtro.dataDe ? new Date(`${filtro.dataDe}T00:00:00`) : undefined,
          lte: filtro.dataAte ? new Date(`${filtro.dataAte}T23:59:59.999`) : undefined,
        },
      },
      include: {
        cliente: { select: { id: true, nome: true, telefone: true } },
        user: { select: { id: true, nome: true } },
        endereco: true,
        atendimento: { select: { id: true, descricao: true } },
      },
      orderBy: { dataPrevista: "asc" },
    });
  },

  async criar(data: {
    clienteId: number;
    atendimentoId?: number | null;
    enderecoId?: number | null;
    userId?: number | null;
    tipo?: TipoAgendamento;
    status?: StatusAgendamento;
    dataPrevista: Date;
    dataRealizada?: Date | null;
    observacoes?: string | null;
  }, criadoPorId: number) {
    const cliente = await prisma.cliente.findUnique({ where: { id: data.clienteId } });
    if (!cliente) throw new AppError(404, "Cliente não encontrado");

    const agendamento = await prisma.agendamento.create({
      data: {
        clienteId: data.clienteId,
        atendimentoId: data.atendimentoId ?? null,
        enderecoId: data.enderecoId ?? null,
        userId: data.userId ?? null,
        tipo: data.tipo ?? TipoAgendamento.VISITA,
        status: data.status ?? StatusAgendamento.PENDENTE,
        dataPrevista: data.dataPrevista,
        dataRealizada: data.dataRealizada ?? null,
        observacoes: data.observacoes ?? null,
        criadoPorId,
      },
      include: {
        cliente: { select: { id: true, nome: true, telefone: true } },
        user: { select: { id: true, nome: true } },
      },
    });

    if (data.userId) {
      await notificarUsuarios([data.userId], {
        titulo: `Agendamento ${agendamento.tipo.toLowerCase()} marcado`,
        mensagem: `Compromisso para ${agendamento.dataPrevista.toLocaleString("pt-BR")} com ${cliente.nome}.`,
        link: `/agendamentos/${agendamento.id}`,
      });
    }
    return agendamento;
  },

  async detalhar(id: number) {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id },
      include: {
        cliente: { include: { enderecos: true } },
        user: { select: { id: true, nome: true } },
        endereco: true,
        atendimento: { include: { visitas: true } },
        criadoPor: { select: { id: true, nome: true } },
      },
    });
    if (!agendamento) throw new AppError(404, "Agendamento não encontrado");
    return agendamento;
  },

  async atualizar(id: number, data: {
    atendimentoId?: number | null;
    enderecoId?: number | null;
    userId?: number | null;
    tipo?: TipoAgendamento;
    status?: StatusAgendamento;
    dataPrevista?: Date;
    dataRealizada?: Date | null;
    observacoes?: string | null;
  }) {
    const agendamento = await prisma.agendamento.findUnique({ where: { id } });
    if (!agendamento) throw new AppError(404, "Agendamento não encontrado");
    return prisma.agendamento.update({
      where: { id },
      data: {
        atendimentoId: data.atendimentoId !== undefined ? data.atendimentoId : undefined,
        enderecoId: data.enderecoId !== undefined ? data.enderecoId : undefined,
        userId: data.userId !== undefined ? data.userId : undefined,
        tipo: data.tipo ?? undefined,
        status: data.status ?? undefined,
        dataPrevista: data.dataPrevista ?? undefined,
        dataRealizada: data.dataRealizada !== undefined ? data.dataRealizada : undefined,
        observacoes: data.observacoes !== undefined ? data.observacoes : undefined,
      },
      include: {
        cliente: { select: { id: true, nome: true, telefone: true } },
        user: { select: { id: true, nome: true } },
      },
    });
  },

  async atualizarStatus(id: number, status: StatusAgendamento, dataRealizada?: Date | null, criadoPorId?: number) {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id },
      include: { cliente: { select: { id: true, nome: true } } },
    });
    if (!agendamento) throw new AppError(404, "Agendamento não encontrado");

    const atualizado = await prisma.agendamento.update({
      where: { id },
      data: {
        status,
        dataRealizada: status === StatusAgendamento.REALIZADO
          ? (dataRealizada ?? new Date())
          : (dataRealizada ?? undefined),
      },
      include: {
        cliente: { select: { id: true, nome: true } },
        user: { select: { id: true, nome: true } },
      },
    });

    if (status === StatusAgendamento.REALIZADO && agendamento.userId) {
      await notificarUsuarios([agendamento.userId], {
        titulo: "Agendamento concluído",
        mensagem: `Compromisso com ${agendamento.cliente?.nome ?? "cliente"} foi concluído.`,
        link: `/agendamentos/${agendamento.id}`,
      });
    }
    void criadoPorId;
    return atualizado;
  },

  async remover(id: number) {
    const agendamento = await prisma.agendamento.findUnique({ where: { id } });
    if (!agendamento) throw new AppError(404, "Agendamento não encontrado");
    await prisma.agendamento.delete({ where: { id } });
    return { ok: true };
  },
};