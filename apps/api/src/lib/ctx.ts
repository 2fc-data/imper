export interface Ctx {
  userId: number;
  permissoes: string[];
  nome: string;
  email: string;
}

export function toCtx(user: { id: number; permissoes: string[]; nome: string; email: string }): Ctx {
  return { userId: user.id, permissoes: user.permissoes, nome: user.nome, email: user.email };
}
