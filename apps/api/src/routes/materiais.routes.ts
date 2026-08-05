import { Router } from "express";
import { z } from "zod";
import { TipoMaterial, UnidadeMedida } from "@prisma/client";
import { parseBody, parseParams, parseQuery } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { toCtx } from "../lib/ctx";
import { materialService } from "../services/material.service";

const router = Router();
const perfil = ["ADMIN", "SUPERVISOR", "ATENDENTE", "TECNICO", "ALMOXARIFE"] as const;

router.get("/", authMiddleware(...perfil), wrap(async (req, res) => {
  const query = parseQuery(
    z.object({ q: z.string().optional(), tipo: z.string().optional() }),
    req.query,
  );
  res.json(await materialService.listar(query));
}));

router.post("/", authMiddleware("ADMIN", "ALMOXARIFE"), wrap(async (req, res) => {
  const body = parseBody(
    z.object({
      nome: z.string().min(2),
      tipo: z.nativeEnum(TipoMaterial),
      unidade: z.nativeEnum(UnidadeMedida),
      quantidadeMinima: z.number().nonnegative().optional(),
      custoUnitario: z.number().nonnegative().optional(),
    }),
    req.body,
  );
  res.status(201).json(await materialService.criar(body));
}));

router.get("/:id", authMiddleware(...perfil), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await materialService.detalhar(id));
}));

router.put("/:id", authMiddleware("ADMIN", "ALMOXARIFE"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  const body = parseBody(
    z.object({
      nome: z.string().min(2).optional(),
      tipo: z.nativeEnum(TipoMaterial).optional(),
      unidade: z.nativeEnum(UnidadeMedida).optional(),
      quantidadeMinima: z.number().nonnegative().optional(),
      custoUnitario: z.number().nonnegative().optional(),
      status: z.enum(["ATIVO", "INATIVO"]).optional(),
    }),
    req.body,
  );
  res.json(await materialService.atualizar(id, body));
}));

router.post("/:id/entrada", authMiddleware("ADMIN", "ALMOXARIFE"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  const body = parseBody(z.object({ quantidade: z.number().positive(), observacao: z.string().optional() }), req.body);
  res.json(await materialService.entrada({ materialId: id, ...body }, toCtx(req.user!)));
}));

router.post("/:id/saida", authMiddleware("ADMIN", "ALMOXARIFE"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  const body = parseBody(z.object({ quantidade: z.number().positive(), observacao: z.string().optional() }), req.body);
  res.json(await materialService.saida({ materialId: id, ...body }, toCtx(req.user!)));
}));

export default router;
