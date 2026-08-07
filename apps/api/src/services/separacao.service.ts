import { StatusItemSep, StatusSeparacao } from "@prisma/client";
import { prisma } from "../db";
import { AppError } from "../lib/errors";
import { Ctx } from "../lib/ctx";
import { gerarCodigo } from "../lib/prazos";

function subBusinessDays(date: Date, n: number): Date {
  const d = new Date(date);
  let added = 0;
  while (added < n) {
    d.setDate(d.getDate() - 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) added += 1;
  }
  return d;
}

async function recalcularStatus(separacaoId: number) {
  const sep = await prisma.separacao.findUnique({ where: { id: separacaoId }, include: { itens: true } });
  if (!sep) return;
  const total = sep.itens.length;
  const prontos = sep.itens.filter((i) => i.status !== "PENDENTE").length;
  let status: StatusSeparacao = "PENDENTE";
  if (total > 0 && prontos === total) status = "CONCLUIDA";
  else if (prontos > 0) status = "PARCIAL";
  await prisma.separacao.update({ where: { id: separacaoId }, data: { status } });
}

async function atualizarStatusOs(ordemServicoId: number) {
  const fases = await prisma.faseOS.findMany({
    where: { ordemServicoId },
    include: { separacoes: true },
  });
  if (!fases.length) return;
  const todasConcluidas = fases.every((f) => f.separacoes.length > 0 && f.separacoes.every((s) => s.status === "CONCLUIDA"));
  if (todasConcluidas) {
    await prisma.ordemServico.update({ where: { id: ordemServicoId }, data: { status: "SEPARADO" } });
  }
}

export const separacaoService = {
  async listar(filtro: { status?: string }) {
    return prisma.separacao.findMany({
      where: { status: filtro.status ? (filtro.status as StatusSeparacao) : undefined },
      include: {
        faseOs: { include: { ordemServico: { select: { codigo: true, status: true } } } },
        itens: { include: { material: { include: { saldo: true } } } },
      },
      orderBy: { dataNecessidade: "asc" },
    });
  },

  async detalhar(id: number) {
    const separacao = await prisma.separacao.findUnique({
      where: { id },
      include: {
        faseOs: { include: { ordemServico: { include: { cliente: true, atendimento: { select: { id: true } } } } } },
        itens: { include: { material: { include: { saldo: true } } } },
      },
    });
    if (!separacao) throw new AppError(404, "Separação não encontrada");
    return separacao;
  },

  async criar(faseOsId: number, ctx: Ctx) {
    return prisma.$transaction(async (tx) => {
      const faseOs = await tx.faseOS.findUnique({
        where: { id: faseOsId },
        include: {
          materiais: true,
          ordemServico: { select: { id: true, dataInicioPrevista: true, codigo: true } },
        },
      });
      if (!faseOs) throw new AppError(404, "Fase da OS não encontrada");
      const ja = await tx.separacao.findFirst({ where: { faseOsId } });
      if (ja) throw new AppError(409, "Já existe separação para esta fase");
      const dataNecessidade = faseOs.ordemServico.dataInicioPrevista
        ? subBusinessDays(faseOs.ordemServico.dataInicioPrevista, 3)
        : new Date();
      const codigo = await gerarCodigo(tx, "SEP");
      const separacao = await tx.separacao.create({
        data: {
          codigo,
          faseOsId,
          dataNecessidade,
          criadoPorId: ctx.userId,
          itens: {
            create: faseOs.materiais.map((m) => ({
              materialId: m.materialId,
              quantidadeNecessaria: m.quantidadePlanejada,
            })),
          },
        },
      });
      await tx.ordemServico.update({
        where: { id: faseOs.ordemServico.id },
        data: { status: "EM_SEPARACAO" },
      });
      return separacao;
    });
  },

  async separar(itemId: number, quantidade: number, ctx: Ctx) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.separacaoItem.findUnique({ where: { id: itemId } });
      if (!item) throw new AppError(404, "Item de separação não encontrado");
      if (item.status === "CONFERIDO") throw new AppError(409, "Item já conferido");
      if (quantidade <= 0) throw new AppError(422, "Quantidade deve ser maior que zero");
      const atualizado = await tx.separacaoItem.update({
        where: { id: itemId },
        data: {
          quantidadeSeparada: quantidade,
          status: "SEPARADO",
          retiradoPorId: ctx.userId,
        },
      });
      await recalcularStatus(item.separacaoId);
      return atualizado;
    });
  },

  async marcarEmFalta(itemId: number, observacao?: string, ctx?: Ctx) {
    const item = await prisma.separacaoItem.findUnique({ where: { id: itemId } });
    if (!item) throw new AppError(404, "Item de separação não encontrado");
    const atualizado = await prisma.separacaoItem.update({
      where: { id: itemId },
      data: { status: "EM_FALTA", observacao },
    });
    await recalcularStatus(item.separacaoId);
    void ctx;
    return atualizado;
  },

  async retirar(itemId: number, ctx: Ctx) {
    const item = await prisma.separacaoItem.findUnique({ where: { id: itemId } });
    if (!item) throw new AppError(404, "Item de separação não encontrado");
    if (item.status === "PENDENTE") throw new AppError(409, "Item precisa estar separado");
    const atualizado = await prisma.separacaoItem.update({
      where: { id: itemId },
      data: { status: "RETIRADO", retiradoPorId: ctx.userId, retiradoEm: new Date() },
    });
    return atualizado;
  },

  async conferir(itemId: number, ctx: Ctx) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.separacaoItem.findUnique({ where: { id: itemId }, include: { separacao: { include: { faseOs: true } } } });
      if (!item) throw new AppError(404, "Item de separação não encontrado");
      if (item.status === "PENDENTE") throw new AppError(409, "Item precisa estar retirado");
      const atualizado = await tx.separacaoItem.update({
        where: { id: itemId },
        data: { status: "CONFERIDO", conferidoPorId: ctx.userId, conferidoEm: new Date() },
      });
      await recalcularStatus(item.separacaoId);
      await atualizarStatusOs(item.separacao.faseOs.ordemServicoId);
      return atualizado;
    });
  },
};
