import { Papel } from "@prisma/client";

export interface Ctx {
  userId: number;
  papel: Papel;
  nome: string;
  email: string;
}

export function toCtx(user: { id: number; papel: Papel; nome: string; email: string }): Ctx {
  return { userId: user.id, papel: user.papel, nome: user.nome, email: user.email };
}
