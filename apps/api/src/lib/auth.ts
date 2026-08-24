import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { prisma } from "../db";
import { AppError } from "./errors";

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  permissoes: string[];
}

export interface ClienteAcesso {
  ordemServicoId: number;
  nome: string;
  token: string;
}

export function signToken(user: { id: number; nome: string; email: string; permissoes: string[] }): string {
  return jwt.sign(user, config.jwtSecret, { expiresIn: config.jwtExpires as jwt.SignOptions["expiresIn"] });
}

/** Mapeamento de compatibilidade: enum values antigos → nomes de papel na tabela */
const PAPEL_ENUM_COMPAT: Record<string, string> = {
  ADMIN: "ADMIN",
  SUPERVISOR: "SUPERVISOR",
  TECNICO: "TECNICO",
  ALMOXARIFE: "ALMOXARIFE",
  CONTABILIDADE: "CONTABILIDADE",
  ATENDENTE: "ATENDENTE",
  CLIENTE: "CLIENTE",
};

/**
 * Middleware de autenticação e autorização.
 *
 * Aceita strings de permissão (ex: "criar_usuario", "editar_os").
 * Para compatibilidade, também aceita nomes de papel (ex: "ADMIN", "SUPERVISOR")
 * e verifica se o usuário possui esse papel.
 */
export function authMiddleware(...permissoesOuPapeis: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      next(new AppError(401, "Token não informado"));
      return;
    }

    try {
      const payload = jwt.verify(header.slice(7), config.jwtSecret) as Omit<AuthUser, "permissoes">;

      // Buscar permissões do usuário no banco
      const userPapeis = await prisma.usuarioPapel.findMany({
        where: { userId: payload.id },
        include: {
          papel: {
            include: {
              permissoes: {
                include: { permissao: true },
              },
            },
          },
        },
      });

      const permissoes = new Set<string>();
      const nomesPapeis = new Set<string>();
      for (const up of userPapeis) {
        nomesPapeis.add(up.papel.nome);
        for (const pp of up.papel.permissoes) {
          permissoes.add(pp.permissao.chave);
        }
      }

      // Verificar autorização
      if (permissoesOuPapeis.length) {
        const temPermissao = permissoesOuPapeis.some((p) => {
          // Compatibilidade: se for nome de papel, verificar se o user tem esse papel
          if (PAPEL_ENUM_COMPAT[p]) {
            return nomesPapeis.has(p);
          }
          // Caso contrário, verificar se tem a permissão
          return permissoes.has(p);
        });
        if (!temPermissao) {
          next(new AppError(403, "Sem permissão para esta ação"));
          return;
        }
      }

      // Injetar dados completos no request
      req.user = {
        id: payload.id,
        nome: payload.nome,
        email: payload.email,
        permissoes: Array.from(permissoes),
      };
      next();
    } catch {
      next(new AppError(401, "Token inválido ou expirado"));
    }
  };
}

export async function clienteLinkMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.headers["x-acesso-token"] as string | undefined;
    if (!token) {
      next(new AppError(401, "Token de acesso não informado"));
      return;
    }
    const acesso = await prisma.acessoCliente.findUnique({ where: { token } });
    if (!acesso || !acesso.ativo) {
      next(new AppError(401, "Link inválido ou inativo"));
      return;
    }
    if (acesso.expiraEm < new Date()) {
      next(new AppError(401, "Link expirado"));
      return;
    }
    await prisma.acessoCliente.update({
      where: { id: acesso.id },
      data: { ultimoAcesso: new Date() },
    });
    req.acessoCliente = { ordemServicoId: acesso.ordemServicoId, nome: acesso.nome, token };
    next();
  } catch (err) {
    next(err);
  }
}
