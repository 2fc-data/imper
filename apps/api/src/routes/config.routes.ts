import { Router } from "express";
import { z } from "zod";
import { parseBody, parseParams } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { configService } from "../services/config.service";

const router = Router();

router.get("/", authMiddleware("ADMIN"), wrap(async (_req, res) => {
  res.json(await configService.listar());
}));

router.put("/", authMiddleware("ADMIN"), wrap(async (req, res) => {
  const body = parseBody(z.array(z.object({ chave: z.string().min(1), valor: z.string() })).min(1), req.body);
  res.json(await configService.salvar(body));
}));

router.put("/:chave", authMiddleware("ADMIN"), wrap(async (req, res) => {
  const { chave } = parseParams(z.object({ chave: z.string().min(1) }), req.params);
  const body = parseBody(z.object({ valor: z.string() }), req.body);
  res.json(await configService.atualizar(chave, body.valor));
}));

export default router;
