import { z } from "zod";

const id = z.coerce.number().int().positive();
const optionalId = z.coerce.number().int().positive().optional();
const decimal = z.coerce.number().nonnegative();

export const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export const clienteSchema = z.object({
  nome: z.string().min(1).max(120),
  telefone: z.string().min(8).max(20),
  email: z.string().email().optional().nullable(),
});

export const enderecoSchema = z.object({
  logradouro: z.string().min(1).max(255),
  numero: z.string().max(20).optional().nullable(),
  complemento: z.string().max(100).optional().nullable(),
  bairro: z.string().max(100).optional().nullable(),
  cidade: z.string().max(100).optional().nullable(),
  estado: z.string().length(2).optional().nullable(),
  cep: z.string().max(9).optional().nullable(),
  rotulo: z.enum(["RESIDENCIAL", "OBRA"]).optional().nullable(),
  principal: z.boolean().optional().nullable(),
});

export const atendimentoSchema = z.object({
  clienteId: optionalId,
  canal: z.enum(["WHATSAPP", "FORMULARIO", "LOJA", "TELEFONE"]),
  motivo: z.enum(["DUVIDA", "AGENDAR_VISITA", "COMPRAR_MATERIAL", "COMPRAR_EQUIPAMENTO"]),
  urgencia: z.enum(["NORMAL", "URGENTE", "URGENTISSIMO"]).optional().nullable(),
  descricao: z.string().max(1000).optional().nullable(),
});

export const atendimentoPublicoSchema = z.object({
  nome: z.string().min(1).max(120),
  telefone: z.string().min(8).max(20),
  email: z.string().email().optional().nullable(),
  motivo: z.enum(["DUVIDA", "AGENDAR_VISITA", "COMPRAR_MATERIAL", "COMPRAR_EQUIPAMENTO"]),
  mensagem: z.string().max(1000).optional().nullable(),
  logradouro: z.string().min(1).max(255),
  numero: z.string().max(20).optional().nullable(),
  complemento: z.string().max(100).optional().nullable(),
  bairro: z.string().max(100).optional().nullable(),
  cidade: z.string().max(100).optional().nullable(),
  estado: z.string().length(2).optional().nullable(),
  cep: z.string().max(9).optional().nullable(),
  turnstileToken: z.string().min(1),
});

export const visitaSchema = z.object({
  atendimentoId: id,
  dataPrevista: z.coerce.date().optional(),
  tecnicoId: optionalId,
  enderecoId: optionalId,
  observacoes: z.string().max(1000).optional().nullable(),
});

export const realizarVisitaSchema = z.object({
  urgencia: z.enum(["NORMAL", "URGENTE", "URGENTISSIMO"]).optional().nullable(),
  relatorio: z.string().max(2000).optional().nullable(),
});

export const orcamentoItemSchema = z.object({
  servicoItemId: optionalId,
  nome: z.string().min(1).max(150),
  tipo: z.enum(["SERVICO", "MATERIAL", "EQUIPAMENTO"]),
  quantidade: decimal.positive(),
  unidade: z.enum(["UN", "KG", "L", "M2", "ML", "CX", "GL", "PC", "MT"]),
  valorUnitario: decimal,
});

export const orcamentoSchema = z.object({
  atendimentoId: id,
  urgencia: z.enum(["NORMAL", "URGENTE", "URGENTISSIMO"]),
  itens: z.array(orcamentoItemSchema).min(1),
  observacoes: z.string().max(2000).optional().nullable(),
  validadeDias: z.coerce.number().int().positive().optional(),
});

export const confirmarOrcamentoSchema = z.object({
  formaPagamento: z.enum([
    "DINHEIRO",
    "PIX",
    "CARTAO_CREDITO",
    "CARTAO_DEBITO",
    "BOLETO",
    "TRANSFERENCIA",
  ]).optional().nullable(),
});

export const aprovarOSSchema = z.object({
  dataInicioPrevista: z.coerce.date().optional(),
});

export const itemSeparacaoSchema = z.object({
  separacaoItemId: id,
});

export const conferirItemSchema = z.object({
  separacaoItemId: id,
  conferido: z.boolean(),
  observacao: z.string().max(500).optional().nullable(),
});

export const compraItemSchema = z.object({
  materialId: id,
  quantidade: decimal.positive(),
  valorUnitario: decimal,
});

export const compraSchema = z.object({
  ordemServicoId: optionalId,
  itens: z.array(compraItemSchema).min(1),
  observacoes: z.string().max(1000).optional().nullable(),
});

export const receberCompraSchema = z.object({
  itens: z
    .array(
      z.object({
        compraItemId: id,
        quantidadeRecebida: decimal.positive(),
      }),
    )
    .min(1),
});

export const lancamentoSchema = z.object({
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  descricao: z.string().min(1).max(255),
  valor: decimal,
  data: z.coerce.date().optional(),
  formaPagamento: z.enum([
    "DINHEIRO",
    "PIX",
    "CARTAO_CREDITO",
    "CARTAO_DEBITO",
    "BOLETO",
    "TRANSFERENCIA",
  ]).optional().nullable(),
  categoria: z.string().max(100).optional().nullable(),
});

