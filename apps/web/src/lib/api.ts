import { Papel } from "@imper/shared";

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    nome: string;
    email: string;
    papel: Papel;
  };
}

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

const TOKEN_KEY = "imper_token";

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:3333";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = res.statusText || "Erro inesperado";
    let details: unknown;
    try {
      const body = await res.json();
      if (typeof body?.message === "string") message = body.message;
      details = body?.details;
    } catch {
      /* corpo não-JSON */
    }
    const err = new Error(message) as Error & {
      status?: number;
      details?: unknown;
    };
    err.status = res.status;
    err.details = details;
    throw err;
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export async function login(email: string, senha: string): Promise<LoginResponse> {
  const data = await api.post<LoginResponse>("/auth/login", { email, senha });
  setToken(data.token);
  return data;
}

export async function fetchMe(): Promise<LoginResponse["user"]> {
  return api.get<LoginResponse["user"]>("/auth/me");
}

export function logout(): void {
  setToken(null);
}

export interface CadastroInput {
  nome: string;
  email: string;
  telefone?: string;
  senha: string;
  turnstileToken?: string;
}

export async function cadastrar(
  input: CadastroInput,
): Promise<LoginResponse> {
  const data = await api.post<LoginResponse>("/auth/cadastro", input);
  setToken(data.token);
  return data;
}

export async function recuperarSenha(
  email: string,
): Promise<{ ok: boolean; devToken?: string }> {
  return api.post<{ ok: boolean; devToken?: string }>("/auth/recuperar-senha", { email });
}

export async function redefinirSenha(
  token: string,
  novaSenha: string,
): Promise<{ ok: boolean }> {
  return api.post<{ ok: boolean }>("/auth/redefinir-senha", { token, novaSenha });
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  papel: Papel;
  ativo: boolean;
  cargoId: number | null;
  cargo?: { id: number; nome: string } | null;
  createdAt: string;
}

export async function listarUsuarios(): Promise<Usuario[]> {
  return api.get<Usuario[]>("/usuarios");
}

export async function definirPerfilUsuario(
  id: number,
  papel: Papel,
): Promise<Usuario> {
  return api.patch<Usuario>(`/usuarios/${id}/perfil`, { papel });
}

export interface MeuCliente {
  id: number;
  nome: string;
  cpfCnpj: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
}

export interface MinhaConta {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  papel: Papel;
  cliente: MeuCliente | null;
}

export interface MinhaOS {
  id: number;
  codigo: string | null;
  status: string;
  urgencia: string;
  valorTotal: string;
  endereco: string | null;
  dataInicioPrevista: string | null;
  confirmadoPorCliente: boolean;
  confirmadoEm: string | null;
  createdAt: string;
  orcamento: {
    codigo: string | null;
    valorTotal: string;
    status: string;
  } | null;
}

export async function buscarMinhaConta(): Promise<MinhaConta> {
  return api.get<MinhaConta>("/cliente/me");
}

export async function listarMinhasOS(): Promise<MinhaOS[]> {
  return api.get<MinhaOS[]>("/cliente/os");
}

export interface ServicoMarketing {
  id: number;
  titulo: string;
  descricao: string;
  icone: string;
  ativo: boolean;
  ordem: number;
  createdAt: string;
  updatedAt: string;
}

export async function listarServicos(): Promise<ServicoMarketing[]> {
  return api.get<ServicoMarketing[]>("/publico/servicos");
}

export interface ServicoMarketingInput {
  titulo: string;
  descricao: string;
  icone: string;
  ativo?: boolean;
}

export async function listarServicosAdmin(params?: { q?: string }): Promise<ServicoMarketing[]> {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.set("q", params.q);
  const queryStr = searchParams.toString();
  return api.get<ServicoMarketing[]>(`/servicos-admin${queryStr ? `?${queryStr}` : ""}`);
}

export async function criarServico(input: ServicoMarketingInput): Promise<ServicoMarketing> {
  return api.post<ServicoMarketing>("/servicos-admin", input);
}

export async function atualizarServico(
  id: number,
  input: Partial<ServicoMarketingInput>,
): Promise<ServicoMarketing> {
  return api.put<ServicoMarketing>(`/servicos-admin/${id}`, input);
}

export async function excluirServico(id: number): Promise<{ ok: boolean }> {
  return api.del<{ ok: boolean }>(`/servicos-admin/${id}`);
}

export interface CidadeAtendida {
  id: number;
  nome: string;
  uf: string;
  lat: number;
  lng: number;
}

export async function listarCidades(): Promise<CidadeAtendida[]> {
  return api.get<CidadeAtendida[]>("/publico/cidades");
}

export interface OrcamentoInput {
  nome: string;
  telefone: string;
  email?: string;
  servico?: string;
  mensagem?: string;
  cep?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  numero?: string;
  complemento?: string;
  turnstileToken?: string;
}

export interface OrcamentoResult {
  id: number;
  nome: string;
  canal: string;
  tipo: string;
  status: string;
  createdAt: string;
}

export async function solicitarOrcamento(
  input: OrcamentoInput,
): Promise<OrcamentoResult> {
  return api.post<OrcamentoResult>("/publico/orcamento", input);
}

export type StatusContato = "NOVO" | "EM_ANDAMENTO" | "ENCAMINHADO" | "CONCLUIDO" | "INATIVO";
export type CanalContato = "WHATSAPP" | "FORMULARIO" | "LOJA" | "TELEFONE";
export type TipoContato = "DUVIDA" | "AGENDAR_VISITA" | "COMPRA_MATERIAL" | "COMPRA_EQUIPAMENTO";
export type Urgencia = "NORMAL" | "URGENTE" | "URGENTISSIMO";

