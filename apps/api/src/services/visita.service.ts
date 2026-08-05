import { StatusVisita, Urgencia } from "@prisma/client";
import { prisma } from "../db";
import { AppError } from "../lib/errors";
import { addBusinessDays, prazoVisita } from "../lib/prazos";
import { notificarUsuarios } from "../lib/notificacao";

export const visitaService = {
  async listar(filtro: { status?: string }) {
    return prisma.visitaTecnica.findMany({
      where: { status: filtro.status ? (filtro.status as StatusVisita) : undefined },
      include: {
        contato: { select: { id: true, nome: true, descricao: true, urgencia: true } },
        tecnico: { select: { id: true, nome: true } },
      },
      orderBy: { dataPrevista: "asc" },
    });
  },

  async agendar(data: {
    contatoId: number;
    tecnicoId: number;
    dataPrevista?: string;
    urgencia?: Urgencia;
    endereco?: string;
  }) {
    const contato = await prisma.contato.findUnique({ where: { id: data.contatoId } });
    if (!contato) throw new AppError(404, "Contato não encontrado");
    const urgencia = data.urgencia ?? contato.urgencia ?? "NORMAL";
    const dataPrevista = data.dataPrevista
      ? new Date(data.dataPrevista)
      : addBusinessDays(new Date(), await prazoVisita(prisma, urgencia));

    const visita = await prisma.visitaTecnica.create({
      data: {
        contatoId: data.contatoId,
        tecnicoId: data.tecnicoId,
        dataPrevista,
        urgencia,
        endereco: data.endereco ?? contato.endereco,
      },
      include: { tecnico: { select: { id: true, nome: true } } },
    });
    await prisma.contato.update({
      where: { id: data.contatoId },
      data: { status: "EM_ANDAMENTO" },
    });
    await notificarUsuarios([data.tecnicoId], {
      titulo: "Visita técnica agendada",
      mensagem: `Você tem uma visita agendada para ${dataPrevista.toLocaleDateString("pt-BR")}.`,
      link: `/visitas/${visita.id}`,
    });
    return visita;
  },

  async realizar(id: number, data: {
    relatorio?: string;
    endereco?: string;
    urgencia?: Urgencia;
  }, tecnicoId: number) {
    const visita = await prisma.visitaTecnica.findUnique({ where: { id } });
    if (!visita) throw new AppError(404, "Visita não encontrada");
    if (visita.tecnicoId && visita.tecnicoId !== tecnicoId) {
      throw new AppError(403, "Você não é o técnico responsável por esta visita");
    }
    const atualizada = await prisma.visitaTecnica.update({
      where: { id },
      data: {
        status: "REALIZADA",
        dataRealizada: new Date(),
        relatorio: data.relatorio,
        endereco: data.endereco,
        urgencia: data.urgencia ?? visita.urgencia,
      },
    });
    await prisma.contato.update({
      where: { id: visita.contatoId },
      data: { status: "ENCAMINHADO", urgencia: data.urgencia ?? visita.urgencia },
    });
    return atualizada;
  },

  async cancelar(id: number) {
    const visita = await prisma.visitaTecnica.findUnique({ where: { id } });
    if (!visita) throw new AppError(404, "Visita não encontrada");
    const atualizada = await prisma.visitaTecnica.update({
      where: { id },
      data: { status: "CANCELADA" },
    });
    const temOS = await prisma.ordemServico.count({ where: { contatoId: visita.contatoId } });
    if (temOS === 0) {
      await prisma.contato.update({ where: { id: visita.contatoId }, data: { status: "NOVO" } });
    }
    return atualizada;
  },
};