export const pagamentoOSSchema = z.object({
  ordemServicoId: id,
  valor: decimal.positive(),
  formaPagamento: z.enum([
    "DINHEIRO",
    "PIX",
    "CARTAO_CREDITO",
    "CARTAO_DEBITO",
    "BOLETO",
    "TRANSFERENCIA",
  ]),
  observacoes: z.string().max(500).optional().nullable(),
});

export const materialSchema = z.object({
  nome: z.string().min(1).max(150),
  tipo: z.enum(["MATERIAL", "EQUIPAMENTO"]),
  unidade: z.enum(["UN", "KG", "L", "M2", "ML", "CX", "GL", "PC", "MT"]),
  quantidadeMinima: decimal.optional().nullable(),
  custoUnitario: decimal.optional().nullable(),
});

export const configSchema = z.object({
  chave: z.string().min(1).max(100),
  valor: z.string().min(1),
  descricao: z.string().max(255).optional().nullable(),
});

export const aditivoSchema = z.object({
  ordemServicoId: id,
  descricao: z.string().min(1).max(500),
  valor: decimal,
  itens: z.array(orcamentoItemSchema).optional(),
});

export const faseSchema = z.object({
  nome: z.string().min(1).max(120),
  ordem: z.coerce.number().int().nonnegative(),
  ativo: z.boolean().optional(),
});

export const servicoItemSchema = z.object({
  nome: z.string().min(1).max(150),
  tipo: z.enum(["SERVICO", "MATERIAL", "EQUIPAMENTO"]),
  unidade: z.enum(["UN", "KG", "L", "M2", "ML", "CX", "GL", "PC", "MT"]),
  faseId: optionalId,
  precoSugerido: decimal.optional().nullable(),
  ativo: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ClienteInput = z.infer<typeof clienteSchema>;
export type EnderecoInput = z.infer<typeof enderecoSchema>;
export type AtendimentoInput = z.infer<typeof atendimentoSchema>;
export type AtendimentoPublicoInput = z.infer<typeof atendimentoPublicoSchema>;
export type VisitaInput = z.infer<typeof visitaSchema>;
export type RealizarVisitaInput = z.infer<typeof realizarVisitaSchema>;
export type OrcamentoInput = z.infer<typeof orcamentoSchema>;
export type ConfirmarOrcamentoInput = z.infer<typeof confirmarOrcamentoSchema>;
export type AprovarOSInput = z.infer<typeof aprovarOSSchema>;
export type CompraInput = z.infer<typeof compraSchema>;
export type ReceberCompraInput = z.infer<typeof receberCompraSchema>;
export type LancamentoInput = z.infer<typeof lancamentoSchema>;
export type PagamentoOSInput = z.infer<typeof pagamentoOSSchema>;
export type MaterialInput = z.infer<typeof materialSchema>;
export type ConfigInput = z.infer<typeof configSchema>;
export type AditivoInput = z.infer<typeof aditivoSchema>;
export type FaseInput = z.infer<typeof faseSchema>;
export type ServicoItemInput = z.infer<typeof servicoItemSchema>;
export type ItemSeparacaoInput = z.infer<typeof itemSeparacaoSchema>;
export type ConferirItemInput = z.infer<typeof conferirItemSchema>;

export const agendamentoSchema = z.object({
  clienteId: id,
  atendimentoId: optionalId,
  enderecoId: optionalId,
  userId: optionalId,
  tipo: z.enum(["VISITA", "ORCAMENTO", "RETORNO", "REUNIAO"]).optional().nullable(),
  status: z.enum(["PENDENTE", "CONFIRMADO", "REALIZADO", "CANCELADO", "NAO_COMPARECEU"]).optional().nullable(),
  dataPrevista: z.coerce.date(),
  dataRealizada: z.coerce.date().optional().nullable(),
  observacoes: z.string().max(1000).optional().nullable(),
});

export const agendamentoStatusSchema = z.object({
  status: z.enum(["PENDENTE", "CONFIRMADO", "REALIZADO", "CANCELADO", "NAO_COMPARECEU"]),
  dataRealizada: z.coerce.date().optional().nullable(),
});

export const realizarVisitaV2Schema = z.object({
  urgencia: z.enum(["NORMAL", "URGENTE", "URGENTISSIMO"]).optional().nullable(),
  relatorio: z.string().max(2000).optional().nullable(),
  resultado: z.enum(["SEM_ACAO", "ORCAMENTO_NECESSARIO", "OBRA_NECESSARIA", "CLIENTE_AUSENTE"]).optional().nullable(),
  constatacao: z.string().max(2000).optional().nullable(),
  necessitaOrcamento: z.boolean().optional().nullable(),
  necessitaObra: z.boolean().optional().nullable(),
});

export type AgendamentoInput = z.infer<typeof agendamentoSchema>;
export type AgendamentoStatusInput = z.infer<typeof agendamentoStatusSchema>;
export type RealizarVisitaV2Input = z.infer<typeof realizarVisitaV2Schema>;