export interface ContatoItem {
  id: number;
  nome: string;
  telefone: string;
  email: string | null;
  endereco: string | null;
  cep: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  numero: string | null;
  complemento: string | null;
  canal: CanalContato;
  tipo: TipoContato;
  urgencia: Urgencia | null;
  status: StatusContato;
  descricao: string | null;
  clienteId: number | null;
  cliente?: { id: number; nome: string; telefone: string | null } | null;
  atendenteId: number | null;
  atendente?: { id: number; nome: string } | null;
  createdAt: string;
  updatedAt: string;
  _count?: { visitas: number; os: number };
}

export interface CriarContatoInput {
  clienteId?: number | null;
  nome: string;
  telefone: string;
  canal: CanalContato;
  tipo: TipoContato;
  urgencia?: Urgencia;
  assunto: string;
  descricao?: string;
  endereco?: string;
}

export async function listarContatos(params?: { status?: string; q?: string }): Promise<ContatoItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.q) searchParams.set("q", params.q);
  const queryStr = searchParams.toString();
  return api.get<ContatoItem[]>(`/contatos${queryStr ? `?${queryStr}` : ""}`);
}

export async function criarContato(input: CriarContatoInput): Promise<ContatoItem> {
  return api.post<ContatoItem>("/contatos", input);
}

export async function atualizarStatusContato(id: number, status: StatusContato): Promise<ContatoItem> {
  return api.patch<ContatoItem>(`/contatos/${id}/status`, { status });
}

export type StatusOrcamento = "RASCUNHO" | "ENVIADO" | "APROVADO" | "RECUSADO" | "EXPIRADO" | "CANCELADO";
export type TipoItemServico = "SERVICO" | "MATERIAL" | "EQUIPAMENTO";
export type UnidadeMedida = "UN" | "KG" | "L" | "M2" | "ML" | "CX" | "GL" | "PC" | "MT";

export interface ItemOrcamentoInput {
  servicoItemId?: number | null;
  nome: string;
  tipo: TipoItemServico;
  quantidade: number;
  unidade: UnidadeMedida;
  valorUnitario: number;
}

export interface OrcamentoAdminItem {
  id: number;
  codigo: string;
  visitaId: number;
  urgencia: Urgencia;
  status: StatusOrcamento;
  valorTotal: string | number;
  validade: string;
  observacoes: string | null;
  criadoPorId: number;
  aprovadoPorId: number | null;
  aprovadoEm: string | null;
  confirmadoPorCliente: boolean;
  dataConfirmacao: string | null;
  createdAt: string;
  updatedAt: string;
  visita?: { id: number; contato: { id: number; nome: string } };
  ordemServico?: { id: number; codigo: string; status: string } | null;
  _count?: { itens: number };
}

export interface CriarOrcamentoInput {
  visitaId: number;
  observacoes?: string;
  itens: ItemOrcamentoInput[];
}

export async function listarOrcamentosAdmin(params?: { status?: string; q?: string }): Promise<OrcamentoAdminItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.q) searchParams.set("q", params.q);
  const queryStr = searchParams.toString();
  return api.get<OrcamentoAdminItem[]>(`/orcamentos${queryStr ? `?${queryStr}` : ""}`);
}

export async function criarOrcamentoAdmin(input: CriarOrcamentoInput): Promise<OrcamentoAdminItem> {
  return api.post<OrcamentoAdminItem>("/orcamentos", input);
}

export async function enviarOrcamentoAdmin(id: number): Promise<OrcamentoAdminItem> {
  return api.post<OrcamentoAdminItem>(`/orcamentos/${id}/enviar`);
}

export type StatusOS =
  | "AGUARDANDO_APROVACAO"
  | "AGENDADO"
  | "EM_ANDAMENTO"
  | "CONCLUIDO"
  | "CONFIRMADO"
  | "EM_SEPARACAO"
  | "SEPARADO"
  | "ENTREGUE"
  | "CANCELADO";

export interface OrdemServicoAdminItem {
  id: number;
  codigo: string;
  orcamentoId: number;
  clienteId: number | null;
  contatoId: number | null;
  urgencia: Urgencia;
  status: StatusOS;
  valorTotal: string | number;
  endereco: string | null;
  dataInicioPrevista: string | null;
  tecnicoResponsavelId: number | null;
  createdAt: string;
  updatedAt: string;
  cliente?: { id: number; nome: string } | null;
  contato?: { id: number; nome: string } | null;
  tecnicoResponsavel?: { id: number; nome: string } | null;
  _count?: { fases: number; compras: number; vendas: number };
}

export async function listarOSAdmin(params?: { status?: string; q?: string }): Promise<OrdemServicoAdminItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.q) searchParams.set("q", params.q);
  const queryStr = searchParams.toString();
  return api.get<OrdemServicoAdminItem[]>(`/os${queryStr ? `?${queryStr}` : ""}`);
}

export async function aprovarOSAdmin(id: number): Promise<OrdemServicoAdminItem> {
  return api.post<OrdemServicoAdminItem>(`/os/${id}/aprovar`);
}

export async function iniciarOSAdmin(id: number): Promise<OrdemServicoAdminItem> {
  return api.post<OrdemServicoAdminItem>(`/os/${id}/iniciar`);
}

export async function concluirOSAdmin(id: number): Promise<OrdemServicoAdminItem> {
  return api.post<OrdemServicoAdminItem>(`/os/${id}/concluir`);
}

export async function cancelarOSAdmin(id: number, motivo?: string): Promise<OrdemServicoAdminItem> {
  return api.post<OrdemServicoAdminItem>(`/os/${id}/cancelar`, { motivo });
}



