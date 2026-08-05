import { StatusFaseOS, StatusOS } from "@prisma/client";
import { prisma } from "../db";
import { AppError } from "../lib/errors";
import { Ctx } from "../lib/ctx";
import { aplicarMovimento } from "../lib/estoque";
import { notificarPapeis } from "../lib/notificacao";

const STATUS_CONCLUIDOS: StatusOS[] = ["CONCLUIDO", "CONFIRMADO", "ENTREGUE"];

export const osService = {
  async listar(filtro: { status?: string; tecnicoId?: number | string; q?: string }) {
    return prisma.ordemServico.findMany({
      where: {
        status: filtro.status ? (filtro.status as StatusOS) : undefined,
        tecnicoResponsavelId: filtro.tecnicoId ? Number(filtro.tecnicoId) : undefined,
        OR: filtro.q
          ? [
              { codigo: { contains: filtro.q } },
              { contato: { nome: { contains: filtro.q } } },
              { cliente: { nome: { contains: filtro.q } } },
            ]
          : undefined,
      },
      include: {
        cliente: { select: { id: true, nome: true } },
        contato: { select: { id: true, nome: true } },
        orcamento: { select: { codigo: true, valorTotal: true } },
        tecnicoResponsavel: { select: { id: true, nome: true } },
        _count: { select: { fases: true, pagamentos: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async detalhar(id: number) {
    const os = await prisma.ordemServico.findUnique({
      where: { id },
      include: {
        cliente: true,
        contato: true,
        orcamento: { include: { itens: true } },
        tecnicoResponsavel: { select: { id: true, nome: true } },
        aprovadoPor: { select: { id: true, nome: true } },
        fases: {
          orderBy: { ordem: "asc" },
          include: { materiais: { include: { material: true } }, separacoes: { include: { itens: true } } },
        },
        compras: { include: { itens: { include: { material: true } } } },
        pagamentos: true,
        aditivos: { include: { itens: true } },
        historico: { orderBy: { registradoEm: "desc" }, take: 20 },
        assinatura: true,
        acessosCliente: true,
      },
    });
    if (!os) throw new AppError(404, "Ordem de serviço não encontrada");
    return os;
  },

  async aprovar(id: number, ctx: Ctx) {
    const os = await prisma.ordemServico.findUnique({
      where: { id },
      include: { compras: { select: { status: true } } },
    });
    if (!os) throw new AppError(404, "Ordem de serviço não encontrada");
    if (os.status !== "AGUARDANDO_APROVACAO") {
      throw new AppError(409, "OS não está aguardando aprovação");
    }
    const compraPendente = os.compras.some(
      (c) => c.status === "PENDENTE" || c.status === "APROVADA",
    );
    const atualizada = await prisma.ordemServico.update({
      where: { id },
      data: {
        status: compraPendente ? "AGUARDANDO_APROVACAO" : "AGENDADO",
        aprovadoPorId: ctx.userId,
        aprovadoEm: new Date(),
      },
    });
    await prisma.orcamento.update({
      where: { id: os.orcamentoId },
      data: { aprovadoPorId: ctx.userId, aprovadoEm: new Date() },
    });
    await notificarPapeis(["TECNICO", "SUPERVISOR"], {
      titulo: "OS aprovada",
      mensagem: `A OS ${os.codigo} foi aprovada${compraPendente ? " e aguarda o estoque chegar" : ""}.`,
      link: `/os/${id}`,
      ordemServicoId: id,
    });
    if (compraPendente) {
      await notificarPapeis(["ALMOXARIFE"], {
        titulo: "OS aguardando estoque",
        mensagem: `A OS ${os.codigo} só inicia após o recebimento da compra pendente.`,
        link: `/os/${id}`,
        ordemServicoId: id,
      });
    }
    return atualizada;
  },

  async iniciar(id: number, ctx: Ctx) {
    const os = await prisma.ordemServico.findUnique({ where: { id } });
    if (!os) throw new AppError(404, "Ordem de serviço não encontrada");
    if (os.status !== "AGENDADO") throw new AppError(409, "OS precisa estar AGENDADA para iniciar");
    const atualizada = await prisma.ordemServico.update({
      where: { id },
      data: {
        status: "EM_ANDAMENTO",
        dataInicioReal: new Date(),
        tecnicoResponsavelId: os.tecnicoResponsavelId ?? ctx.userId,
      },
    });
    return atualizada;
  },

  async atualizarFase(faseOsId: number, status: StatusFaseOS, ctx: Ctx) {
    const fase = await prisma.faseOS.findUnique({ where: { id: faseOsId } });
    if (!fase) throw new AppError(404, "Fase não encontrada");
    const atualizada = await prisma.faseOS.update({ where: { id: faseOsId }, data: { status } });
    const todasConcluidas = await prisma.faseOS.count({
      where: { ordemServicoId: fase.ordemServicoId, status: { not: "CONCLUIDA" } },
    });
    if (todasConcluidas === 0) {
      const os = await prisma.ordemServico.findUnique({ where: { id: fase.ordemServicoId } });
      if (os && os.status === "EM_ANDAMENTO") {
        await prisma.ordemServico.update({
          where: { id: os.id },
          data: { status: "CONCLUIDO", dataFimReal: new Date() },
        });
      }
    }
    void ctx;
    return atualizada;
  },

  async concluir(id: number, ctx: Ctx) {
    const os = await prisma.ordemServico.findUnique({
      where: { id },
      include: { fases: { select: { status: true } } },
    });
    if (!os) throw new AppError(404, "Ordem de serviço não encontrada");
    if (os.status !== "EM_ANDAMENTO") throw new AppError(409, "OS precisa estar em andamento");
    if (os.fases.length && os.fases.some((f) => f.status !== "CONCLUIDA")) {
      throw new AppError(409, "Conclua todas as fases antes de encerrar a obra");
    }
    const atualizada = await prisma.ordemServico.update({
      where: { id },
      data: { status: "CONCLUIDO", dataFimReal: new Date() },
    });
    void ctx;
    return atualizada;
  },

  async confirmarObra(id: number, ctx: Ctx) {
    const os = await prisma.ordemServico.findUnique({ where: { id } });
    if (!os) throw new AppError(404, "Ordem de serviço não encontrada");
    if (os.status !== "CONCLUIDO") throw new AppError(409, "OS precisa estar CONCLUIDA");
    const atualizada = await prisma.ordemServico.update({
      where: { id },
      data: { status: "CONFIRMADO", confirmadoEm: new Date() },
    });
    void ctx;
    return atualizada;
  },

  async entregar(id: number, ctx: Ctx) {
    const os = await prisma.ordemServico.findUnique({ where: { id } });
    if (!os) throw new AppError(404, "Ordem de serviço não encontrada");
    if (os.status !== "CONFIRMADO") throw new AppError(409, "OS precisa estar CONFIRMADA");
    const atualizada = await prisma.ordemServico.update({
      where: { id },
      data: { status: "ENTREGUE" },
    });
    void ctx;
    return atualizada;
  },

  async cancelar(id: number, motivo: string | undefined) {
    return prisma.$transaction(async (tx) => {
      const os = await tx.ordemServico.findUnique({ where: { id } });
      if (!os) throw new AppError(404, "Ordem de serviço não encontrada");
      if (STATUS_CONCLUIDOS.includes(os.status)) {
        throw new AppError(409, "OS concluída não pode ser cancelada");
      }
      const saidas = await tx.movimentoEstoque.findMany({
        where: { ordemServicoId: id, tipo: "SAIDA" },
      });
      const porMaterial = new Map<number, number>();
      for (const m of saidas) {
        porMaterial.set(m.materialId, (porMaterial.get(m.materialId) ?? 0) + Number(m.quantidade));
      }
      for (const [materialId, qtd] of porMaterial) {
        await aplicarMovimento(tx, {
          materialId,
          tipo: "ENTRADA",
          quantidade: qtd,
          ordemServicoId: id,
          observacao: `Estorno cancelamento OS ${os.codigo}`,
        });
      }
      const atualizada = await tx.ordemServico.update({
        where: { id },
        data: { status: "CANCELADO", motivoRejeicao: motivo },
      });
      if (os.contatoId) {
        await tx.contato.update({
          where: { id: os.contatoId },
          data: { status: "ENCAMINHADO" },
        });
      }
      return atualizada;
    });
  },
};
