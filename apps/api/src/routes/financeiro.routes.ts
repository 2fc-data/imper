import { Router } from "express";
import { z } from "zod";
import { FormaPagamento } from "@prisma/client";
import { parseBody, parseParams, parseQuery } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { toCtx } from "../lib/ctx";
import { financeiroService } from "../services/financeiro.service";

const router = Router();
const perfil = ["ADMIN", "CONTABILIDADE"] as const;

router.get("/resumo", authMiddleware(...perfil), wrap(async (req, res) => {
  const query = parseQuery(z.object({ de: z.string().optional(), ate: z.string().optional() }), req.query);
  res.json(await financeiroService.resumo(query));
}));

router.get("/lancamentos", authMiddleware(...perfil), wrap(async (req, res) => {
  const query = parseQuery(z.object({ tipo: z.string().optional(), origem: z.string().optional() }), req.query);
  res.json(await financeiroService.listarLancamentos(query));
}));

router.post("/os/:osId/pagamentos", authMiddleware(...perfil), wrap(async (req, res) => {
  const { osId } = parseParams(z.object({ osId: z.coerce.number().int().positive() }), req.params);
  const body = parseBody(
    z.object({ valor: z.number().positive(), formaPagamento: z.nativeEnum(FormaPagamento), observacoes: z.string().optional() }),
    req.body,
  );
  res.status(201).json(await financeiroService.registrarPagamentoOs(osId, body, toCtx(req.user!)));
}));

export default router;
