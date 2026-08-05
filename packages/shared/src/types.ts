import { Urgencia } from "./enums";

export interface SyncEnvelope<T> {
  deviceId: string;
  lastSyncAt: string | null;
  data: T;
}

export interface ItemEstoque {
  materialId: number;
  nome: string;
  unidade: string;
  saldoDisponivel: number;
  necessario: number;
  suficiente: boolean;
}

export interface UrgenciaPrazos {
  visita: number;
  execucao: number;
}

export interface ResumoOrcamento {
  total: number;
  itens: number;
}

export interface StatusOSVisual {
  status: string;
  label: string;
  cor: string;
}

export function prazosPorUrgencia(
  u: Urgencia,
  cfg: {
    visitaNormal: number;
    visitaUrgente: number;
    visitaUrgentissimo: number;
    execucaoNormal: number;
    execucaoUrgente: number;
    execucaoUrgentissimo: number;
  },
): UrgenciaPrazos {
  switch (u) {
    case Urgencia.URGENTE:
      return { visita: cfg.visitaUrgente, execucao: cfg.execucaoUrgente };
    case Urgencia.URGENTISSIMO:
      return { visita: cfg.visitaUrgentissimo, execucao: cfg.execucaoUrgentissimo };
    default:
      return { visita: cfg.visitaNormal, execucao: cfg.execucaoNormal };
  }
}
