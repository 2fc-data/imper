import { Router } from "express";
import { z } from "zod";
import { StatusManutencao } from "@prisma/client";
import { parseBody, parseParams, parseQuery } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { toCtx } from "../lib/ctx";
import { manutencaoService } from "../services/manutencao.service";

const router = Router();
const perfil = ["ADMIN", "SUPERVISOR", "ATENDENTE", "TECNICO", "ALMOXARIFE"] as const;
const perfilTecnico = ["ADMIN", "SUPERVISOR", "TECNICO"] as const;

const idSchema = z.object({ id: z.coerce.number().int() });
const manutencaoBody = z.object({
  equipamentoId: z.number().int(),
  tipoId: z.number().int(),
  data: z.string().datetime(),
  descricao: z.string().min(3),
  custo: z.number().nonnegative().optional(),
  responsavelManutencaoId: z.number().int().optional(),
  proximaManutencao: z.string().datetime().optional(),
});
const manutencaoUpdate = manutencaoBody.partial().extend({
  status: z.nativeEnum(StatusManutencao).optional(),
  data: z.string().datetime().optional(),
  proximaManutencao: z.string().datetime().nullable().optional(),
});

router.get("/", authMiddleware(...perfil), wrap(async (req, res) => {
  const query = parseQuery(
    z.object({ equipamentoId: z.coerce.number().int().optional(), status: z.nativeEnum(StatusManutencao).optional() }),
    req.query,
  );
  res.json(await manutencaoService.listar(query));
}));

router.post("/", authMiddleware(...perfilTecnico), wrap(async (req, res) => {
  const body = parseBody(manutencaoBody, req.body);
  res.status(201).json(await manutencaoService.criar(body, toCtx(req.user!)));
}));

router.get("/:id", authMiddleware(...perfil), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  res.json(await manutencaoService.detalhar(id));
}));

router.put("/:id", authMiddleware(...perfilTecnico), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  const body = parseBody(manutencaoUpdate, req.body);
  res.json(await manutencaoService.atualizar(id, body));
}));

router.delete("/:id", authMiddleware(...perfilTecnico), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  res.json(await manutencaoService.excluir(id));
}));

export default router;