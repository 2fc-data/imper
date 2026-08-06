import { Router } from "express";
import { z } from "zod";
import { parseBody, parseParams, parseQuery } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { servicoMarketingService } from "../services/servicoMarketing.service";

const router = Router();
const perfil = ["ADMIN", "SUPERVISOR"] as const;

router.get("/", authMiddleware(...perfil), wrap(async (req, res) => {
  const query = parseQuery(
    z.object({ q: z.string().optional() }),
    req.query,
  );
  res.json(await servicoMarketingService.listar(query));
}));

router.post("/", authMiddleware(...perfil), wrap(async (req, res) => {
  const body = parseBody(
    z.object({
      titulo: z.string().min(2),
      descricao: z.string().min(2),
      icone: z.string().min(1),
      ativo: z.boolean().optional(),
    }),
    req.body,
  );
  res.status(201).json(await servicoMarketingService.criar(body));
}));

router.put("/:id", authMiddleware(...perfil), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  const body = parseBody(
    z.object({
      titulo: z.string().min(2).optional(),
      descricao: z.string().min(2).optional(),
      icone: z.string().min(1).optional(),
      ativo: z.boolean().optional(),
    }),
    req.body,
  );
  res.json(await servicoMarketingService.atualizar(id, body));
}));

router.delete("/:id", authMiddleware(...perfil), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await servicoMarketingService.excluir(id));
}));

export default router;
