import { Router } from "express";
import { z } from "zod";
import { parseParams, parseQuery } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { notificacaoService } from "../services/notificacao.service";

const router = Router();

router.get("/", authMiddleware(), wrap(async (req, res) => {
  const query = parseQuery(z.object({ lida: z.string().optional() }), req.query);
  res.json(await notificacaoService.listar(req.user!.id, query));
}));

router.get("/nao-lidas", authMiddleware(), wrap(async (req, res) => {
  res.json({ total: await notificacaoService.naoLidas(req.user!.id) });
}));

router.patch("/:id/lida", authMiddleware(), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await notificacaoService.marcarLida(id, req.user!.id));
}));

router.patch("/todas-lidas", authMiddleware(), wrap(async (req, res) => {
  res.json(await notificacaoService.marcarTodasLidas(req.user!.id));
}));

export default router;
