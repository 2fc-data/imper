import { ResultadoVisita, StatusVisita, Urgencia } from "@prisma/client";
import { prisma } from "../db";
import { AppError } from "../lib/errors";
import { addBusinessDays, prazoVisita } from "../lib/prazos";
import { notificarUsuarios } from "../lib/notificacao";

export const visitaService = {
  async listar(filtro: { status?: string }) {
    return prisma.visitaTecnica.findMany({
      where: { status: filtro.status ? (filtro.status as StatusVisita) : undefined },
      include: {
        atendimento: { select: { id: true, descricao: true, urgencia: true, status: true } },
        endereco: true,
        tecnico: { select: { id: true, nome: true } },
        _count: { select: { orcamentos: true } },
      },
      orderBy: { dataPrevista: "asc" },
    });
  },

  async agendar(data: {
    atendimentoId: number;
    tecnicoId: number;
    dataPrevista?: string;
    urgencia?: Urgencia;
    enderecoId?: number;
  }) {
    const atendimento = await prisma.atendimento.findUnique({
      where: { id: data.atendimentoId },
      include: { cliente: { include: { enderecos: { where: { principal: true } } } } },
    });
    if (!atendimento) throw new AppError(404, "Atendimento não encontrado");
    const urgencia = data.urgencia ?? atendimento.urgencia ?? "NORMAL";
    const dataPrevista = data.dataPrevista
      ? new Date(data.dataPrevista)
      : addBusinessDays(new Date(), await prazoVisita(prisma, urgencia));

    const enderecoId = data.enderecoId ?? atendimento.cliente?.enderecos[0]?.id ?? null;

    const visita = await prisma.visitaTecnica.create({
      data: {
        atendimentoId: data.atendimentoId,
        tecnicoId: data.tecnicoId,
        dataPrevista,
        urgencia,
        enderecoId,
      },
      include: {
        atendimento: { select: { id: true, descricao: true } },
        endereco: true,
        tecnico: { select: { id: true, nome: true } },
      },
    });
    await prisma.atendimento.update({
      where: { id: data.atendimentoId },
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
    urgencia?: Urgencia;
    resultado?: ResultadoVisita;
    constatacao?: string;
    necessitaOrcamento?: boolean;
    necessitaObra?: boolean;
  }, tecnicoId: number) {
    const visita = await prisma.visitaTecnica.findUnique({ where: { id } });
    if (!visita) throw new AppError(404, "Visita não encontrada");
    if (visita.tecnicoId && visita.tecnicoId !== tecnicoId) {
      throw new AppError(403, "Você não é o técnico responsável por esta visita");
    }
    const resultado = data.resultado ?? ResultadoVisita.SEM_ACAO;
    const necessitaOrcamento = data.necessitaOrcamento ?? (resultado === ResultadoVisita.ORCAMENTO_NECESSARIO);
    const necessitaObra = data.necessitaObra ?? (resultado === ResultadoVisita.OBRA_NECESSARIA);
    const atualizada = await prisma.visitaTecnica.update({
      where: { id },
      data: {
        status: "REALIZADA",
        dataRealizada: new Date(),
        relatorio: data.relatorio,
        urgencia: data.urgencia ?? visita.urgencia,
        resultado,
        constatacao: data.constatacao,
        necessitaOrcamento,
        necessitaObra,
      },
    });
    await prisma.atendimento.update({
      where: { id: visita.atendimentoId },
      data: { status: "CONCLUIDO", urgencia: data.urgencia ?? visita.urgencia },
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
    const temOS = await prisma.ordemServico.count({ where: { atendimentoId: visita.atendimentoId } });
    if (temOS === 0) {
      await prisma.atendimento.update({ where: { id: visita.atendimentoId }, data: { status: "NOVO" } });
    }
    return atualizada;
  },
};