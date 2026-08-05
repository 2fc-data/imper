import { Router } from "express";
import { z } from "zod";
import { parseBody } from "../lib/validators";
import { wrap } from "../lib/errors";
import { verificarTurnstile } from "../lib/turnstile";
import { servicoMarketingService } from "../services/servicoMarketing.service";
import { cidadeAtendidaService } from "../services/cidadeAtendida.service";
import { contatoService } from "../services/contato.service";

const router = Router();

const OrcamentoSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  telefone: z.string().trim().min(8).max(20),
  email: z.string().trim().email().max(120).optional(),
  servico: z.string().trim().min(2).max(150),
  mensagem: z.string().trim().max(700).optional().default(""),
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

  const descricao = ["Serviço:", body.servico, "", body.mensagem]
    .filter(Boolean)
    .join("\n");

  const contato = await contatoService.criarPublico({
    nome: body.nome,
    telefone: body.telefone,
    email: body.email,
    descricao,
    cep: body.cep,
    endereco: body.endereco,
    bairro: body.bairro,
    cidade: body.cidade,
    estado: body.estado,
    numero: body.numero,
    complemento: body.complemento,
  });

  res.status(201).json({
    id: contato.id,
    nome: contato.nome,
    canal: contato.canal,
    tipo: contato.tipo,
    status: contato.status,
    createdAt: contato.createdAt,
  });
}));

export default router;
