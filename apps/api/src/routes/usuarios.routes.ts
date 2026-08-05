import { Router } from "express";
import { z } from "zod";
import { Papel } from "@prisma/client";
import { parseBody, parseParams } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { toCtx } from "../lib/ctx";
import { usuariosService } from "../services/usuario.service";

const router = Router();

router.get("/", authMiddleware("ADMIN", "SUPERVISOR", "ATENDENTE"), wrap(async (_req, res) => {
  res.json(await usuariosService.listar());
}));

router.post("/", authMiddleware("ADMIN"), wrap(async (req, res) => {
  const body = parseBody(
    z.object({
      nome: z.string().min(2),
      email: z.string().email(),
      senha: z.string().min(6),
      telefone: z.string().optional(),
      papel: z.nativeEnum(Papel),
      cargoId: z.number().int().positive().nullish(),
    }),
    req.body,
  );
  const user = await usuariosService.criar(toCtx(req.user!), body);
  res.status(201).json(user);
}));

router.put("/:id", authMiddleware("ADMIN"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  const body = parseBody(
    z.object({
      nome: z.string().min(2).optional(),
      telefone: z.string().optional(),
      papel: z.nativeEnum(Papel).optional(),
      cargoId: z.number().int().positive().nullish(),
      ativo: z.boolean().optional(),
    }),
    req.body,
  );
  res.json(await usuariosService.atualizar(id, body));
}));

router.post("/:id/resetar-senha", authMiddleware("ADMIN"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  const body = parseBody(z.object({ novaSenha: z.string().min(6) }), req.body);
  res.json(await usuariosService.resetarSenha(id, body.novaSenha));
}));

router.patch("/:id/perfil", authMiddleware("ADMIN", "SUPERVISOR", "ATENDENTE"), wrap(async (req, res) => {
  const { id } = parseParams(z.object({ id: z.coerce.number().int() }), req.params);
  const body = parseBody(
    z.object({
      papel: z.nativeEnum(Papel).refine((p) => p !== Papel.ADMIN, {
        message: "Não é permitido atribuir o perfil ADMIN",
      }),
    }),
    req.body,
  );
  res.json(await usuariosService.atualizar(id, { papel: body.papel }));
}));

export default router;
