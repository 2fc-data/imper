import { Router } from "express";
import { z } from "zod";
import { StatusVisita, Urgencia } from "@prisma/client";
import { parseBody, parseParams, parseQuery } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { visitaService } from "../services/visita.service";

const router = Router();
const perfil = ["ADMIN", "SUPERVISOR", "ATENDENTE", "TECNICO"] as const;

router.get("/", authMiddleware(...perfil), wrap(async (req, res) => {
  const query = parseQuery(
    z.object({ status: z.nativeEnum(StatusVisita).optional() }),
    req.query,
  );
  res.json(await visitaService.listar(query));
}));

router.post("/", authMiddleware("ADMIN", "SUPERVISOR", "ATENDENTE"), wrap(async (req, res) => {
  const body = parseBody(
    z.object({
      atendimentoId: z.number().int().positive(),
      tecnicoId: z.number().int().positive(),
      dataPrevista: z.string().optional(),
      urgencia: z.nativeEnum(Urgencia).optional(),
      enderecoId: z.number().int().positive().optional(),
    }),
    req.body,
  );
  res.status(201).json(await visitaService.agendar(body));
}));

router.post("/:id/realizar", authMiddleware("ADMIN", "SUPERVISOR", "TECNICO"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  const body = parseBody(
    z.object({
      relatorio: z.string().optional(),
      urgencia: z.nativeEnum(Urgencia).optional(),
    }),
    req.body,
  );
  res.json(await visitaService.realizar(id, body, req.user!.id));
}));

router.post("/:id/cancelar", authMiddleware("ADMIN", "SUPERVISOR"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await visitaService.cancelar(id));
}));

export default router;
