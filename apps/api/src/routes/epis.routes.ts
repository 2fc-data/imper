import { Router } from "express";
import { z } from "zod";
import { parseBody, parseParams, parseQuery } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { toCtx } from "../lib/ctx";
import { epiService } from "../services/epi.service";

const router = Router();
const perfil = ["ADMIN", "SUPERVISOR", "ATENDENTE", "TECNICO", "ALMOXARIFE"] as const;
const perfilGestao = ["ADMIN", "SUPERVISOR", "ALMOXARIFE"] as const;
const perfilEntrega = ["ADMIN", "SUPERVISOR", "ALMOXARIFE", "TECNICO"] as const;

const idSchema = z.object({ id: z.coerce.number().int() });
const epiBody = z.object({
  codigo: z.string().min(2),
  nome: z.string().min(2),
  numeroCa: z.string().optional(),
  dataValidade: z.string().datetime().optional(),
  quantidade: z.number().nonnegative().optional(),
  quantidadeMinima: z.number().nonnegative().optional(),
  marcaId: z.number().int().optional(),
  categoriaId: z.number().int().optional(),
  subcategoriaId: z.number().int().optional(),
  localizacaoId: z.number().int().optional(),
  fornecedorId: z.number().int().optional(),
});
const epiUpdate = epiBody.partial().extend({
  dataValidade: z.string().datetime().nullable().optional(),
  quantidadeMinima: z.number().nonnegative().nullable().optional(),
  ativo: z.boolean().optional(),
});

router.get("/", authMiddleware(...perfil), wrap(async (req, res) => {
  const query = parseQuery(z.object({ q: z.string().optional(), ativo: z.coerce.boolean().optional() }), req.query);
  res.json(await epiService.listar(query));
}));

router.post("/", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const body = parseBody(epiBody, req.body);
  res.status(201).json(await epiService.criar(body));
}));

router.get("/:id", authMiddleware(...perfil), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  res.json(await epiService.detalhar(id));
}));

router.put("/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  const body = parseBody(epiUpdate, req.body);
  res.json(await epiService.atualizar(id, body));
}));

router.delete("/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  res.json(await epiService.desativar(id));
}));

router.post("/:id/entrega", authMiddleware(...perfilEntrega), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  const body = parseBody(
    z.object({ colaboradorId: z.number().int(), quantidade: z.number().positive(), observacao: z.string().optional() }),
    req.body,
  );
  res.status(201).json(await epiService.entrega({ epiId: id, ...body }, toCtx(req.user!)));
}));

export default router;