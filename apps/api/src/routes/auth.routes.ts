import { Router } from "express";
import { z } from "zod";
import { parseBody } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { verificarTurnstile } from "../lib/turnstile";
import * as authService from "../services/auth.service";

const router = Router();

router.post("/login", wrap(async (req, res) => {
  const body = parseBody(
    z.object({ email: z.string().email(), senha: z.string().min(6) }),
    req.body,
  );
  const result = await authService.login(body.email, body.senha);
  res.json(result);
}));

router.post("/cadastro", wrap(async (req, res) => {
  const body = parseBody(
    z.object({
      nome: z.string().min(2),
      email: z.string().email(),
      telefone: z.string().max(20).optional(),
      senha: z.string().min(6),
      turnstileToken: z.string().optional(),
    }),
    req.body,
  );
  await verificarTurnstile(body.turnstileToken ?? "", req.ip);
  const result = await authService.cadastrar(body);
  res.status(201).json(result);
}));

router.post("/recuperar-senha", wrap(async (req, res) => {
  const body = parseBody(z.object({ email: z.string().email() }), req.body);
  res.json(await authService.recuperarSenha(body.email));
}));

router.post("/redefinir-senha", wrap(async (req, res) => {
  const body = parseBody(
    z.object({ token: z.string().min(10), novaSenha: z.string().min(6) }),
    req.body,
  );
  res.json(await authService.redefinirSenha(body.token, body.novaSenha));
}));

router.post("/alterar-senha", authMiddleware(), wrap(async (req, res) => {
  const body = parseBody(
    z.object({ senhaAtual: z.string().min(1), novaSenha: z.string().min(6) }),
    req.body,
  );
  await authService.alterarSenha(req.user!.id, body.senhaAtual, body.novaSenha);
  res.json({ ok: true });
}));

router.get("/me", authMiddleware(), wrap(async (req, res) => {
  res.json(req.user);
}));

export default router;
