import { Router } from "express";
import { z } from "zod";
import { FormaPagamento } from "@prisma/client";
import { parseBody, parseParams, parseQuery } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { toCtx } from "../lib/ctx";
import { vendaService } from "../services/venda.service";

const router = Router();
const perfil = ["ADMIN", "SUPERVISOR", "CONTABILIDADE", "ATENDENTE"] as const;

router.get("/", authMiddleware(...perfil), wrap(async (req, res) => {
  const query = parseQuery(z.object({ status: z.string().optional(), q: z.string().optional() }), req.query);
  res.json(await vendaService.listar(query));
}));

router.post("/", authMiddleware("ADMIN", "ATENDENTE"), wrap(async (req, res) => {
  const body = parseBody(
    z.object({
      atendimentoId: z.number().int().positive().optional(),
      clienteId: z.number().int().positive().optional(),
      ordemServicoId: z.number().int().positive().optional(),
      itens: z
        .array(z.object({ materialId: z.number().int().positive(), quantidade: z.number().positive(), valorUnitario: z.number().nonnegative() }))
        .min(1),
    }),
    req.body,
  );
  res.status(201).json(await vendaService.criar(body, toCtx(req.user!)));
}));

router.get("/:id", authMiddleware(...perfil), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await vendaService.detalhar(id));
}));

router.post("/:id/pagar", authMiddleware("ADMIN", "CONTABILIDADE"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  const body = parseBody(
    z.object({ valor: z.number().positive(), formaPagamento: z.nativeEnum(FormaPagamento), observacoes: z.string().optional() }),
    req.body,
  );
  res.json(await vendaService.registrarPagamento(id, body, toCtx(req.user!)));
}));

router.post("/:id/cancelar", authMiddleware("ADMIN", "CONTABILIDADE"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await vendaService.cancelar(id));
}));

export default router;
