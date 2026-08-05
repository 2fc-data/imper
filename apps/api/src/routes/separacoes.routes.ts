import { Router } from "express";
import { z } from "zod";
import { parseBody, parseParams, parseQuery } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { toCtx } from "../lib/ctx";
import { separacaoService } from "../services/separacao.service";

const router = Router();
const perfil = ["ADMIN", "SUPERVISOR", "TECNICO", "ALMOXARIFE"] as const;

router.get("/", authMiddleware(...perfil), wrap(async (req, res) => {
  const query = parseQuery(z.object({ status: z.string().optional() }), req.query);
  res.json(await separacaoService.listar(query));
}));

router.post("/", authMiddleware("ADMIN", "ALMOXARIFE"), wrap(async (req, res) => {
  const body = parseBody(z.object({ faseOsId: z.number().int().positive() }), req.body);
  res.status(201).json(await separacaoService.criar(body.faseOsId, toCtx(req.user!)));
}));

router.get("/:id", authMiddleware(...perfil), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await separacaoService.detalhar(id));
}));

router.post("/itens/:itemId/separar", authMiddleware("ADMIN", "ALMOXARIFE"), wrap(async (req, res) => {
  const { itemId } = parseParams(z.object({ itemId: z.coerce.number().int() }), req.params);
  const body = parseBody(z.object({ quantidade: z.number().positive() }), req.body);
  res.json(await separacaoService.separar(itemId, body.quantidade, toCtx(req.user!)));
}));

router.post("/itens/:itemId/em-falta", authMiddleware("ADMIN", "ALMOXARIFE"), wrap(async (req, res) => {
  const { itemId } = parseParams(z.object({ itemId: z.coerce.number().int() }), req.params);
  const body = parseBody(z.object({ observacao: z.string().optional() }), req.body ?? {});
  res.json(await separacaoService.marcarEmFalta(itemId, body.observacao));
}));

router.post("/itens/:itemId/retirar", authMiddleware("ADMIN", "ALMOXARIFE"), wrap(async (req, res) => {
  const { itemId } = parseParams(z.object({ itemId: z.coerce.number().int() }), req.params);
  res.json(await separacaoService.retirar(itemId, toCtx(req.user!)));
}));

router.post("/itens/:itemId/conferir", authMiddleware("ADMIN", "ALMOXARIFE"), wrap(async (req, res) => {
  const { itemId } = parseParams(z.object({ itemId: z.coerce.number().int() }), req.params);
  res.json(await separacaoService.conferir(itemId, toCtx(req.user!)));
}));

export default router;
