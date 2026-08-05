import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Papel } from "@prisma/client";
import { config } from "../config";
import { prisma } from "../db";
import { AppError } from "./errors";

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  papel: Papel;
}

export interface ClienteAcesso {
  ordemServicoId: number;
  nome: string;
  token: string;
}

export function signToken(user: AuthUser): string {
  return jwt.sign(user, config.jwtSecret, { expiresIn: config.jwtExpires as jwt.SignOptions["expiresIn"] });
}

export function authMiddleware(...papeis: Papel[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      next(new AppError(401, "Token não informado"));
      return;
    }
    try {
      const payload = jwt.verify(header.slice(7), config.jwtSecret) as AuthUser;
      if (papeis.length && !papeis.includes(payload.papel)) {
        next(new AppError(403, "Sem permissão para esta ação"));
        return;
      }
      req.user = payload;
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
