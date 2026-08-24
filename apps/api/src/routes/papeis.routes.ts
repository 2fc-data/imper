import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../lib/auth";
import { parseBody } from "../lib/validators";
import { rbacService } from "../services/rbac.service";

const router = Router();

const papelSchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional(),
});

const permissoesSchema = z.object({
  permissoesIds: z.array(z.number().int()),
});

router.get(
  "/papeis",
  authMiddleware("gerenciar_papeis"),
  async (_req, res) => {
    const papeis = await rbacService.listarPapeis();
    res.json({ papeis });
  }
);

router.post(
  "/papeis",
  authMiddleware("gerenciar_papeis"),
  async (req, res) => {
    const body = parseBody(papelSchema, req.body);
    const papel = await rbacService.criarPapel(body);
    res.status(201).json({ papel });
  }
);

router.patch(
  "/papeis/:id",
  authMiddleware("gerenciar_papeis"),
  async (req, res) => {
    const id = Number(req.params.id);
    const body = parseBody(papelSchema.partial(), req.body);
    const papel = await rbacService.atualizarPapel(id, body);
    res.json({ papel });
  }
);

router.delete(
  "/papeis/:id",
  authMiddleware("gerenciar_papeis"),
  async (req, res) => {
    const id = Number(req.params.id);
    await rbacService.excluirPapel(id);
    res.status(204).send();
  }
);

router.get(
  "/papeis/:id/permissoes",
  authMiddleware("gerenciar_papeis"),
  async (req, res) => {
    const id = Number(req.params.id);
    const permissoesIds = await rbacService.listarPermissoesPorPapel(id);
    res.json({ permissoesIds });
  }
);

router.put(
  "/papeis/:id/permissoes",
  authMiddleware("gerenciar_papeis"),
  async (req, res) => {
    const id = Number(req.params.id);
    const body = parseBody(permissoesSchema, req.body);
    await rbacService.definirPermissoes(id, body.permissoesIds);
    res.json({ ok: true });
  }
);

router.get("/permissoes", authMiddleware("gerenciar_papeis"), async (_req, res) => {
  const permissoes = await rbacService.listarPermissoes();
  res.json({ permissoes });
});

export default router;
