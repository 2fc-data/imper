import { Router } from "express";
import { z } from "zod";
import { StatusAgendamento, TipoAgendamento } from "@prisma/client";
import { parseBody, parseParams, parseQuery } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { agendamentoService } from "../services/agendamento.service";

const router = Router();
const perfilCrm = ["ADMIN", "SUPERVISOR", "ATENDENTE", "TECNICO"] as const;
const perfilGerir = ["ADMIN", "SUPERVISOR", "ATENDENTE"] as const;

const filtroQuery = z.object({
  status: z.nativeEnum(StatusAgendamento).optional(),
  tipo: z.nativeEnum(TipoAgendamento).optional(),
  clienteId: z.coerce.number().int().optional(),
  userId: z.coerce.number().int().optional(),
  dataDe: z.string().optional(),
  dataAte: z.string().optional(),
});

router.get("/", authMiddleware(...perfilCrm), wrap(async (req, res) => {
  const query = parseQuery(filtroQuery, req.query);
  res.json(await agendamentoService.listar(query));
}));

router.post("/", authMiddleware(...perfilGerir), wrap(async (req, res) => {
  const body = parseBody(
    z.object({
      clienteId: z.number().int().positive(),
      atendimentoId: z.number().int().positive().nullish(),
      enderecoId: z.number().int().positive().nullish(),
      userId: z.number().int().positive().nullish(),
      tipo: z.nativeEnum(TipoAgendamento).optional(),
      status: z.nativeEnum(StatusAgendamento).optional(),
      dataPrevista: z.coerce.date(),
      dataRealizada: z.coerce.date().nullish(),
      observacoes: z.string().trim().max(1000).optional(),
    }),
    req.body,
  );
  res.status(201).json(
    await agendamentoService.criar({
      ...body,
      atendimentoId: body.atendimentoId ?? null,
      enderecoId: body.enderecoId ?? null,
      userId: body.userId ?? null,
      dataRealizada: body.dataRealizada ?? null,
    }, req.user!.id),
  );
}));

router.get("/:id", authMiddleware(...perfilCrm), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await agendamentoService.detalhar(id));
}));

router.patch("/:id", authMiddleware(...perfilGerir), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  const body = parseBody(
    z.object({
      atendimentoId: z.number().int().positive().nullish(),
      enderecoId: z.number().int().positive().nullish(),
      userId: z.number().int().positive().nullish(),
      tipo: z.nativeEnum(TipoAgendamento).optional(),
      status: z.nativeEnum(StatusAgendamento).optional(),
      dataPrevista: z.coerce.date().optional(),
      dataRealizada: z.coerce.date().nullish(),
      observacoes: z.string().trim().max(1000).optional(),
    }),
    req.body,
  );
  res.json(
    await agendamentoService.atualizar(id, {
      ...body,
      atendimentoId: body.atendimentoId ?? null,
      enderecoId: body.enderecoId ?? null,
      userId: body.userId ?? null,
      dataRealizada: body.dataRealizada ?? null,
    }),
  );
}));

router.patch("/:id/status", authMiddleware(...perfilGerir, "TECNICO"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  const body = parseBody(
    z.object({
      status: z.nativeEnum(StatusAgendamento),
      dataRealizada: z.coerce.date().nullish(),
    }),
    req.body,
  );
  res.json(await agendamentoService.atualizarStatus(id, body.status, body.dataRealizada ?? null, req.user!.id));
}));

router.delete("/:id", authMiddleware("ADMIN", "SUPERVISOR"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await agendamentoService.remover(id));
}));

export default router;