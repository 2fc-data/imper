import { Router } from "express";
import { z } from "zod";
import { CanalContato, StatusContato, TipoContato, Urgencia } from "@prisma/client";
import { parseBody, parseParams, parseQuery } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { contatoService } from "../services/contato.service";

const router = Router();
const perfilContato = ["ADMIN", "SUPERVISOR", "ATENDENTE", "TECNICO"] as const;

router.get("/", authMiddleware(...perfilContato), wrap(async (req, res) => {
  const query = parseQuery(
    z.object({ status: z.nativeEnum(StatusContato).optional(), q: z.string().optional() }),
    req.query,
  );
  res.json(await contatoService.listar(query));
}));

router.post("/", authMiddleware("ADMIN", "SUPERVISOR", "ATENDENTE"), wrap(async (req, res) => {
  const body = parseBody(
    z.object({
      clienteId: z.number().int().positive().nullish(),
      nome: z.string().min(2),
      telefone: z.string().min(8),
      canal: z.nativeEnum(CanalContato),
      tipo: z.nativeEnum(TipoContato),
      urgencia: z.nativeEnum(Urgencia).optional(),
      assunto: z.string().min(3),
      descricao: z.string().optional(),
      endereco: z.string().optional(),
    }),
    req.body,
  );
  const contato = await contatoService.criar({ ...body, clienteId: body.clienteId ?? null }, req.user!.id);
  res.status(201).json(contato);
}));

router.get("/:id", authMiddleware(...perfilContato), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await contatoService.detalhar(id));
}));

router.patch("/:id/status", authMiddleware("ADMIN", "SUPERVISOR", "ATENDENTE"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  const body = parseBody(z.object({ status: z.nativeEnum(StatusContato) }), req.body);
  res.json(await contatoService.atualizarStatus(id, body.status));
}));

export default router;
