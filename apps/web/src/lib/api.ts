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
}

export async function listarServicos(): Promise<ServicoMarketing[]> {
  return api.get<ServicoMarketing[]>("/publico/servicos");
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
