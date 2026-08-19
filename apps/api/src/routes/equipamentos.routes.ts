import { Router } from "express";
import { z } from "zod";
import { parseBody, parseParams, parseQuery } from "../lib/validators";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { toCtx } from "../lib/ctx";
import { equipamentoService } from "../services/equipamento.service";

const router = Router();
const perfil = ["ADMIN", "SUPERVISOR", "ATENDENTE", "TECNICO", "ALMOXARIFE"] as const;
const perfilGestao = ["ADMIN", "SUPERVISOR", "ALMOXARIFE"] as const;
const perfilTecnico = ["ADMIN", "SUPERVISOR", "TECNICO"] as const;

const idSchema = z.object({ id: z.coerce.number().int() });
const lookupBody = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional(),
  ordem: z.number().int().optional(),
});
const lookupUpdate = lookupBody.partial().extend({ ativo: z.boolean().optional() });

// ===== LOOKUPS (GET global + CRUD por entidade) =====
router.get("/lookups", authMiddleware(...perfil), wrap(async (_req, res) => {
  res.json(await equipamentoService.listarLookups());
}));

router.get("/lookups/categorias", authMiddleware(...perfil), wrap(async (_req, res) => {
  res.json((await equipamentoService.listarLookups()).categorias);
}));
router.post("/lookups/categorias", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const body = parseBody(lookupBody, req.body);
  res.status(201).json(await equipamentoService.categoria.criar(body));
}));
router.put("/lookups/categorias/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  const body = parseBody(lookupUpdate, req.body);
  res.json(await equipamentoService.categoria.atualizar(id, body));
}));
router.delete("/lookups/categorias/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  res.json(await equipamentoService.categoria.desativar(id));
}));

router.get("/lookups/subcategorias", authMiddleware(...perfil), wrap(async (_req, res) => {
  res.json((await equipamentoService.listarLookups()).subcategorias);
}));
router.post("/lookups/subcategorias", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const body = parseBody(
    lookupBody.extend({ categoriaId: z.number().int() }),
    req.body,
  );
  res.status(201).json(await equipamentoService.subcategoria.criar(body));
}));
router.put("/lookups/subcategorias/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  const body = parseBody(lookupUpdate.extend({ categoriaId: z.number().int().optional() }), req.body);
  res.json(await equipamentoService.subcategoria.atualizar(id, body));
}));
router.delete("/lookups/subcategorias/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  res.json(await equipamentoService.subcategoria.desativar(id));
}));

router.get("/lookups/marcas", authMiddleware(...perfil), wrap(async (_req, res) => {
  res.json((await equipamentoService.listarLookups()).marcas);
}));
router.post("/lookups/marcas", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const body = parseBody(lookupBody, req.body);
  res.status(201).json(await equipamentoService.marca.criar(body));
}));
router.put("/lookups/marcas/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  const body = parseBody(lookupUpdate, req.body);
  res.json(await equipamentoService.marca.atualizar(id, body));
}));
router.delete("/lookups/marcas/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  res.json(await equipamentoService.marca.desativar(id));
}));

router.get("/lookups/fornecedores", authMiddleware(...perfil), wrap(async (_req, res) => {
  res.json((await equipamentoService.listarLookups()).fornecedores);
}));
router.post("/lookups/fornecedores", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const body = parseBody(
    z.object({ nome: z.string().min(2), cnpj: z.string().optional(), telefone: z.string().optional(), email: z.string().email().optional() }),
    req.body,
  );
  res.status(201).json(await equipamentoService.fornecedor.criar(body));
}));
router.put("/lookups/fornecedores/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  const body = parseBody(
    z.object({ nome: z.string().min(2).optional(), cnpj: z.string().optional(), telefone: z.string().optional(), email: z.string().email().optional(), ativo: z.boolean().optional() }),
    req.body,
  );
  res.json(await equipamentoService.fornecedor.atualizar(id, body));
}));
router.delete("/lookups/fornecedores/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  res.json(await equipamentoService.fornecedor.desativar(id));
}));

router.get("/lookups/localizacoes", authMiddleware(...perfil), wrap(async (_req, res) => {
  res.json((await equipamentoService.listarLookups()).localizacoes);
}));
router.post("/lookups/localizacoes", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const body = parseBody(lookupBody, req.body);
  res.status(201).json(await equipamentoService.localizacao.criar(body));
}));
router.put("/lookups/localizacoes/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  const body = parseBody(lookupUpdate, req.body);
  res.json(await equipamentoService.localizacao.atualizar(id, body));
}));
router.delete("/lookups/localizacoes/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  res.json(await equipamentoService.localizacao.desativar(id));
}));

