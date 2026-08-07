import { Router } from "express";
import { z } from "zod";
import { parseQuery } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { clienteService } from "../services/cliente.service";

const router = Router();

router.get("/", authMiddleware("ADMIN", "SUPERVISOR", "ATENDENTE"), wrap(async (req, res) => {
  const { q } = parseQuery(z.object({ q: z.string().min(3).max(120) }), req.query);
  res.json(await clienteService.buscar(q));
}));

router.get("/me", authMiddleware("CLIENTE"), wrap(async (req, res) => {
  res.json(await clienteService.me(req.user!.id));
}));

router.get("/os", authMiddleware("CLIENTE"), wrap(async (req, res) => {
  res.json(await clienteService.listarOs(req.user!.id));
}));

export default router;
