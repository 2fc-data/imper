import { Prisma } from "@prisma/client";
import { AppError } from "./errors";

type Tx = Prisma.TransactionClient;

interface MovimentoInput {
  materialId: number;
  tipo: "ENTRADA" | "SAIDA";
  quantidade: number;
  registradoPorId?: number | null;
  ordemServicoId?: number | null;
  compraItemId?: number | null;
  vendaId?: number | null;
  separacaoItemId?: number | null;
  observacao?: string;
}

export async function getSaldo(tx: Tx, materialId: number): Promise<number> {
  const s = await tx.saldoEstoque.findUnique({ where: { materialId } });
  return s ? s.saldo.toNumber() : 0;
}

export async function aplicarMovimento(
  tx: Tx,
  params: MovimentoInput,
): Promise<number> {
  const atual = await getSaldo(tx, params.materialId);
  const novo = params.tipo === "ENTRADA" ? atual + params.quantidade : atual - params.quantidade;
  if (novo < 0) {
    throw new AppError(409, "Estoque insuficiente", {
      materialId: params.materialId,
      disponivel: atual,
      solicitado: params.quantidade,
    });
  }
  await tx.saldoEstoque.upsert({
    where: { materialId: params.materialId },
    update: { saldo: novo },
    create: { materialId: params.materialId, saldo: novo },
  });
  await tx.movimentoEstoque.create({
    data: {
      materialId: params.materialId,
      tipo: params.tipo,
      quantidade: params.quantidade,
      saldoApos: novo,
      registradoPorId: params.registradoPorId ?? null,
      ordemServicoId: params.ordemServicoId ?? null,
      compraItemId: params.compraItemId ?? null,
      vendaId: params.vendaId ?? null,
      separacaoItemId: params.separacaoItemId ?? null,
      observacao: params.observacao ?? null,
    },
  });
  return novo;
}

export async function reservarDisponivel(
  tx: Tx,
  params: MovimentoInput & { quantidade: number },
): Promise<{ reservado: number; faltante: number }> {
  const atual = await getSaldo(tx, params.materialId);
  const reservar = Math.min(atual, params.quantidade);
  if (reservar > 0) {
    await aplicarMovimento(tx, { ...params, quantidade: reservar });
  }
  return { reservado: reservar, faltante: params.quantidade - reservar };
}
