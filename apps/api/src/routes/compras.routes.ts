import { Router } from "express";
import { z } from "zod";
import { parseBody, parseParams, parseQuery } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { toCtx } from "../lib/ctx";
import { compraService } from "../services/compra.service";

const router = Router();
const perfil = ["ADMIN", "SUPERVISOR", "ALMOXARIFE", "CONTABILIDADE"] as const;

router.get("/", authMiddleware(...perfil), wrap(async (req, res) => {
  const query = parseQuery(z.object({ status: z.string().optional(), q: z.string().optional() }), req.query);
  res.json(await compraService.listar(query));
}));

router.get("/:id", authMiddleware(...perfil), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await compraService.detalhar(id));
}));

router.post("/:id/aprovar", authMiddleware("ADMIN"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await compraService.aprovar(id, toCtx(req.user!)));
}));

router.post("/:id/recusar", authMiddleware("ADMIN"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  const body = parseBody(z.object({ observacoes: z.string().optional() }), req.body ?? {});
  res.json(await compraService.recusar(id, body.observacoes, toCtx(req.user!)));
}));

router.post("/:id/receber", authMiddleware("ADMIN", "ALMOXARIFE"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await compraService.receber(id, toCtx(req.user!)));
}));

export default router;
