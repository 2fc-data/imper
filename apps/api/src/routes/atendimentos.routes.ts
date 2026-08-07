import { Router } from "express";
import { z } from "zod";
import { CanalAtendimento, MotivoAtendimento, StatusAtendimento, Urgencia } from "@prisma/client";
import { parseBody, parseParams, parseQuery } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { atendimentoService } from "../services/atendimento.service";

const router = Router();
const perfilAtendimento = ["ADMIN", "SUPERVISOR", "ATENDENTE", "TECNICO"] as const;

const enderecoSchema = z
  .object({
    logradouro: z.string().trim().max(255).optional(),
    numero: z.string().trim().max(10).optional(),
    complemento: z.string().trim().max(120).optional(),
    bairro: z.string().trim().max(120).optional(),
    cidade: z.string().trim().max(120).optional(),
    estado: z.string().trim().max(2).optional(),
    cep: z.string().trim().regex(/^\d{5}-\d{3}$/).max(9).optional(),
  });

router.get("/", authMiddleware(...perfilAtendimento), wrap(async (req, res) => {
  const query = parseQuery(
    z.object({
      status: z.nativeEnum(StatusAtendimento).optional(),
      q: z.string().optional(),
      criadoDe: z.string().optional(),
      criadoAte: z.string().optional(),
      atualizadoDe: z.string().optional(),
      atualizadoAte: z.string().optional(),
    }),
    req.query,
  );
  res.json(await atendimentoService.listar(query));
}));

router.post("/", authMiddleware("ADMIN", "SUPERVISOR", "ATENDENTE"), wrap(async (req, res) => {
  const body = parseBody(
    z
      .object({
        clienteId: z.number().int().positive().nullish(),
        nome: z.string().trim().min(2).max(120).optional(),
        telefone: z.string().trim().min(8).max(20).optional(),
        email: z.string().trim().email().max(120).optional(),
        canal: z.nativeEnum(CanalAtendimento),
        motivo: z.nativeEnum(MotivoAtendimento),
        urgencia: z.nativeEnum(Urgencia).optional(),
        descricao: z.string().trim().max(1000).optional(),
        enderecoNovo: enderecoSchema.optional(),
      })
      .superRefine((val, ctx) => {
        if (!val.clienteId && !val.nome) {
          ctx.addIssue({ code: "custom", message: "Informe o cliente existente (clienteId) ou o nome do novo cliente." });
        }
      }),
    req.body,
  );
  res.status(201).json(
    await atendimentoService.criar({
      ...body,
      clienteId: body.clienteId ?? null,
      atendenteId: req.user!.id,
    }),
  );
}));

router.get("/:id", authMiddleware(...perfilAtendimento), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await atendimentoService.detalhar(id));
}));

router.patch("/:id/status", authMiddleware("ADMIN", "SUPERVISOR", "ATENDENTE"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  const body = parseBody(z.object({ status: z.nativeEnum(StatusAtendimento) }), req.body);
  res.json(await atendimentoService.atualizarStatus(id, body.status, req.user!.id));
}));

router.get("/:id/atendimentos", authMiddleware(...perfilAtendimento), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  res.json(await atendimentoService.listarLogs(id));
}));

router.post("/:id/atendimentos", authMiddleware("ADMIN", "SUPERVISOR", "ATENDENTE"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  const body = parseBody(z.object({ descricao: z.string().min(1).max(1000) }), req.body);
  res.status(201).json(await atendimentoService.registrarAtendimento(id, body.descricao, req.user!.id));
}));

export default router;