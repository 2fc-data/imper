import { Router } from "express";
import { z } from "zod";
import { StatusFaseOS, StatusOS } from "@prisma/client";
import { parseBody, parseParams, parseQuery } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { toCtx } from "../lib/ctx";
import { osService } from "../services/os.service";

const router = Router();
const perfil = ["ADMIN", "SUPERVISOR", "ATENDENTE", "TECNICO", "ALMOXARIFE", "CONTABILIDADE"] as const;

router.get("/", authMiddleware(...perfil), wrap(async (req, res) => {
  const query = parseQuery(
    z.object({ status: z.nativeEnum(StatusOS).optional(), tecnicoId: z.coerce.number().optional(), q: z.string().optional() }),
    req.query,
  );
  res.json(await osService.listar(query));
}));

router.get("/:id", authMiddleware(...perfil), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await osService.detalhar(id));
}));

router.post("/:id/aprovar", authMiddleware("ADMIN"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await osService.aprovar(id, toCtx(req.user!)));
}));

router.post("/:id/iniciar", authMiddleware("ADMIN", "SUPERVISOR", "TECNICO"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await osService.iniciar(id, toCtx(req.user!)));
}));

router.post("/:id/concluir", authMiddleware("ADMIN", "SUPERVISOR", "TECNICO"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await osService.concluir(id, toCtx(req.user!)));
}));

router.post("/:id/confirmar-obra", authMiddleware("ADMIN", "SUPERVISOR", "ATENDENTE"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await osService.confirmarObra(id, toCtx(req.user!)));
}));

router.post("/:id/entregar", authMiddleware("ADMIN", "SUPERVISOR", "ATENDENTE"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await osService.entregar(id, toCtx(req.user!)));
}));

router.post("/:id/cancelar", authMiddleware("ADMIN", "SUPERVISOR"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  const body = parseBody(z.object({ motivo: z.string().optional() }), req.body ?? {});
  res.json(await osService.cancelar(id, body.motivo));
}));

router.patch("/fases/:faseOsId", authMiddleware("ADMIN", "SUPERVISOR", "TECNICO"), wrap(async (req, res) => {
  const { faseOsId } = parseParams(z.object({ faseOsId: z.coerce.number().int() }), req.params);
  const body = parseBody(z.object({ status: z.nativeEnum(StatusFaseOS) }), req.body);
  res.json(await osService.atualizarFase(faseOsId, body.status, toCtx(req.user!)));
}));

export default router;