router.get("/lookups/status", authMiddleware(...perfil), wrap(async (_req, res) => {
  res.json((await equipamentoService.listarLookups()).statuses);
}));
router.post("/lookups/status", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const body = parseBody(lookupBody, req.body);
  res.status(201).json(await equipamentoService.status.criar(body));
}));
router.put("/lookups/status/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  const body = parseBody(lookupUpdate, req.body);
  res.json(await equipamentoService.status.atualizar(id, body));
}));
router.delete("/lookups/status/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  res.json(await equipamentoService.status.desativar(id));
}));

router.get("/lookups/estados-conservacao", authMiddleware(...perfil), wrap(async (_req, res) => {
  res.json((await equipamentoService.listarLookups()).estadosConservacao);
}));
router.post("/lookups/estados-conservacao", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const body = parseBody(lookupBody, req.body);
  res.status(201).json(await equipamentoService.estadoConservacao.criar(body));
}));
router.put("/lookups/estados-conservacao/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  const body = parseBody(lookupUpdate, req.body);
  res.json(await equipamentoService.estadoConservacao.atualizar(id, body));
}));
router.delete("/lookups/estados-conservacao/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  res.json(await equipamentoService.estadoConservacao.desativar(id));
}));

router.get("/lookups/tipos-manutencao", authMiddleware(...perfil), wrap(async (_req, res) => {
  res.json((await equipamentoService.listarLookups()).tiposManutencao);
}));
router.post("/lookups/tipos-manutencao", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const body = parseBody(lookupBody, req.body);
  res.status(201).json(await equipamentoService.tipoManutencao.criar(body));
}));
router.put("/lookups/tipos-manutencao/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  const body = parseBody(lookupUpdate, req.body);
  res.json(await equipamentoService.tipoManutencao.atualizar(id, body));
}));
router.delete("/lookups/tipos-manutencao/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  res.json(await equipamentoService.tipoManutencao.desativar(id));
}));

// ===== EQUIPAMENTOS =====
const equipamentoBody = z.object({
  codigo: z.string().min(2),
  numeroPatrimonio: z.string().optional(),
  descricao: z.string().min(3),
  modelo: z.string().optional(),
  numeroSerie: z.string().optional(),
  marcaId: z.number().int().optional(),
  categoriaId: z.number().int().optional(),
  subcategoriaId: z.number().int().optional(),
  localizacaoId: z.number().int().optional(),
  fornecedorId: z.number().int().optional(),
  statusId: z.number().int(),
  estadoConservacaoId: z.number().int().optional(),
  dataAquisicao: z.string().datetime().optional(),
  valorAquisicao: z.number().nonnegative().optional(),
  dataGarantia: z.string().datetime().optional(),
  observacoes: z.string().optional(),
});

router.get("/", authMiddleware(...perfil), wrap(async (req, res) => {
  const query = parseQuery(
    z.object({ q: z.string().optional(), statusId: z.coerce.number().int().optional(), categoriaId: z.coerce.number().int().optional(), ativo: z.coerce.boolean().optional() }),
    req.query,
  );
  res.json(await equipamentoService.listar(query));
}));

router.post("/", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const body = parseBody(equipamentoBody, req.body);
  res.status(201).json(await equipamentoService.criar(body));
}));

router.get("/:id", authMiddleware(...perfil), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  res.json(await equipamentoService.detalhar(id));
}));

router.put("/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  const body = parseBody(equipamentoBody.partial(), req.body);
  res.json(await equipamentoService.atualizar(id, body));
}));

router.delete("/:id", authMiddleware(...perfilGestao), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  res.json(await equipamentoService.desativar(id));
}));

router.post("/:id/retirada", authMiddleware(...perfilTecnico), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  const body = parseBody(
    z.object({ colaboradorId: z.number().int(), observacao: z.string().optional() }),
    req.body,
  );
  res.status(201).json(await equipamentoService.retirada(id, body, toCtx(req.user!)));
}));

router.post("/:id/devolucao", authMiddleware(...perfilTecnico), wrap(async (req, res) => {
  const { id } = parseParams(idSchema, req.params);
  res.json(await equipamentoService.devolucao(id, toCtx(req.user!)));
}));

export default router;