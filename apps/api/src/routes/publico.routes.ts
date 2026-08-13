import { Router } from "express";
import { z } from "zod";
import { MotivoAtendimento } from "@prisma/client";
import { parseBody } from "../lib/validators";
import { wrap } from "../lib/errors";
import { verificarTurnstile } from "../lib/turnstile";
import { servicoMarketingService } from "../services/servicoMarketing.service";
import { cidadeAtendidaService } from "../services/cidadeAtendida.service";
import { atendimentoService } from "../services/atendimento.service";

const router = Router();

const OrcamentoSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  telefone: z.string().trim().min(8).max(20),
  email: z.string().trim().email().max(120).optional(),
  motivo: z.nativeEnum(MotivoAtendimento).default(MotivoAtendimento.ORCAMENTOS),
  mensagem: z.string().trim().max(700).optional().default(""),
  servico: z.string().trim().max(200).optional(),
  cep: z.string().trim().regex(/^\d{5}-\d{3}$/).max(9).optional(),
  endereco: z.string().trim().max(255).optional(),
  bairro: z.string().trim().max(120).optional(),
  cidade: z.string().trim().max(120).optional(),
  estado: z.string().trim().max(2).optional(),
  numero: z.string().trim().max(10).optional(),
  complemento: z.string().trim().max(120).optional(),
  turnstileToken: z.string().optional(),
});

router.get("/servicos", wrap(async (_req, res) => {
  res.json(await servicoMarketingService.listarAtivos());
}));

router.get("/cidades", wrap(async (_req, res) => {
  res.json(await cidadeAtendidaService.listarAtivas());
}));

router.post("/orcamento", wrap(async (req, res) => {
  const body = parseBody(OrcamentoSchema, req.body);
  await verificarTurnstile(body.turnstileToken ?? "", req.ip);

  const atendimento = await atendimentoService.criarPublico({
    nome: body.nome,
    telefone: body.telefone,
    email: body.email,
    motivo: body.motivo,
    descricao: body.mensagem,
    servico: body.servico,
    endereco: {
      logradouro: body.endereco,
      numero: body.numero,
      complemento: body.complemento,
      bairro: body.bairro,
      cidade: body.cidade,
      estado: body.estado,
      cep: body.cep,
    },
  });

  res.status(201).json({
    id: atendimento.id,
    nome: atendimento.cliente?.nome,
    canal: atendimento.canal,
    motivo: atendimento.motivo,
    status: atendimento.status,
    createdAt: atendimento.createdAt,
  });
}));

export default router;