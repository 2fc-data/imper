import { Router } from "express";
import { z } from "zod";
import { StatusOrcamento, TipoItemServico, UnidadeMedida } from "@prisma/client";
import { parseBody, parseParams, parseQuery } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { toCtx } from "../lib/ctx";
import { orcamentoService } from "../services/orcamento.service";

const router = Router();
const perfil = ["ADMIN", "SUPERVISOR", "ATENDENTE", "TECNICO", "CONTABILIDADE"] as const;

const schemaItem = z.object({
  servicoItemId: z.number().int().positive().nullish(),
  nome: z.string().min(2),
  tipo: z.nativeEnum(TipoItemServico),
  quantidade: z.number().positive(),
  unidade: z.nativeEnum(UnidadeMedida),
  valorUnitario: z.number().nonnegative(),
});

router.get("/", authMiddleware(...perfil), wrap(async (req, res) => {
  const query = parseQuery(
    z.object({ status: z.nativeEnum(StatusOrcamento).optional(), q: z.string().optional() }),
    req.query,
  );
  res.json(await orcamentoService.listar(query));
}));

router.post("/", authMiddleware("ADMIN", "SUPERVISOR", "TECNICO"), wrap(async (req, res) => {
  const body = parseBody(
    z.object({ visitaId: z.number().int().positive(), observacoes: z.string().optional(), itens: z.array(schemaItem).min(1) }),
    req.body,
  );
  res.status(201).json(await orcamentoService.criar(body, toCtx(req.user!)));
}));

router.get("/:id", authMiddleware(...perfil), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await orcamentoService.detalhar(id));
}));

router.post("/:id/enviar", authMiddleware("ADMIN", "SUPERVISOR", "ATENDENTE"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await orcamentoService.enviar(id, toCtx(req.user!)));
}));

router.get("/publico/:token", wrap(async (req, res) => {
  const { token } = parseParams(z.object({ token: z.string().min(10) }), req.params);
  res.json(await orcamentoService.detalharPorToken(token));
}));

router.post("/publico/:token/confirmar", wrap(async (req, res) => {
  const { token } = parseParams(z.object({ token: z.string().min(10) }), req.params);
  res.json(await orcamentoService.confirmarPorToken(token));
}));

router.post("/publico/:token/recusar", wrap(async (req, res) => {
  const { token } = parseParams(z.object({ token: z.string().min(10) }), req.params);
  res.json(await orcamentoService.recusarPorToken(token));
}));

export default router;
