import { prisma } from "../db";
import { AppError } from "../lib/errors";
import { Ctx } from "../lib/ctx";

interface LookupDelegate {
  findUnique(args: { where: { id: number } }): Promise<{ id: number } | null>;
  create(args: { data: unknown }): Promise<unknown>;
  update(args: { where: { id: number }; data: unknown }): Promise<unknown>;
  findMany(args: unknown): Promise<unknown>;
}

function crudLookup(delegate: unknown, rotulo: string) {
  const d = delegate as LookupDelegate;
  return {
    async criar(data: { nome: string; descricao?: string; ordem?: number }) {
      return d.create({ data: { nome: data.nome, descricao: data.descricao, ordem: data.ordem } });
    },
    async atualizar(id: number, data: { nome?: string; descricao?: string; ordem?: number; ativo?: boolean }) {
      if (!(await d.findUnique({ where: { id } }))) throw new AppError(404, `${rotulo} não encontrado`);
      return d.update({ where: { id }, data });
    },
    async desativar(id: number) {
      if (!(await d.findUnique({ where: { id } }))) throw new AppError(404, `${rotulo} não encontrado`);
      return d.update({ where: { id }, data: { ativo: false } });
    },
    async reativar(id: number) {
      if (!(await d.findUnique({ where: { id } }))) throw new AppError(404, `${rotulo} não encontrado`);
      return d.update({ where: { id }, data: { ativo: true } });
    },
  };
}

