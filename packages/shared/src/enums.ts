export const Papel = {
  ADMIN: "ADMIN",
  SUPERVISOR: "SUPERVISOR",
  TECNICO: "TECNICO",
  ALMOXARIFE: "ALMOXARIFE",
  CONTABILIDADE: "CONTABILIDADE",
  ATENDENTE: "ATENDENTE",
  CLIENTE: "CLIENTE",
} as const;
export type Papel = (typeof Papel)[keyof typeof Papel];

export const CanalContato = {
  WHATSAPP: "WHATSAPP",
  FORMULARIO: "FORMULARIO",
  LOJA: "LOJA",
  TELEFONE: "TELEFONE",
} as const;
export type CanalContato = (typeof CanalContato)[keyof typeof CanalContato];

export const TipoContato = {
  DUVIDA: "DUVIDA",
  AGENDAR_VISITA: "AGENDAR_VISITA",
  COMPRA_MATERIAL: "COMPRA_MATERIAL",
  COMPRA_EQUIPAMENTO: "COMPRA_EQUIPAMENTO",
} as const;
export type TipoContato = (typeof TipoContato)[keyof typeof TipoContato];

export const StatusContato = {
  NOVO: "NOVO",
  EM_ANDAMENTO: "EM_ANDAMENTO",
  ENCAMINHADO: "ENCAMINHADO",
  CONCLUIDO: "CONCLUIDO",
  INATIVO: "INATIVO",
} as const;
export type StatusContato = (typeof StatusContato)[keyof typeof StatusContato];

export const Urgencia = {
  NORMAL: "NORMAL",
  URGENTE: "URGENTE",
  URGENTISSIMO: "URGENTISSIMO",
} as const;
export type Urgencia = (typeof Urgencia)[keyof typeof Urgencia];

export const StatusVisita = {
  AGENDADA: "AGENDADA",
  REALIZADA: "REALIZADA",
  CANCELADA: "CANCELADA",
} as const;
export type StatusVisita = (typeof StatusVisita)[keyof typeof StatusVisita];

export const StatusOrcamento = {
  RASCUNHO: "RASCUNHO",
  ENVIADO: "ENVIADO",
  APROVADO: "APROVADO",
  RECUSADO: "RECUSADO",
  EXPIRADO: "EXPIRADO",
  CANCELADO: "CANCELADO",
} as const;
export type StatusOrcamento = (typeof StatusOrcamento)[keyof typeof StatusOrcamento];

export const StatusOS = {
  AGUARDANDO_APROVACAO: "AGUARDANDO_APROVACAO",
  AGENDADO: "AGENDADO",
  EM_ANDAMENTO: "EM_ANDAMENTO",
  CONCLUIDO: "CONCLUIDO",
  CONFIRMADO: "CONFIRMADO",
  EM_SEPARACAO: "EM_SEPARACAO",
  SEPARADO: "SEPARADO",
  ENTREGUE: "ENTREGUE",
  CANCELADO: "CANCELADO",
} as const;
export type StatusOS = (typeof StatusOS)[keyof typeof StatusOS];

export const StatusFaseOS = {
  PENDENTE: "PENDENTE",
  EM_ANDAMENTO: "EM_ANDAMENTO",
  CONCLUIDA: "CONCLUIDA",
} as const;
export type StatusFaseOS = (typeof StatusFaseOS)[keyof typeof StatusFaseOS];

export const StatusMaterial = {
  ATIVO: "ATIVO",
  INATIVO: "INATIVO",
} as const;
export type StatusMaterial = (typeof StatusMaterial)[keyof typeof StatusMaterial];

export const TipoMaterial = {
  MATERIAL: "MATERIAL",
  EQUIPAMENTO: "EQUIPAMENTO",
} as const;
export type TipoMaterial = (typeof TipoMaterial)[keyof typeof TipoMaterial];

export const UnidadeMedida = {
  UN: "UN",
  KG: "KG",
  L: "L",
  M2: "M2",
  ML: "ML",
  CX: "CX",
  GL: "GL",
  PC: "PC",
  MT: "MT",
} as const;
export type UnidadeMedida = (typeof UnidadeMedida)[keyof typeof UnidadeMedida];

export const TipoMovimento = {
  ENTRADA: "ENTRADA",
  SAIDA: "SAIDA",
} as const;
export type TipoMovimento = (typeof TipoMovimento)[keyof typeof TipoMovimento];

export const TipoLancamento = {
  ENTRADA: "ENTRADA",
  SAIDA: "SAIDA",
} as const;
export type TipoLancamento = (typeof TipoLancamento)[keyof typeof TipoLancamento];

export const OrigemLancamento = {
  PAGAMENTO: "PAGAMENTO",
  COMPRA: "COMPRA",
  VENDA: "VENDA",
  ADITIVO: "ADITIVO",
  AJUSTE: "AJUSTE",
  OUTRO: "OUTRO",
} as const;
export type OrigemLancamento = (typeof OrigemLancamento)[keyof typeof OrigemLancamento];

export const FormaPagamento = {
  DINHEIRO: "DINHEIRO",
  PIX: "PIX",
  CARTAO_CREDITO: "CARTAO_CREDITO",
  CARTAO_DEBITO: "CARTAO_DEBITO",
  BOLETO: "BOLETO",
  TRANSFERENCIA: "TRANSFERENCIA",
} as const;
export type FormaPagamento = (typeof FormaPagamento)[keyof typeof FormaPagamento];

export const StatusCompra = {
  PENDENTE: "PENDENTE",
  APROVADA: "APROVADA",
  RECUSADA: "RECUSADA",
  RECEBIDA: "RECEBIDA",
  CANCELADA: "CANCELADA",
} as const;
export type StatusCompra = (typeof StatusCompra)[keyof typeof StatusCompra];

export const StatusCompraItem = {
  PENDENTE: "PENDENTE",
  RECEBIDO: "RECEBIDO",
} as const;
export type StatusCompraItem = (typeof StatusCompraItem)[keyof typeof StatusCompraItem];

export const StatusVenda = {
  PENDENTE: "PENDENTE",
  PAGA: "PAGA",
  CANCELADA: "CANCELADA",
} as const;
export type StatusVenda = (typeof StatusVenda)[keyof typeof StatusVenda];

export const StatusSeparacao = {
  PENDENTE: "PENDENTE",
  PARCIAL: "PARCIAL",
  CONCLUIDA: "CONCLUIDA",
} as const;
export type StatusSeparacao = (typeof StatusSeparacao)[keyof typeof StatusSeparacao];

export const StatusItemSep = {
  PENDENTE: "PENDENTE",
  SEPARADO: "SEPARADO",
  EM_FALTA: "EM_FALTA",
  RETIRADO: "RETIRADO",
  CONFERIDO: "CONFERIDO",
} as const;
export type StatusItemSep = (typeof StatusItemSep)[keyof typeof StatusItemSep];

export const TipoItemServico = {
  SERVICO: "SERVICO",
  MATERIAL: "MATERIAL",
  EQUIPAMENTO: "EQUIPAMENTO",
} as const;
export type TipoItemServico = (typeof TipoItemServico)[keyof typeof TipoItemServico];

export const StatusNotificacao = {
  NAO_LIDA: "NAO_LIDA",
  LIDA: "LIDA",
} as const;
export type StatusNotificacao = (typeof StatusNotificacao)[keyof typeof StatusNotificacao];
