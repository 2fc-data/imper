import { Urgencia } from "@prisma/client";

const DIAS_UTEIS = [1, 2, 3, 4, 5];

export function addBusinessDays(date: Date, days: number): Date {
  const d = new Date(date);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (DIAS_UTEIS.includes(d.getDay())) added++;
  }
  return d;
}

export function diffDiasCorridos(date: Date): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(date);
  alvo.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86_400_000);
}

interface ConfigReader {
  configuracao: {
    findUnique(args: { where: { chave: string } }): Promise<{ valor: string } | null>;
  };
}

interface CodigoTx extends ConfigReader {
  configuracao: {
    findUnique(args: { where: { chave: string } }): Promise<{ valor: string } | null>;
    upsert(args: {
      where: { chave: string };
      update: { valor: string };
      create: { chave: string; valor: string };
    }): Promise<unknown>;
    update(args: { where: { chave: string }; data: { valor: string } }): Promise<unknown>;
  };
}

const PRAZOS_VISITA: Record<Urgencia, number> = { NORMAL: 5, URGENTE: 3, URGENTISSIMO: 1 };
const PRAZOS_EXECUCAO: Record<Urgencia, number> = { NORMAL: 10, URGENTE: 3, URGENTISSIMO: 1 };

async function getConfigNum(db: ConfigReader, chave: string, fallback: number): Promise<number> {
  const c = await db.configuracao.findUnique({ where: { chave } });
  if (!c) return fallback;
  const v = Number(c.valor);
  return Number.isFinite(v) ? v : fallback;
}

export async function prazoVisita(db: ConfigReader, urgencia: Urgencia): Promise<number> {
  return getConfigNum(db, `prazo.visita.${urgencia}`, PRAZOS_VISITA[urgencia]);
}

export async function prazoExecucao(db: ConfigReader, urgencia: Urgencia): Promise<number> {
  return getConfigNum(db, `prazo.execucao.${urgencia}`, PRAZOS_EXECUCAO[urgencia]);
}

export async function getConfig(db: ConfigReader, chave: string, fallback = ""): Promise<string> {
  const c = await db.configuracao.findUnique({ where: { chave } });
  return c ? c.valor : fallback;
}

export async function gerarCodigo(tx: CodigoTx, prefixo: string): Promise<string> {
  const ano = new Date().getFullYear();
  const chave = `seq.${prefixo}.${ano}`;
  const seq = await tx.configuracao.findUnique({ where: { chave } });
  const num = (Number(seq?.valor) || 0) + 1;
  await tx.configuracao.upsert({
    where: { chave },
    update: { valor: String(num) },
    create: { chave, valor: String(num) },
  });
  return `${prefixo}-${ano}-${String(num).padStart(4, "0")}`;
}