export const equipamentoService = {
  // ===== LOOKUPS =====
  async listarLookups() {
    const [categorias, subcategorias, marcas, fornecedores, localizacoes, statuses, estadosConservacao, tiposManutencao] =
      await Promise.all([
        prisma.categoriaEquipamento.findMany({ orderBy: [{ ativo: "desc" }, { ordem: "asc" }] }),
        prisma.subcategoriaEquipamento.findMany({ orderBy: [{ ativo: "desc" }, { ordem: "asc" }] }),
        prisma.marca.findMany({ orderBy: [{ ativo: "desc" }, { ordem: "asc" }] }),
        prisma.fornecedor.findMany({ orderBy: { nome: "asc" } }),
        prisma.localizacao.findMany({ orderBy: [{ ativo: "desc" }, { ordem: "asc" }] }),
        prisma.statusEquipamento.findMany({ orderBy: [{ ativo: "desc" }, { ordem: "asc" }] }),
        prisma.estadoConservacao.findMany({ orderBy: [{ ativo: "desc" }, { ordem: "asc" }] }),
        prisma.tipoManutencao.findMany({ orderBy: [{ ativo: "desc" }, { ordem: "asc" }] }),
      ]);
    return { categorias, subcategorias, marcas, fornecedores, localizacoes, statuses, estadosConservacao, tiposManutencao };
  },

  // --- Categorias ---
  categoria: {
    async criar(data: { nome: string; descricao?: string; ordem?: number }) {
      return prisma.categoriaEquipamento.create({ data });
    },
    async atualizar(id: number, data: { nome?: string; descricao?: string; ordem?: number; ativo?: boolean }) {
      if (!(await prisma.categoriaEquipamento.findUnique({ where: { id } })))
        throw new AppError(404, "Categoria não encontrada");
      return prisma.categoriaEquipamento.update({ where: { id }, data });
    },
    async desativar(id: number) {
      if (!(await prisma.categoriaEquipamento.findUnique({ where: { id } })))
        throw new AppError(404, "Categoria não encontrada");
      return prisma.categoriaEquipamento.update({ where: { id }, data: { ativo: false } });
    },
    async reativar(id: number) {
      if (!(await prisma.categoriaEquipamento.findUnique({ where: { id } })))
        throw new AppError(404, "Categoria não encontrada");
      return prisma.categoriaEquipamento.update({ where: { id }, data: { ativo: true } });
    },
  },

  subcategoria: {
    async criar(data: { categoriaId: number; nome: string; descricao?: string; ordem?: number }) {
      if (!(await prisma.categoriaEquipamento.findUnique({ where: { id: data.categoriaId } })))
        throw new AppError(404, "Categoria não encontrada");
      return prisma.subcategoriaEquipamento.create({ data });
    },
    async atualizar(id: number, data: { categoriaId?: number; nome?: string; descricao?: string; ordem?: number; ativo?: boolean }) {
      if (!(await prisma.subcategoriaEquipamento.findUnique({ where: { id } })))
        throw new AppError(404, "Subcategoria não encontrada");
      return prisma.subcategoriaEquipamento.update({ where: { id }, data });
    },
    async desativar(id: number) {
      if (!(await prisma.subcategoriaEquipamento.findUnique({ where: { id } })))
        throw new AppError(404, "Subcategoria não encontrada");
      return prisma.subcategoriaEquipamento.update({ where: { id }, data: { ativo: false } });
    },
    async reativar(id: number) {
      if (!(await prisma.subcategoriaEquipamento.findUnique({ where: { id } })))
        throw new AppError(404, "Subcategoria não encontrada");
      return prisma.subcategoriaEquipamento.update({ where: { id }, data: { ativo: true } });
    },
  },

  // --- Lookups simples ---
  marca: crudLookup(prisma.marca, "Marca"),
  localizacao: crudLookup(prisma.localizacao, "Localização"),
  status: crudLookup(prisma.statusEquipamento, "Status"),
  estadoConservacao: crudLookup(prisma.estadoConservacao, "Estado de conservação"),
  tipoManutencao: crudLookup(prisma.tipoManutencao, "Tipo de manutenção"),

  fornecedor: {
    async criar(data: { nome: string; cnpj?: string; telefone?: string; email?: string }) {
      if (data.cnpj && (await prisma.fornecedor.findUnique({ where: { cnpj: data.cnpj } })))
        throw new AppError(400, "CNPJ já cadastrado");
      return prisma.fornecedor.create({ data });
    },
    async atualizar(id: number, data: { nome?: string; cnpj?: string; telefone?: string; email?: string; ativo?: boolean }) {
      if (!(await prisma.fornecedor.findUnique({ where: { id } })))
        throw new AppError(404, "Fornecedor não encontrado");
      if (data.cnpj) {
        const dup = await prisma.fornecedor.findUnique({ where: { cnpj: data.cnpj } });
        if (dup && dup.id !== id) throw new AppError(400, "CNPJ já cadastrado");
      }
      return prisma.fornecedor.update({ where: { id }, data });
    },
    async desativar(id: number) {
      if (!(await prisma.fornecedor.findUnique({ where: { id } })))
        throw new AppError(404, "Fornecedor não encontrado");
      return prisma.fornecedor.update({ where: { id }, data: { ativo: false } });
    },
    async reativar(id: number) {
      if (!(await prisma.fornecedor.findUnique({ where: { id } })))
        throw new AppError(404, "Fornecedor não encontrado");
      return prisma.fornecedor.update({ where: { id }, data: { ativo: true } });
    },
  },

  // ===== EQUIPAMENTOS =====
  async listar(filtro: { q?: string; statusId?: number; categoriaId?: number; ativo?: boolean }) {
    return prisma.equipamento.findMany({
      where: {
        ativo: filtro.ativo,
        statusId: filtro.statusId,
        categoriaId: filtro.categoriaId,
        OR: filtro.q
          ? [
              { codigo: { contains: filtro.q } },
              { descricao: { contains: filtro.q } },
              { numeroPatrimonio: { contains: filtro.q } },
              { numeroSerie: { contains: filtro.q } },
            ]
          : undefined,
      },
      include: {
        marca: true,
        categoria: true,
        subcategoria: true,
        localizacao: true,
        status: true,
        estadoConservacao: true,
        responsavel: { select: { id: true, nome: true } },
        retiradas: {
          where: { dataDevolucao: null },
          include: { colaborador: { select: { id: true, nome: true } } },
          orderBy: { dataRetirada: "desc" },
          take: 1,
        },
      },
      orderBy: [{ ativo: "desc" }, { codigo: "asc" }],
    });
  },

  async detalhar(id: number) {
    const equipamento = await prisma.equipamento.findUnique({
      where: { id },
      include: {
        marca: true,
        categoria: true,
        subcategoria: true,
        localizacao: true,
        status: true,
        estadoConservacao: true,
        responsavel: { select: { id: true, nome: true } },
        retiradas: {
          include: { colaborador: { select: { id: true, nome: true } } },
          orderBy: { dataRetirada: "desc" },
          take: 50,
        },
        manutencoes: {
          include: { tipo: true },
          orderBy: { data: "desc" },
          take: 50,
        },
      },
    });
    if (!equipamento) throw new AppError(404, "Equipamento não encontrado");
    return equipamento;
  },

  async criar(data: {
    codigo: string;
    numeroPatrimonio?: string;
    descricao: string;
    modelo?: string;
    numeroSerie?: string;
    marcaId?: number;
    categoriaId?: number;
    subcategoriaId?: number;
    localizacaoId?: number;
    fornecedorId?: number;
    statusId: number;
    estadoConservacaoId?: number;
    dataAquisicao?: Date | string;
    valorAquisicao?: number;
    dataGarantia?: Date | string;
    observacoes?: string;
  }) {
    const codigoNorm = data.codigo.trim().toUpperCase();
    if (await prisma.equipamento.findUnique({ where: { codigo: codigoNorm } }))
      throw new AppError(400, "Código já cadastrado");
    return prisma.equipamento.create({
      data: { ...data, codigo: codigoNorm },
      include: {
        marca: true,
        categoria: true,
        subcategoria: true,
        localizacao: true,
        status: true,
        estadoConservacao: true,
      },
    });
  },

  async atualizar(
    id: number,
    data: Partial<{
      codigo: string;
      numeroPatrimonio?: string;
      descricao: string;
      modelo?: string;
      numeroSerie?: string;
      marcaId?: number;
      categoriaId?: number;
      subcategoriaId?: number;
      localizacaoId?: number;
      fornecedorId?: number;
      statusId: number;
      estadoConservacaoId?: number;
      dataAquisicao?: Date | string;
      valorAquisicao?: number;
      dataGarantia?: Date | string;
      observacoes?: string;
      ativo: boolean;
    }>,
  ) {
    const existente = await prisma.equipamento.findUnique({ where: { id } });
    if (!existente) throw new AppError(404, "Equipamento não encontrado");
    if (data.codigo) {
      const codigoNorm = data.codigo.trim().toUpperCase();
      const dup = await prisma.equipamento.findUnique({ where: { codigo: codigoNorm } });
      if (dup && dup.id !== id) throw new AppError(400, "Código já cadastrado");
      data.codigo = codigoNorm;
    }
    return prisma.equipamento.update({ where: { id }, data });
  },

  async desativar(id: number) {
    const existente = await prisma.equipamento.findUnique({ where: { id } });
    if (!existente) throw new AppError(404, "Equipamento não encontrado");
    return prisma.equipamento.update({ where: { id }, data: { ativo: false } });
  },

  async reativar(id: number) {
    const existente = await prisma.equipamento.findUnique({ where: { id } });
    if (!existente) throw new AppError(404, "Equipamento não encontrado");
    return prisma.equipamento.update({ where: { id }, data: { ativo: true } });
  },

  // ===== RETIRADA / DEVOLUÇÃO =====
  async retirada(id: number, data: { colaboradorId: number; observacao?: string }, ctx: Ctx) {
    const equipamento = await prisma.equipamento.findUnique({ where: { id } });
    if (!equipamento) throw new AppError(404, "Equipamento não encontrado");
    if (!equipamento.ativo) throw new AppError(400, "Equipamento inativo");
    const emAberto = await prisma.retiradaEquipamento.findFirst({
      where: { equipamentoId: id, dataDevolucao: null },
    });
    if (emAberto) throw new AppError(400, "Equipamento já está retirado");
    const colaborador = await prisma.user.findUnique({ where: { id: data.colaboradorId } });
    if (!colaborador) throw new AppError(404, "Colaborador não encontrado");
    return prisma.$transaction(async (tx) => {
      const retirada = await tx.retiradaEquipamento.create({
        data: {
          equipamentoId: id,
          colaboradorId: data.colaboradorId,
          observacao: data.observacao,
          registradoPorId: ctx.userId,
        },
        include: { colaborador: { select: { id: true, nome: true } } },
      });
      await tx.equipamento.update({ where: { id }, data: { responsavelId: data.colaboradorId } });
      return retirada;
    });
  },

  async devolucao(id: number, _ctx: Ctx) {
    const emAberto = await prisma.retiradaEquipamento.findFirst({
      where: { equipamentoId: id, dataDevolucao: null },
      orderBy: { dataRetirada: "desc" },
    });
    if (!emAberto) throw new AppError(400, "Equipamento não está retirado");
    return prisma.$transaction(async (tx) => {
      const retirada = await tx.retiradaEquipamento.update({
        where: { id: emAberto.id },
        data: { dataDevolucao: new Date() },
      });
      await tx.equipamento.update({ where: { id }, data: { responsavelId: null } });
      return retirada;
    });
  },
};