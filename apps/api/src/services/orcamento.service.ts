import crypto from "crypto";
import { Prisma, StatusOS, StatusOrcamento, TipoItemServico, UnidadeMedida } from "@prisma/client";
import { prisma } from "../db";
import { AppError } from "../lib/errors";
import { Ctx } from "../lib/ctx";
import { addBusinessDays, getConfig, gerarCodigo, prazoExecucao } from "../lib/prazos";
import { reservarDisponivel } from "../lib/estoque";
import { notificarPapeis } from "../lib/notificacao";

interface ItemOrcamentoInput {
  servicoItemId?: number | null;
  nome: string;
  tipo: TipoItemServico;
  quantidade: number;
  unidade: UnidadeMedida;
  valorUnitario: number;
}

async function validadeOrcamento(): Promise<Date> {
  const dias = await getConfig(prisma, "orcamento.validadeDias", "7");
  const n = Number(dias);
  return new Date(Date.now() + (Number.isFinite(n) && n > 0 ? n : 7) * 86_400_000);
}

export const orcamentoService = {
  async listar(filtro: { status?: string; q?: string }) {
    return prisma.orcamento.findMany({
      where: {
        status: filtro.status ? (filtro.status as StatusOrcamento) : undefined,
        OR: filtro.q
          ? [
              { codigo: { contains: filtro.q } },
              { atendimento: { cliente: { nome: { contains: filtro.q } } } },
            ]
          : undefined,
      },
      include: {
        atendimento: { select: { id: true, cliente: { select: { id: true, nome: true } } } },
        cliente: { select: { id: true, nome: true } },
        endereco: true,
        ordemServico: { select: { id: true, codigo: true, status: true } },
        _count: { select: { itens: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async detalhar(id: number) {
    const orc = await prisma.orcamento.findUnique({
      where: { id },
      include: {
        atendimento: {
          include: {
            cliente: { include: { enderecos: true } },
          },
        },
        cliente: true,
        endereco: true,
        visita: true,
        itens: { include: { servicoItem: { select: { id: true, nome: true, materialId: true, faseId: true } } } },
        ordemServico: { include: { fases: { include: { materiais: { include: { material: true } } } } } },
        criadoPor: { select: { id: true, nome: true } },
        aprovadoPor: { select: { id: true, nome: true } },
      },
    });
    if (!orc) throw new AppError(404, "Orçamento não encontrado");
    return orc;
  },

  async criar(data: {
    atendimentoId: number;
    visitaId?: number;
    enderecoId?: number;
    observacoes?: string;
    itens: ItemOrcamentoInput[];
  }, ctx: Ctx) {
    if (!data.itens.length) throw new AppError(400, "Informe ao menos um item");
    return prisma.$transaction(async (tx) => {
      const atendimento = await tx.atendimento.findUnique({
        where: { id: data.atendimentoId },
        select: { id: true, urgencia: true, clienteId: true },
      });
      if (!atendimento) throw new AppError(404, "Atendimento não encontrado");

      const itens = data.itens.map((i) => {
        const quantidade = Number(i.quantidade);
        const valorUnitario = Number(i.valorUnitario);
        return {
          servicoItemId: i.servicoItemId ?? null,
          nome: i.nome,
          tipo: i.tipo,
          quantidade,
          unidade: i.unidade,
          valorUnitario,
          valorTotal: quantidade * valorUnitario,
        };
      });
      const valorTotal = itens.reduce((s, i) => s + i.valorTotal, 0);
      const codigo = await gerarCodigo(tx, "ORC");
      const validade = await validadeOrcamento();

      const orcamento = await tx.orcamento.create({
        data: {
          codigo,
          atendimentoId: data.atendimentoId,
          visitaId: data.visitaId ?? null,
          clienteId: atendimento.clienteId ?? null,
          enderecoId: data.enderecoId ?? null,
          urgencia: atendimento.urgencia ?? "NORMAL",
          status: "RASCUNHO",
          valorTotal,
          validade,
          observacoes: data.observacoes,
          criadoPorId: ctx.userId,
          itens: { create: itens },
        },
        include: { itens: true },
      });
      return orcamento;
    });
  },

  async enviar(id: number, ctx: Ctx) {
    const orc = await prisma.orcamento.findUnique({ where: { id } });
    if (!orc) throw new AppError(404, "Orçamento não encontrado");
    if (orc.status !== "RASCUNHO") throw new AppError(409, "Orçamento já enviado ou não editável");
    const tokenConfirmacao = orc.tokenConfirmacao ?? crypto.randomBytes(24).toString("hex");
    const atualizado = await prisma.orcamento.update({
      where: { id },
      data: { status: "ENVIADO", tokenConfirmacao },
    });
    await notificarPapeis(["ATENDENTE"], {
      titulo: "Orçamento pronto para envio",
      mensagem: `Orçamento ${orc.codigo} está ENVIADO e aguardando repasse ao cliente.`,
      link: `/orcamentos/${id}`,
    });
    void ctx;
    return atualizado;
  },

  async detalharPorToken(token: string) {
    const orc = await prisma.orcamento.findUnique({
      where: { tokenConfirmacao: token },
      include: {
        itens: true,
        atendimento: { include: { cliente: true } },
        endereco: true,
      },
    });
    if (!orc || orc.tokenConfirmacao !== token) {
      throw new AppError(404, "Convite inválido");
    }
    if (orc.status === "EXPIRADO" || (orc.status === "ENVIADO" && orc.validade < new Date())) {
      throw new AppError(409, "Orçamento expirado");
    }
    return orc;
  },

  async confirmarPorToken(token: string) {
    const orc = await prisma.orcamento.findUnique({
      where: { tokenConfirmacao: token },
      include: {
        itens: { include: { servicoItem: { select: { faseId: true, materialId: true } } } },
        atendimento: { include: { cliente: { select: { id: true, nome: true } } } },
        endereco: true,
      },
    });
    if (!orc || orc.tokenConfirmacao !== token) throw new AppError(404, "Convite inválido");
    if (orc.status !== "ENVIADO") throw new AppError(409, "Orçamento não está aguardando confirmação");
    if (orc.validade < new Date()) {
      await prisma.orcamento.update({ where: { id: orc.id }, data: { status: "EXPIRADO" } });
      throw new AppError(409, "Orçamento expirado");
    }

    const clienteId = orc.clienteId ?? orc.atendimento?.cliente?.id ?? null;
    const clienteNome = orc.atendimento?.cliente?.nome ?? null;
    const enderecoId = orc.enderecoId ?? null;

    const os = await prisma.$transaction(async (tx) => {
      const codigoOS = await gerarCodigo(tx, "OS");
      const dataInicioPrevista = addBusinessDays(new Date(), await prazoExecucao(tx, orc.urgencia));
      const osCriada = await tx.ordemServico.create({
        data: {
          codigo: codigoOS,
          orcamentoId: orc.id,
          clienteId,
          atendimentoId: orc.atendimentoId,
          urgencia: orc.urgencia,
          valorTotal: orc.valorTotal,
          enderecoId,
          dataInicioPrevista,
          status: "AGUARDANDO_APROVACAO",
        },
      });

      const idsFases = [...new Set(
        orc.itens.map((i) => i.servicoItem?.faseId).filter((f): f is number => !!f),
      )];
      const fases = await tx.fase.findMany({
        where: { id: { in: idsFases } },
        orderBy: { ordem: "asc" },
      });
      const faseOsMap = new Map<number, number>();
      for (const fase of fases) {
        const fo = await tx.faseOS.create({
          data: { ordemServicoId: osCriada.id, faseId: fase.id, nome: fase.nome, ordem: fase.ordem },
        });
        faseOsMap.set(fase.id, fo.id);
      }

      const aggMateriais = new Map<string, { faseOsId: number; materialId: number; qtd: number }>();
      const porMaterial = new Map<number, number>();
      for (const item of orc.itens) {
        const materialId = item.servicoItem?.materialId;
        const faseId = item.servicoItem?.faseId;
        if (materialId && faseId && faseOsMap.has(faseId)) {
          const key = `${faseOsMap.get(faseId)}:${materialId}`;
          const atual = aggMateriais.get(key);
          aggMateriais.set(key, {
            faseOsId: faseOsMap.get(faseId)!,
            materialId,
            qtd: (atual?.qtd ?? 0) + Number(item.quantidade),
          });
        }
        if (materialId) {
          porMaterial.set(materialId, (porMaterial.get(materialId) ?? 0) + Number(item.quantidade));
        }
      }
      for (const a of aggMateriais.values()) {
        await tx.faseOSMaterial.create({
          data: { faseOsId: a.faseOsId, materialId: a.materialId, quantidadePlanejada: a.qtd },
        });
      }

      const faltas = new Map<number, number>();
      for (const [materialId, qtd] of porMaterial) {
        const r = await reservarDisponivel(tx, {
          materialId,
          tipo: "SAIDA",
          quantidade: qtd,
          ordemServicoId: osCriada.id,
          observacao: `Reserva orçamento ${orc.codigo}`,
        });
        if (r.faltante > 0) faltas.set(materialId, r.faltante);
      }

      let compraId: number | null = null;
      let statusOS: StatusOS = "AGENDADO";
      if (faltas.size > 0) {
        statusOS = "AGUARDANDO_APROVACAO";
        const codigoCompra = await gerarCodigo(tx, "COMP");
        const materiais = await tx.material.findMany({
          where: { id: { in: [...faltas.keys()] } },
          select: { id: true, custoUnitario: true },
        });
        const compra = await tx.compra.create({
          data: {
            codigo: codigoCompra,
            ordemServicoId: osCriada.id,
            criadoPorId: 1,
            valorTotal: 0,
          },
        });
        for (const [materialId, qtd] of faltas) {
          const custo = Number(materiais.find((m) => m.id === materialId)?.custoUnitario ?? 0);
          await tx.compraItem.create({
            data: {
              compraId: compra.id,
              materialId,
              quantidade: qtd,
              valorUnitario: custo,
              valorTotal: qtd * custo,
            },
          });
        }
        const compraAtualizada = await tx.compra.update({
          where: { id: compra.id },
          data: { valorTotal: await somaCompra(tx, compra.id) },
        });
        compraId = compraAtualizada.id;
      }

      await tx.ordemServico.update({ where: { id: osCriada.id }, data: { status: statusOS } });
      await tx.orcamento.update({
        where: { id: orc.id },
        data: {
          status: "APROVADO",
          confirmadoPorCliente: true,
          dataConfirmacao: new Date(),
          tokenConfirmacao: null,
        },
      });
      if (orc.atendimentoId) {
        await tx.atendimento.update({
          where: { id: orc.atendimentoId },
          data: { status: "CONCLUIDO" },
        });
      }

      const linkDias = Number(await getConfig(tx, "acesso.linkDias", "30"));
      await tx.acessoCliente.create({
        data: {
          ordemServicoId: osCriada.id,
          clienteId,
          nome: clienteNome ?? "Cliente",
          token: crypto.randomBytes(24).toString("hex"),
          expiraEm: new Date(Date.now() + (Number.isFinite(linkDias) ? linkDias : 30) * 86_400_000),
        },
      });

      await notificarPapeis(["ADMIN", "SUPERVISOR"], {
        titulo: "Orçamento confirmado",
        mensagem: `O cliente confirmou o orçamento ${orc.codigo} (${orc.valorTotal.toFixed(2)}). OS ${codigoOS} aguardando aprovação.`,
        link: `/os/${osCriada.id}`,
        ordemServicoId: osCriada.id,
      });
      if (compraId) {
        await notificarPapeis(["ALMOXARIFE"], {
          titulo: "Estoque insuficiente — compra gerada",
          mensagem: `Faltam materiais para a OS ${codigoOS}. Compra pendente criada.`,
          link: `/compras/${compraId}`,
          ordemServicoId: osCriada.id,
        });
      }

      return tx.ordemServico.findUnique({
        where: { id: osCriada.id },
        include: {
          fases: { include: { materiais: { include: { material: true } } } },
          compras: { include: { itens: true } },
          orcamento: true,
        },
      });
    });
    return os;
  },

  async recusarPorToken(token: string) {
    const orc = await prisma.orcamento.findUnique({
      where: { tokenConfirmacao: token },
      select: { id: true, codigo: true, status: true, atendimentoId: true, tokenConfirmacao: true },
    });
    if (!orc || orc.tokenConfirmacao !== token) throw new AppError(404, "Convite inválido");
    if (orc.status !== "ENVIADO") throw new AppError(409, "Orçamento não está aguardando decisão");

    await prisma.$transaction(async (tx) => {
      await tx.orcamento.update({
        where: { id: orc.id },
        data: { status: "RECUSADO", tokenConfirmacao: null },
      });
      if (orc.atendimentoId) {
        await tx.atendimento.update({
          where: { id: orc.atendimentoId },
          data: { status: "CONCLUIDO" },
        });
      }
    });
    await notificarPapeis(["ATENDENTE"], {
      titulo: "Orçamento recusado",
      mensagem: `O cliente recusou o orçamento ${orc.codigo}.`,
      link: `/orcamentos/${orc.id}`,
    });
    return { ok: true };
  },
};

async function somaCompra(tx: Prisma.TransactionClient, compraId: number): Promise<number> {
  const agg = await tx.compraItem.aggregate({
    where: { compraId },
    _sum: { valorTotal: true },
  });
  return Number(agg._sum.valorTotal ?? 0);
}