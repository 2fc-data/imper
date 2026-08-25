import { PrismaClient, TipoMaterial, TipoItemServico, UnidadeMedida } from "@prisma/client";
import bcrypt from "bcryptjs";

// ============================================================
// RBAC — PAPEIS & PERMISSÕES
// ============================================================

const PAPEIS_RBAC = [
  { nome: "ADMIN", descricao: "Acesso total ao sistema" },
  { nome: "SUPERVISOR", descricao: "Supervisão de equipes e operações" },
  { nome: "TECNICO", descricao: "Execução de serviços técnicos" },
  { nome: "ALMOXARIFE", descricao: "Controle de estoque e materiais" },
  { nome: "CONTABILIDADE", descricao: "Gestão financeira" },
  { nome: "ATENDENTE", descricao: "Atendimento ao cliente e triagem" },
  { nome: "CLIENTE", descricao: "Acesso restrito ao próprio acompanhamento" },
] as const;

const PERMISSOES = [
  // Usuários
  { chave: "criar_usuario", descricao: "Criar novos usuários", categoria: "usuarios" },
  { chave: "editar_usuario", descricao: "Editar dados de usuários", categoria: "usuarios" },
  { chave: "excluir_usuario", descricao: "Excluir usuários do sistema", categoria: "usuarios" },
  { chave: "definir_perfil", descricao: "Definir perfil de acesso de usuários", categoria: "usuarios" },

  // Atendimentos
  { chave: "criar_atendimento", descricao: "Criar novos atendimentos", categoria: "atendimentos" },
  { chave: "editar_atendimento", descricao: "Editar atendimentos existentes", categoria: "atendimentos" },

  // Ordens de Serviço
  { chave: "criar_os", descricao: "Criar ordens de serviço", categoria: "ordens_servico" },
  { chave: "editar_os", descricao: "Editar ordens de serviço", categoria: "ordens_servico" },
  { chave: "aprovar_os", descricao: "Aprovar ordens de serviço", categoria: "ordens_servico" },
  { chave: "iniciar_os", descricao: "Iniciar execução de OS", categoria: "ordens_servico" },
  { chave: "concluir_os", descricao: "Concluir ordens de serviço", categoria: "ordens_servico" },
  { chave: "cancelar_os", descricao: "Cancelar ordens de serviço", categoria: "ordens_servico" },
  { chave: "confirmar_obra", descricao: "Confirmar conclusão da obra", categoria: "ordens_servico" },
  { chave: "entregar_os", descricao: "Entregar OS ao cliente", categoria: "ordens_servico" },

  // Financeiro
  { chave: "ver_financeiro", descricao: "Acessar dados financeiros", categoria: "financeiro" },
  { chave: "criar_pagamento", descricao: "Registrar pagamentos", categoria: "financeiro" },
  { chave: "aprovar_compra", descricao: "Aprovar compras", categoria: "financeiro" },
  { chave: "recusar_compra", descricao: "Recusar compras", categoria: "financeiro" },
  { chave: "receber_compra", descricao: "Receber compras", categoria: "financeiro" },

  // Estoque
  { chave: "gerenciar_estoque", descricao: "Gerenciar estoque de materiais", categoria: "estoque" },
  { chave: "criar_material", descricao: "Cadastrar novos materiais", categoria: "estoque" },
  { chave: "editar_material", descricao: "Editar materiais existentes", categoria: "estoque" },
  { chave: "entrada_estoque", descricao: "Registrar entradas no estoque", categoria: "estoque" },
  { chave: "saida_estoque", descricao: "Registrar saídas do estoque", categoria: "estoque" },
  { chave: "criar_separacao", descricao: "Criar separações de materiais", categoria: "estoque" },
  { chave: "separar_item", descricao: "Separar itens para OS", categoria: "estoque" },

  // Equipamentos
  { chave: "gerenciar_equipamentos", descricao: "Gerenciar equipamentos", categoria: "equipamentos" },
  { chave: "criar_equipamento", descricao: "Cadastrar equipamentos", categoria: "equipamentos" },
  { chave: "editar_equipamento", descricao: "Editar equipamentos", categoria: "equipamentos" },
  { chave: "excluir_equipamento", descricao: "Excluir equipamentos", categoria: "equipamentos" },
  { chave: "retirar_equipamento", descricao: "Retirar equipamentos para uso", categoria: "equipamentos" },
  { chave: "registrar_manutencao", descricao: "Registrar manutenções", categoria: "equipamentos" },

  // EPIs
  { chave: "entregar_epi", descricao: "Entregar EPIs a colaboradores", categoria: "epis" },

  // Relatórios
  { chave: "ver_analises", descricao: "Acessar análises e relatórios", categoria: "relatorios" },
  { chave: "gerar_relatorios", descricao: "Gerar relatórios", categoria: "relatorios" },
  { chave: "ver_os", descricao: "Visualizar ordens de serviço", categoria: "relatorios" },
  { chave: "ver_orcamentos", descricao: "Visualizar orçamentos", categoria: "relatorios" },
  { chave: "ver_compras", descricao: "Visualizar compras", categoria: "relatorios" },

  // Configurações
  { chave: "editar_configuracoes", descricao: "Editar configurações do sistema", categoria: "configuracoes" },
  { chave: "gerenciar_cargos", descricao: "Gerenciar cargos", categoria: "configuracoes" },
  { chave: "gerenciar_servicos", descricao: "Gerenciar catálogo de serviços", categoria: "configuracoes" },
  { chave: "gerenciar_agendamentos", descricao: "Gerenciar agendamentos", categoria: "configuracoes" },
  { chave: "gerenciar_visitas", descricao: "Gerenciar visitas técnicas", categoria: "configuracoes" },
  { chave: "gerenciar_papeis", descricao: "Gerenciar papéis e permissões do RBAC", categoria: "configuracoes" },

  // OS (para técnico)
  { chave: "ver_visitas", descricao: "Visualizar visitas técnicas", categoria: "relatorios" },
  { chave: "realizar_visita", descricao: "Registrar realização de visita", categoria: "atendimentos" },

  // Minha OS (cliente)
  { chave: "ver_minha_os", descricao: "Visualizar própria OS", categoria: "relatorios" },
] as const;

// Mapeamento de permissões por papel
const PERMISSOES_POR_PAPEL: Record<string, readonly string[]> = {
  ADMIN: PERMISSOES.map((p) => p.chave),
  SUPERVISOR: PERMISSOES.filter((p) => !["editar_configuracoes", "gerenciar_cargos"].includes(p.chave)).map((p) => p.chave),
  ATENDENTE: [
    "ver_os", "criar_atendimento", "editar_atendimento", "criar_os",
    "confirmar_obra", "entregar_os", "ver_orcamentos",
    "gerenciar_agendamentos", "gerenciar_visitas", "gerenciar_equipamentos",
  ],
  TECNICO: [
    "ver_os", "iniciar_os", "concluir_os", "editar_os",
    "gerenciar_equipamentos", "retirar_equipamento", "registrar_manutencao",
    "ver_visitas", "realizar_visita",
  ],
  ALMOXARIFE: [
    "gerenciar_estoque", "criar_material", "entrada_estoque", "saida_estoque",
    "criar_separacao", "separar_item", "ver_compras", "receber_compra",
    "gerenciar_equipamentos", "entregar_epi",
  ],
  CONTABILIDADE: [
    "ver_financeiro", "criar_pagamento", "ver_os", "ver_orcamentos", "ver_compras",
  ],
  CLIENTE: ["ver_minha_os"],
};

const prisma = new PrismaClient();

async function findOrCreateCargo(nome: string, descricao: string) {
  const existente = await prisma.cargo.findFirst({ where: { nome } });
  if (existente) return existente;
  return prisma.cargo.create({ data: { nome, descricao } });
}

async function findOrCreateFase(nome: string, ordem: number) {
  const existente = await prisma.fase.findFirst({ where: { nome } });
  if (existente) return existente;
  return prisma.fase.create({ data: { nome, ordem } });
}

async function findOrCreateMaterial(data: {
  nome: string;
  tipo: TipoMaterial;
  unidade: UnidadeMedida;
  quantidadeMinima?: number;
  custoUnitario?: number;
  modelo?: string | null;
  marcaId?: number | null;
  corId?: number | null;
}) {
  const existente = await prisma.material.findFirst({ where: { nome: data.nome } });
  if (existente) return existente;
  return prisma.material.create({ data });
}

async function findOrCreateServicoMarketing(data: {
  titulo: string;
  descricao: string;
  icone: string;
  ordem: number;
}) {
  return prisma.servicoMarketing.upsert({
    where: { titulo: data.titulo },
    update: { descricao: data.descricao, icone: data.icone, ordem: data.ordem, ativo: true },
    create: data,
  });
}

async function findOrCreateCidadeAtendida(data: {
  nome: string;
  uf: string;
  lat: number;
  lng: number;
  ordem: number;
}) {
  return prisma.cidadeAtendida.upsert({
    where: { nome: data.nome },
    update: { uf: data.uf, lat: data.lat, lng: data.lng, ordem: data.ordem, ativo: true },
    create: data,
  });
}

async function findOrCreateCategoriaEquipamento(nome: string, ordem: number) {
  const existente = await prisma.categoriaEquipamento.findFirst({ where: { nome } });
  if (existente) return existente;
  return prisma.categoriaEquipamento.create({ data: { nome, ordem } });
}

async function findOrCreateMarca(nome: string, ordem: number) {
  const existente = await prisma.marca.findFirst({ where: { nome } });
  if (existente) return existente;
  return prisma.marca.create({ data: { nome, ordem } });
}

async function findOrCreateCor(nome: string, ordem: number, codigoHex?: string) {
  const existente = await prisma.cor.findFirst({ where: { nome } });
  if (existente) return existente;
  return prisma.cor.create({ data: { nome, ordem, codigoHex } });
}

async function findOrCreateTamanhoEquipamento(nome: string, ordem: number) {
  const existente = await prisma.tamanhoEquipamento.findFirst({ where: { nome } });
  if (existente) return existente;
  return prisma.tamanhoEquipamento.create({ data: { nome, ordem } });
}

async function main() {
  const senhaHash = await bcrypt.hash("admin123", 10);

  const diretor = await findOrCreateCargo("Diretor", "Administração geral");
  const supervisor = await findOrCreateCargo("Supervisor de Obras", "Supervisão de campo");
  const tecnicoSenior = await findOrCreateCargo("Técnico Sênior", "Técnico em impermeabilização");
  const almoxarife = await findOrCreateCargo("Almoxarife", "Controle de estoque");
  const contabil = await findOrCreateCargo("Analista Contábil", "Financeiro e contabilidade");
  const atendente = await findOrCreateCargo("Atendente", "Recepção e triagem de contatos");

  const usuarios: Array<{
    nome: string;
    email: string;
    papelNome: string;
    cargoId: number;
  }> = [
    { nome: "Admin Sistema", email: "admin@imper.local", papelNome: "ADMIN", cargoId: diretor.id },
    { nome: "Supervisor A", email: "supervisor@imper.local", papelNome: "SUPERVISOR", cargoId: supervisor.id },
    { nome: "Técnico 1", email: "tecnico@imper.local", papelNome: "TECNICO", cargoId: tecnicoSenior.id },
    { nome: "Almoxarife A", email: "almoxarife@imper.local", papelNome: "ALMOXARIFE", cargoId: almoxarife.id },
    { nome: "Contabilidade", email: "contabilidade@imper.local", papelNome: "CONTABILIDADE", cargoId: contabil.id },
    { nome: "Atendente A", email: "atendente@imper.local", papelNome: "ATENDENTE", cargoId: atendente.id },
  ];

  for (const u of usuarios) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { nome: u.nome, cargoId: u.cargoId, ativo: true },
      create: {
        nome: u.nome,
        email: u.email,
        cargoId: u.cargoId,
        senhaHash,
      },
    });
  }

  const fases = [
    { nome: "Preparação da superfície", ordem: 1 },
    { nome: "Primeira camada", ordem: 2 },
    { nome: "Segunda camada", ordem: 3 },
    { nome: "Acabamento e inspeção", ordem: 4 },
  ];
  const faseIds = new Map<string, number>();
  for (const f of fases) {
    const criada = await findOrCreateFase(f.nome, f.ordem);
    faseIds.set(f.nome, criada.id);
  }

  console.log("Criando marcas de materiais...");
  const marcasMaterial = [
    { nome: "DENVER", ordem: 10 },
    { nome: "DOW", ordem: 11 },
    { nome: "TRAMONTINA", ordem: 12 },
    { nome: "TIGRE", ordem: 13 },
    { nome: "MACFLEX", ordem: 14 },
    { nome: "PROXPUR", ordem: 15 },
    { nome: "RECUBRIPLAST", ordem: 16 },
    { nome: "COMPEL", ordem: 17 },
  ];
  const marcaMaterialMap = new Map<string, number>();
  for (const m of marcasMaterial) {
    const criada = await findOrCreateMarca(m.nome, m.ordem);
    marcaMaterialMap.set(m.nome, criada.id);
  }

  const materiais = [
    { nome: "Manta asfáltica", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.M2, quantidadeMinima: 100, custoUnitario: 18.5 },
    { nome: "Primer asfáltico", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.L, quantidadeMinima: 20, custoUnitario: 32.0 },
    { nome: "Massa asfáltica", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, quantidadeMinima: 50, custoUnitario: 12.9 },
    { nome: "Geotêxtil", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.M2, quantidadeMinima: 100, custoUnitario: 9.8 },
    { nome: "Tela de poliéster", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.M2, quantidadeMinima: 100, custoUnitario: 7.5 },
    { nome: "Impermeabilizante acrílico", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.GL, quantidadeMinima: 20, custoUnitario: 220.0 },
    { nome: "Selante PU", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, quantidadeMinima: 24, custoUnitario: 45.0 },
    // ── Novos materiais ──────────────────────────────────────
    { nome: "ÁGUA SANITÁRIA", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.L, modelo: null, marcaId: null, corId: null },
    { nome: "ALSAN", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: null, marcaId: null, corId: null },
    { nome: "APLICADOR DE MASSA", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "AREIA (GROSSA)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: null, marcaId: null, corId: null },
    { nome: "ARGAMASSA", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: null, marcaId: null, corId: null },
    { nome: "BALDE", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "BLOCO DE ESPUMA", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "BROCA 6\"", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "BROCHA RETANGULAR", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "CABO PARA MARRETA", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "CABO PARA ROLO 23\"", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "CIMENTO", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: null, marcaId: null, corId: null },
    { nome: "CONE DE PLÁSTICO", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "DENVER BLITZ (18 KG)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: "BLITZ", marcaId: null, corId: null },
    { nome: "DENVER CRIL SUPER BRANCO (12 KG)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: "CRIL SUPER BRANCO", marcaId: null, corId: null },
    { nome: "DENVER GROUT", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: "GROUT", marcaId: null, corId: null },
    { nome: "DENVER IMPER BLACK 18L", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.L, modelo: "IMPER BLACK", marcaId: null, corId: null },
    { nome: "DENVER IMPER BLACK 900 ML", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.ML, modelo: "IMPER BLACK", marcaId: null, corId: null },
    { nome: "DENVER MANTA PRIMER ACQUA 18L", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.L, modelo: "MANTA PRIMER ACQUA", marcaId: null, corId: null },
    { nome: "DENVER POLIASFALTO 5K", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: "POLIASFALTO", marcaId: null, corId: null },
    { nome: "DENVER TEC", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: "TEC", marcaId: null, corId: null },
    { nome: "DENVER TEC 100 18 KG", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: "TEC 100", marcaId: null, corId: null },
    { nome: "DENVER TEC 540 18 KG", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: "TEC 540", marcaId: null, corId: null },
    { nome: "DENVERGROUT EPOXI", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: "GROUT EPOXI", marcaId: null, corId: null },
    { nome: "DENVERPOXI MAX", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: "POXI MAX", marcaId: null, corId: null },
    { nome: "DENVERTEC ELASTIC HP", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: "TEC ELASTIC HP", marcaId: null, corId: null },
    { nome: "DESENGRIPANTE", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.L, modelo: null, marcaId: null, corId: null },
    { nome: "DESINFETANTE", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.L, modelo: null, marcaId: null, corId: null },
    { nome: "DETERGENTE", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.L, modelo: null, marcaId: null, corId: null },
    { nome: "DF 8 BRANCO 12KG", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: "DF 8", marcaId: null, corId: null },
    { nome: "DISCO DE CORTE INOX 4\"", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: "CORTE INOX", marcaId: null, corId: null },
    { nome: "DISCO DE DESBASTE 4\"", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: "DESBASTE", marcaId: null, corId: null },
    { nome: "DISCO DE DESBASTE 7\"", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: "DESBASTE", marcaId: null, corId: null },
    { nome: "DISCO DIAMANTADO SEGMENTADO 4\"", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: "SEGMENTADO", marcaId: null, corId: null },
    { nome: "DISCO DIAMANTADO TURBO 4\"", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: "TURBO", marcaId: null, corId: null },
    { nome: "DISCO REBOLO DIAMANTADO SEGMENTADO", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: "REBOLO SEGMENTADO", marcaId: null, corId: null },
    { nome: "ENGATE RÁPIDO COM EMENDA", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "ESCOVA DE AÇO TRAMONTINA", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "FILTRO DE CAFÉ 103", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: "103", marcaId: null, corId: null },
    { nome: "FITA CREPE 18MM", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "FITA CREPE 24MM", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "FITA CREPE 48MM", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "FITA ZEBRADA", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "FOLHA DE LIXA DE D'AGUA GROSSA", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: "D'AGUA GROSSA", marcaId: null, corId: null },
    { nome: "FOLHA DE LIXA DE FERRO GROSSA", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: "FERRO GROSSA", marcaId: null, corId: null },
    { nome: "FOLHA DE LIXA DE FERRO MÉDIA (80)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: "FERRO MÉDIA", marcaId: null, corId: null },
    { nome: "HP ELASTIC", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: "ELASTIC", marcaId: null, corId: null },
    { nome: "IMPER MANTA COR 3 MM", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.M2, modelo: "COR 3MM", marcaId: null, corId: null },
    { nome: "IMPER MANTA LAJE PP 3MM", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.M2, modelo: "LAJE PP 3MM", marcaId: null, corId: null },
    { nome: "IMPER MANTA PRIMER (3,6 L)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.L, modelo: "PRIMER", marcaId: null, corId: null },
    { nome: "IMPER MANTA TELHADO AL", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.M2, modelo: "TELHADO AL", marcaId: null, corId: null },
    { nome: "LÂMINAS DE ESTILETE", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "LAMPADA", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "LÁPIS DE PEDREIRO", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "LONA PRETA 4 X 100", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.M2, modelo: null, marcaId: null, corId: null },
    { nome: "MANGUEIRA 5\"", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.MT, modelo: null, marcaId: null, corId: null },
    { nome: "MANTA (FITA 10 CM)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.MT, modelo: null, marcaId: null, corId: null },
    { nome: "MANTA (FITA 90 CM)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.MT, modelo: null, marcaId: null, corId: null },
    { nome: "MANTA GEOTEXTIL (200GR/2,30M)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.M2, modelo: null, marcaId: null, corId: null },
    { nome: "MANTA LIQUIDA ALSAN ACRIL (12K)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: "ALSAN ACRIL", marcaId: null, corId: null },
    { nome: "MASSA ACRÍLICA", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: null, marcaId: null, corId: null },
    { nome: "MASSA ASFÁLTICA (GRANDE - BETUME)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: null, marcaId: null, corId: null },
    { nome: "MASSA CORRIDA (BALDE)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: null, marcaId: null, corId: null },
    { nome: "PALHA DE AÇO", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "PANO", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "PINCEL 1\"", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "PINCEL 2\"", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "PINCEL 3\"", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "POXPUR PU 200 BO-COMPONENTE (3,5)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: "PU 200", marcaId: null, corId: null },
    { nome: "PREGO (18X30)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "PU 40", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: null, marcaId: null, corId: null },
    { nome: "PU200", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, modelo: null, marcaId: null, corId: null },
    { nome: "TINTA", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.GL, modelo: null, marcaId: null, corId: null },
    { nome: "ROLO DE ESPUMA (TAM: 5 CM)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "ROLO DE ESPUMA (TAM: 15CM)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "ROLO DE ESPUMA (TAM: 23 CM)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "ROLO DE ESPUMA (TAM: 9 CM)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "ROLO DE LÃ (COMPEL - TAM: 5 CM)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "ROLO DE LÃ (TAM: 05 CM)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "ROLO DE LÃ (TAM: 09 CM)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "ROLO DE LÃ (TAM: 15 CM)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "ROLO DE LÃ (TAM: 23 CM)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "ROLO DE LÃ (TAM: 9 CM)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "ROLO EPOXI (TAM: 23CM)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: "EPOXI", marcaId: null, corId: null },
    { nome: "SELANTE MS 426 (BRANCO)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: "MS 426", marcaId: null, corId: null },
    { nome: "SELANTE MS 426 (CINZA)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: "MS 426", marcaId: null, corId: null },
    { nome: "SELANTE MS 426 (PRETO)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: "MS 426", marcaId: null, corId: null },
    { nome: "SILICONE (FLEX - DOWSIL 791 - BRANCO - DOW)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: "DOWSIL 791", marcaId: null, corId: null },
    { nome: "SILICONE (FLEX - DOWSIL 791 - PRETO - DOW)", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: "DOWSIL 791", marcaId: null, corId: null },
    { nome: "TÁBUA", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, modelo: null, marcaId: null, corId: null },
    { nome: "TELA POLIÉSTER 1X1 – ROLO: 50 M", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.MT, modelo: null, marcaId: null, corId: null },
    { nome: "THINNER", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.L, modelo: null, marcaId: null, corId: null },
  ];
  const materialIds = new Map<string, number>();
  for (const m of materiais) {
    const criado = await findOrCreateMaterial(m);
    materialIds.set(m.nome, criado.id);
    await prisma.saldoEstoque.upsert({
      where: { materialId: criado.id },
      update: {},
      create: { materialId: criado.id, saldo: 0 },
    });
  }

  const servicos = [
    { nome: "Limpeza e preparo da base", tipo: TipoItemServico.SERVICO, unidade: UnidadeMedida.M2, fase: "Preparação da superfície", material: null, preco: 6.0 },
    { nome: "Aplicação de primer", tipo: TipoItemServico.SERVICO, unidade: UnidadeMedida.M2, fase: "Preparação da superfície", material: null, preco: 8.0 },
    { nome: "Manta asfáltica aplicada", tipo: TipoItemServico.MATERIAL, unidade: UnidadeMedida.M2, fase: "Primeira camada", material: "Manta asfáltica", preco: 45.0 },
    { nome: "Aplicação de massa asfáltica", tipo: TipoItemServico.MATERIAL, unidade: UnidadeMedida.KG, fase: "Segunda camada", material: "Massa asfáltica", preco: 35.0 },
    { nome: "Acabamento com acrílico", tipo: TipoItemServico.MATERIAL, unidade: UnidadeMedida.GL, fase: "Acabamento e inspeção", material: "Impermeabilizante acrílico", preco: 260.0 },
    { nome: "Teste de estanqueidade", tipo: TipoItemServico.SERVICO, unidade: UnidadeMedida.UN, fase: "Acabamento e inspeção", material: null, preco: 150.0 },
  ];

  for (const s of servicos) {
    const existente = await prisma.servicoItem.findFirst({ where: { nome: s.nome } });
    if (existente) continue;
    await prisma.servicoItem.create({
      data: {
        nome: s.nome,
        tipo: s.tipo,
        unidade: s.unidade,
        faseId: faseIds.get(s.fase) ?? null,
        materialId: s.material ? (materialIds.get(s.material) ?? null) : null,
        precoSugerido: s.preco,
      },
    });
  }

  const servicosMarketing = [
    {
      titulo: "Impermeabilização de piscinas",
      descricao:
        "Reforma, manutenção e impermeabilização completa de piscinas, com tratamento anti-infiltração e acabamento durável.",
      icone: "M19 9l-7 12-7-12a7 7 0 1114 0z",
      ordem: 1,
    },
    {
      titulo: "Manta asfáltica",
      descricao:
        "Aplicação de manta asfáltica em lajes, telhados e áreas expostas, protegendo contra intempéries e trincas.",
      icone: "M4 18l2-8h12l2 8M7 10l1-5h8l1 5M8 10a2 2 0 100 4M16 10a2 2 0 100 4",
      ordem: 2,
    },
    {
      titulo: "Lajes e paredes",
      descricao:
        "Tratamento de umidade e infiltração em lajes, paredes, reservatórios e áreas molhadas de qualquer edificação.",
      icone: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6",
      ordem: 3,
    },
  ];

  await prisma.servicoMarketing.deleteMany({
    where: { titulo: "Venda de impermeabilizantes" },
  });

  for (const s of servicosMarketing) {
    await findOrCreateServicoMarketing(s);
  }

  const cidadesAtendidas = [
    { nome: "Poços de Caldas", uf: "MG", lat: -21.7879, lng: -46.5614, ordem: 1 },
    { nome: "Andradas", uf: "MG", lat: -22.0694, lng: -46.5696, ordem: 2 },
    { nome: "Campestre", uf: "MG", lat: -21.7121, lng: -46.2459, ordem: 3 },
    { nome: "Botelhos", uf: "MG", lat: -21.6317, lng: -46.3942, ordem: 4 },
  ];

  for (const c of cidadesAtendidas) {
    await findOrCreateCidadeAtendida(c);
  }

  const configs = [
    { chave: "visita.prazoNormal", valor: "5", descricao: "Dias úteis p/ visita (urgência normal)" },
    { chave: "visita.prazoUrgente", valor: "3", descricao: "Dias úteis p/ visita (urgente)" },
    { chave: "visita.prazoUrgentissimo", valor: "1", descricao: "Dias úteis p/ visita (urgentíssimo)" },
    { chave: "os.prazoExecucaoNormal", valor: "10", descricao: "Dias úteis p/ executar OS (normal)" },
    { chave: "os.prazoExecucaoUrgente", valor: "3", descricao: "Dias úteis p/ executar OS (urgente)" },
    { chave: "os.prazoExecucaoUrgentissimo", valor: "1", descricao: "Dias úteis p/ executar OS (urgentíssimo)" },
    { chave: "separacao.diasAntecedencia", valor: "3", descricao: "Dias úteis antes do início p/ separação" },
    { chave: "orcamento.validadeDias", valor: "7", descricao: "Validade do orçamento em dias corridos" },
    { chave: "acesso.linkDias", valor: "30", descricao: "Validade do link de acesso do cliente" },
  ];

  for (const c of configs) {
    await prisma.configuracao.upsert({
      where: { chave: c.chave },
      update: { valor: c.valor },
      create: c,
    });
  }

  // ============================================================
  // RBAC — PAPEIS & PERMISSÕES
  // ============================================================
  console.log("Criando papeis RBAC...");
  const papelMap = new Map<string, number>();
  for (const p of PAPEIS_RBAC) {
    const criado = await prisma.papelRbac.upsert({
      where: { nome: p.nome },
      update: { descricao: p.descricao, ativo: true },
      create: p,
    });
    papelMap.set(p.nome, criado.id);
  }

  console.log("Criando permissoes...");
  const permissaoMap = new Map<string, number>();
  for (const p of PERMISSOES) {
    const criada = await prisma.permissao.upsert({
      where: { chave: p.chave },
      update: { descricao: p.descricao, categoria: p.categoria },
      create: p,
    });
    permissaoMap.set(p.chave, criada.id);
  }

  console.log("Vinculando permissoes aos papeis...");
  for (const [papelNome, permissoesChaves] of Object.entries(PERMISSOES_POR_PAPEL)) {
    const papelId = papelMap.get(papelNome);
    if (!papelId) continue;
    for (const chave of permissoesChaves) {
      const permissaoId = permissaoMap.get(chave);
      if (!permissaoId) continue;
      await prisma.papelPermissao.upsert({
        where: { papelId_permissaoId: { papelId, permissaoId } },
        update: {},
        create: { papelId, permissaoId },
      });
    }
  }

  console.log("Vinculando usuarios aos papeis...");
  for (const u of usuarios) {
    const papelId = papelMap.get(u.papelNome);
    const user = await prisma.user.findUnique({ where: { email: u.email }, select: { id: true } });
    if (!papelId || !user) continue;
    await prisma.usuarioPapel.upsert({
      where: { userId_papelId: { userId: user.id, papelId } },
      update: {},
      create: { userId: user.id, papelId },
    });
  }

  // ============================================================
  // EPIs — CATEGORIAS, MARCAS, CORES, TAMANHOS & ITENS
  // ============================================================
  console.log("Criando categorias de EPI...");
  const categoriasEpi = [
    { nome: "Proteção da Cabeça", ordem: 1 },
    { nome: "Proteção do Corpo", ordem: 2 },
    { nome: "Proteção Respiratória", ordem: 3 },
    { nome: "Proteção das Mãos", ordem: 4 },
    { nome: "Proteção dos Olhos", ordem: 5 },
    { nome: "Proteção Auditiva", ordem: 6 },
    { nome: "Proteção de Quedas", ordem: 7 },
    { nome: "Proteção Articular", ordem: 8 },
  ];
  const catEpiMap = new Map<string, number>();
  for (const c of categoriasEpi) {
    const criada = await findOrCreateCategoriaEquipamento(c.nome, c.ordem);
    catEpiMap.set(c.nome, criada.id);
  }

  console.log("Criando marcas de EPI...");
  const marcasEpi = [
    { nome: "Kalipso", ordem: 1 },
    { nome: "MIG", ordem: 2 },
    { nome: "Plasticor", ordem: 3 },
    { nome: "Multitátil", ordem: 4 },
    { nome: "Volk", ordem: 5 },
    { nome: "Imbat", ordem: 6 },
    { nome: "Vaqueta", ordem: 7 },
    { nome: "VVision", ordem: 8 },
    { nome: "Destra", ordem: 9 },
  ];
  const marcaEpiMap = new Map<string, number>();
  for (const m of marcasEpi) {
    const criada = await findOrCreateMarca(m.nome, m.ordem);
    marcaEpiMap.set(m.nome, criada.id);
  }

  console.log("Criando cores de EPI...");
  const coresEpi = [
    { nome: "Amarelo", ordem: 1, codigoHex: "#FFD700" },
    { nome: "Azul", ordem: 2, codigoHex: "#0000FF" },
    { nome: "Branco", ordem: 3, codigoHex: "#FFFFFF" },
    { nome: "Cinza", ordem: 4, codigoHex: "#808080" },
    { nome: "Laranja", ordem: 5, codigoHex: "#FFA500" },
    { nome: "Preto", ordem: 6, codigoHex: "#000000" },
    { nome: "Verde", ordem: 7, codigoHex: "#008000" },
    { nome: "Vermelho", ordem: 8, codigoHex: "#FF0000" },
  ];
  const corEpiMap = new Map<string, number>();
  for (const c of coresEpi) {
    const criada = await findOrCreateCor(c.nome, c.ordem, c.codigoHex);
    corEpiMap.set(c.nome, criada.id);
  }

  console.log("Criando tamanhos de EPI...");
  const tamanhosEpi = [
    { nome: "P", ordem: 1 },
    { nome: "M", ordem: 2 },
    { nome: "G", ordem: 3 },
    { nome: "GG", ordem: 4 },
    { nome: "UN", ordem: 5 },
  ];
  const tamEpiMap = new Map<string, number>();
  for (const t of tamanhosEpi) {
    const criado = await findOrCreateTamanhoEquipamento(t.nome, t.ordem);
    tamEpiMap.set(t.nome, criado.id);
  }

  console.log("Criando EPIs...");
  const epis = [
    { codigo: "EPI-001", nome: "BONÉ ARABE", modelo: null, marca: null, categoria: "Proteção da Cabeça", cor: null, tamanho: "UN" },
    { codigo: "EPI-002", nome: "CAMISETA MALHA", modelo: "Manga Curta", marca: null, categoria: "Proteção do Corpo", cor: null, tamanho: "M" },
    { codigo: "EPI-003", nome: "CAPACETE", modelo: "ELT", marca: "Plasticor", categoria: "Proteção da Cabeça", cor: null, tamanho: "UN" },
    { codigo: "EPI-004", nome: "FILTRO PARA RESPIRADOR", modelo: null, marca: "MIG", categoria: "Proteção Respiratória", cor: null, tamanho: "UN" },
    { codigo: "EPI-005", nome: "JOELHEIRA DE PROTEÇÃO", modelo: null, marca: null, categoria: "Proteção Articular", cor: null, tamanho: "UN" },
    { codigo: "EPI-006", nome: "LUVA NITRÍLICA", modelo: null, marca: null, categoria: "Proteção das Mãos", cor: null, tamanho: "M" },
    { codigo: "EPI-007", nome: "LUVA PRETA", modelo: "Multitátil", marca: "Volk", categoria: "Proteção das Mãos", cor: "Preto", tamanho: "M" },
    { codigo: "EPI-008", nome: "LUVA PRETA PU", modelo: "Multitátil", marca: "Imbat", categoria: "Proteção das Mãos", cor: "Preto", tamanho: "M" },
    { codigo: "EPI-009", nome: "LUVA VAQUETA", modelo: null, marca: "Vaqueta", categoria: "Proteção das Mãos", cor: null, tamanho: "M" },
    { codigo: "EPI-010", nome: "MÁSCARA PFFII", modelo: null, marca: null, categoria: "Proteção Respiratória", cor: null, tamanho: "UN" },
    { codigo: "EPI-011", nome: "ÓCULOS DE PROTEÇÃO ESCURO", modelo: "VVision 100", marca: "Volk", categoria: "Proteção dos Olhos", cor: null, tamanho: "UN" },
    { codigo: "EPI-012", nome: "ÓCULOS DE PROTEÇÃO TRANSPARENTE", modelo: "VVision 100", marca: "Volk", categoria: "Proteção dos Olhos", cor: null, tamanho: "UN" },
    { codigo: "EPI-013", nome: "PROTETOR AUDITIVO", modelo: null, marca: null, categoria: "Proteção Auditiva", cor: null, tamanho: "UN" },
    { codigo: "EPI-014", nome: "PROTETOR AURICULAR CONCHA", modelo: "K40", marca: "Kalipso", categoria: "Proteção Auditiva", cor: null, tamanho: "UN" },
    { codigo: "EPI-015", nome: "RESPIRADOR PURIFICADOR", modelo: "MIG 12 VO", marca: "Destra", categoria: "Proteção Respiratória", cor: null, tamanho: "UN" },
    { codigo: "EPI-016", nome: "TRAVA-QUEDAS", modelo: null, marca: null, categoria: "Proteção de Quedas", cor: null, tamanho: "UN" },
    { codigo: "EPI-017", nome: "TRAVA-QUEDAS", modelo: "Para Cabo de Aço", marca: null, categoria: "Proteção de Quedas", cor: null, tamanho: "UN" },
    { codigo: "EPI-018", nome: "TRAVA-QUEDAS", modelo: "Para Corda", marca: null, categoria: "Proteção de Quedas", cor: "Branco", tamanho: "UN" },
  ];

  for (const e of epis) {
    const existente = await prisma.epi.findFirst({ where: { codigo: e.codigo } });
    if (existente) continue;
    await prisma.epi.create({
      data: {
        codigo: e.codigo,
        nome: e.nome,
        modelo: e.modelo,
        categoriaId: catEpiMap.get(e.categoria) ?? null,
        marcaId: e.marca ? (marcaEpiMap.get(e.marca) ?? null) : null,
        corId: e.cor ? (corEpiMap.get(e.cor) ?? null) : null,
        tamanhoId: tamEpiMap.get(e.tamanho) ?? null,
      },
    });
  }
  console.log(`Seed EPIs: ${epis.length} itens criados.`);

  // ── Mapeamento de marcas/cor para materiais ──────────────────
  console.log("Mapeando marcas e cores nos materiais...");
  const DENVER = marcaMaterialMap.get("DENVER")!;
  const DOW = marcaMaterialMap.get("DOW")!;
  const TRAMONTINA = marcaMaterialMap.get("TRAMONTINA")!;
  const COMPEL = marcaMaterialMap.get("COMPEL")!;
  const corBranco = corEpiMap.get("Branco")!;
  const corCinza = corEpiMap.get("Cinza")!;
  const corPreto = corEpiMap.get("Preto")!;

  const materialMarcaMap: Record<string, { marcaId?: number; corId?: number }> = {
    "DENVER BLITZ (18 KG)": { marcaId: DENVER },
    "DENVER CRIL SUPER BRANCO (12 KG)": { marcaId: DENVER, corId: corBranco },
    "DENVER GROUT": { marcaId: DENVER },
    "DENVER IMPER BLACK 18L": { marcaId: DENVER, corId: corPreto },
    "DENVER IMPER BLACK 900 ML": { marcaId: DENVER, corId: corPreto },
    "DENVER MANTA PRIMER ACQUA 18L": { marcaId: DENVER },
    "DENVER POLIASFALTO 5K": { marcaId: DENVER },
    "DENVER TEC": { marcaId: DENVER },
    "DENVER TEC 100 18 KG": { marcaId: DENVER },
    "DENVER TEC 540 18 KG": { marcaId: DENVER },
    "DENVERGROUT EPOXI": { marcaId: DENVER },
    "DENVERPOXI MAX": { marcaId: DENVER },
    "DENVERTEC ELASTIC HP": { marcaId: DENVER },
    "DF 8 BRANCO 12KG": { marcaId: DENVER, corId: corBranco },
    "ESCOVA DE AÇO TRAMONTINA": { marcaId: TRAMONTINA },
    "ROLO DE LÃ (COMPEL - TAM: 5 CM)": { marcaId: COMPEL },
    "SILICONE (FLEX - DOWSIL 791 - BRANCO - DOW)": { marcaId: DOW, corId: corBranco },
    "SILICONE (FLEX - DOWSIL 791 - PRETO - DOW)": { marcaId: DOW, corId: corPreto },
  };

  for (const [nome, { marcaId, corId }] of Object.entries(materialMarcaMap)) {
    const matId = materialIds.get(nome);
    if (!matId) continue;
    await prisma.material.update({
      where: { id: matId },
      data: { ...(marcaId ? { marcaId } : {}), ...(corId ? { corId } : {}) },
    });
  }

  // ============================================================
  // EQUIPAMENTOS
  // ============================================================

  console.log("Seed equipamentos...");

  // --- Status de equipamentos ---
  async function findOrCreateStatusEquipamento(nome: string, ordem: number) {
    const existente = await prisma.statusEquipamento.findFirst({ where: { nome } });
    if (existente) return existente;
    return prisma.statusEquipamento.create({ data: { nome, ordem } });
  }
  const statusDisponivel = await findOrCreateStatusEquipamento('Disponivel', 1);
  const statusEmUso = await findOrCreateStatusEquipamento('Em uso', 2);
  const statusManutencao = await findOrCreateStatusEquipamento('Em manutencao', 3);

  // --- Marcas de equipamentos ---
  const marcasEquip: Array<{ nome: string; ordem: number }> = [
    { nome: "BOLDRIÊ", ordem: 21 },
    { nome: "DESOON", ordem: 22 },
    { nome: "INTELBRAS", ordem: 23 },
    { nome: "KARCHER", ordem: 24 },
    { nome: "MAKITA", ordem: 25 },
    { nome: "STANLEY", ordem: 26 },
    { nome: "USK", ordem: 27 },
    { nome: "VONDER", ordem: 28 },
    { nome: "WESCO", ordem: 29 },
  ];
  const marcaEquipMap = new Map<string, number>();
  for (const m of marcasEquip) {
    const criada = await findOrCreateMarca(m.nome, m.ordem);
    marcaEquipMap.set(m.nome, criada.id);
  }

  // --- Categorias de equipamentos ---
  const catEquipMap = new Map<string, number>();
  const cat_Equipamentos_de_Aplicacao = await findOrCreateCategoriaEquipamento("Equipamentos de Aplicacao", 21);
  catEquipMap.set("Equipamentos de Aplicacao", cat_Equipamentos_de_Aplicacao.id);
  const cat_Equipamentos_de_Seguranca = await findOrCreateCategoriaEquipamento("Equipamentos de Seguranca", 22);
  catEquipMap.set("Equipamentos de Seguranca", cat_Equipamentos_de_Seguranca.id);
  const cat_Escadas = await findOrCreateCategoriaEquipamento("Escadas", 23);
  catEquipMap.set("Escadas", cat_Escadas.id);
  const cat_Ferramentas_Eletricas = await findOrCreateCategoriaEquipamento("Ferramentas Eletricas", 24);
  catEquipMap.set("Ferramentas Eletricas", cat_Ferramentas_Eletricas.id);
  const cat_Ferramentas_Manuais = await findOrCreateCategoriaEquipamento("Ferramentas Manuais", 25);
  catEquipMap.set("Ferramentas Manuais", cat_Ferramentas_Manuais.id);
  const cat_Materiais_Diversos = await findOrCreateCategoriaEquipamento("Materiais Diversos", 26);
  catEquipMap.set("Materiais Diversos", cat_Materiais_Diversos.id);
  const cat_Outros = await findOrCreateCategoriaEquipamento("Outros", 27);
  catEquipMap.set("Outros", cat_Outros.id);

  // --- Itens de equipamentos ---
  const equipamentos = [
    { codigo: "EQP-001", descricao: "EXTENSÃO (PEQUENA - BRANCA)", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-002", descricao: "EXTENSÃO (BRANCA - 17METROS)", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-003", descricao: "RÉGUA DE PEDREIRO", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-004", descricao: "ESMERILHADEIRA/LIXADEIRA", modelo: "220V", marca: "WESCO", categoria: "Ferramentas Eletricas" },
    { codigo: "EQP-005", descricao: "SOPRADOR/ASPIRADOR MECÂNICO DE AR", modelo: "600W/127V", marca: "STANLEY", categoria: "Ferramentas Eletricas" },
    { codigo: "EQP-006", descricao: "EXTENSÃO", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-007", descricao: "MISTURADOR ELÉTRICO COM HASTE BATEDORA (ANTIGO)", modelo: null, marca: null, categoria: "Ferramentas Eletricas" },
    { codigo: "EQP-008", descricao: "EXTENSÃO (BRANCA)", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-009", descricao: "SOPRADOR TÉRMICO", modelo: "127V", marca: "VONDER", categoria: "Ferramentas Eletricas" },
    { codigo: "EQP-010", descricao: "BOMBA D'ÁGUA COM CONDUIT", modelo: "AQUAMAK - PF1010 - 60HZ - 127V", marca: "MAKITA", categoria: "Ferramentas Eletricas" },
    { codigo: "EQP-011", descricao: "ESPÁTULA 2 CM", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-012", descricao: "MISTURADOR ELÉTRICO COM HASTE BATEDORA (NOVO)", modelo: null, marca: null, categoria: "Ferramentas Eletricas" },
    { codigo: "EQP-013", descricao: "CINTO DE SEGURANÇA", modelo: "PRETO/LARANJA", marca: "BOLDRIÊ", categoria: "Equipamentos de Seguranca" },
    { codigo: "EQP-014", descricao: "CINTO DE SEGURANÇA (PRETO)", modelo: null, marca: null, categoria: "Equipamentos de Seguranca" },
    { codigo: "EQP-015", descricao: "TALABARTE (SIMPLES)", modelo: null, marca: null, categoria: "Equipamentos de Seguranca" },
    { codigo: "EQP-016", descricao: "CORDA", modelo: null, marca: null, categoria: "Equipamentos de Seguranca" },
    { codigo: "EQP-017", descricao: "RÁDIO COMUNICADOR", modelo: "HT - INTELBRAS - RC3002 G2", marca: "INTELBRAS", categoria: "Outros" },
    { codigo: "EQP-018", descricao: "FURADEIRA", modelo: null, marca: "STANLEY", categoria: "Ferramentas Eletricas" },
    { codigo: "EQP-019", descricao: "EXTENSÃO (GRANDE - CABO PP - PRETA - 12 METROS)", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-020", descricao: "EXTENSÃO (10 METROS)", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-021", descricao: "EXTENSÃO (PEQUENA)", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-022", descricao: "MARTELETE/MARTELO ROMPEDOR ROTATIVO", modelo: "DSRH16 - COM CAIXA - 220V", marca: "DESOON", categoria: "Ferramentas Eletricas" },
    { codigo: "EQP-023", descricao: "SERRA MÁRMORE", modelo: "127V", marca: "VONDER", categoria: "Ferramentas Eletricas" },
    { codigo: "EQP-024", descricao: "EXTENSÃO (DIVERSA)", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-025", descricao: "ESCADA (EXTENSIVA – 9 DEGRAUS)", modelo: null, marca: null, categoria: "Escadas" },
    { codigo: "EQP-026", descricao: "COLHER DE PEDREIRO USADA", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-027", descricao: "RISCADOR DE FORMICA (NOVO)", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-028", descricao: "PÁ DE PEDREIRO", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-029", descricao: "ENXADA", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-030", descricao: "CHIBANCA (HASTE DE FERRO)", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-031", descricao: "GUINCHO (VERMELHO - 220)", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-032", descricao: "CAVADEIRA (01 FACE - RETA)", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-033", descricao: "CORDA DE RAPEL (TIPO BOMBEIRO)", modelo: null, marca: null, categoria: "Equipamentos de Seguranca" },
    { codigo: "EQP-034", descricao: "SERROTE (22\" - PRATA)", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-035", descricao: "MANGUEIRA (NÍVEL)", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-036", descricao: "DESEMPENADEIRA USADA", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-037", descricao: "CARRETILHA (SIMPLES - PEQUENA)", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-038", descricao: "ESQUADRO", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-039", descricao: "TESOURA (ESCRITÓRIO)", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-040", descricao: "CARRINHO (PEDREIRO)", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-041", descricao: "TELA (TIPO: VÉU)", modelo: null, marca: null, categoria: "Materiais Diversos" },
    { codigo: "EQP-042", descricao: "DESEMPENADEIRA 18 X 30", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-043", descricao: "MARTELETE", modelo: null, marca: null, categoria: "Ferramentas Eletricas" },
    { codigo: "EQP-044", descricao: "BOMBA D'ÁGUA", modelo: "AQUAMAK PF 1010 - 127V - NOVA", marca: "MAKITA", categoria: "Ferramentas Eletricas" },
    { codigo: "EQP-045", descricao: "EXTENSÃO (PRETA)", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-046", descricao: "TALABARTE (DUPLO \"Y\")", modelo: null, marca: null, categoria: "Equipamentos de Seguranca" },
    { codigo: "EQP-047", descricao: "CINTO DE SEGURANÇA (CINZA)", modelo: null, marca: null, categoria: "Equipamentos de Seguranca" },
    { codigo: "EQP-048", descricao: "TALABARTE", modelo: null, marca: null, categoria: "Equipamentos de Seguranca" },
    { codigo: "EQP-049", descricao: "ESCADA (4 DEGRAUS)", modelo: null, marca: null, categoria: "Escadas" },
    { codigo: "EQP-050", descricao: "MARTELO", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-051", descricao: "MARTELETE/FURADEIRA (PEQUENO)", modelo: null, marca: null, categoria: "Ferramentas Eletricas" },
    { codigo: "EQP-052", descricao: "CHAVE DE FENDA", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-053", descricao: "ESCADA (GRANDE)", modelo: null, marca: null, categoria: "Escadas" },
    { codigo: "EQP-054", descricao: "DESEMPENADEIRA DENTADA", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-055", descricao: "REFLETOR DE LED (PRETO)", modelo: null, marca: null, categoria: "Materiais Diversos" },
    { codigo: "EQP-056", descricao: "SARGENTO (PARA ANCORAGEM)", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-057", descricao: "ESCADA (SANFONADA – RETRATIL – 12 DEGRAUS)", modelo: null, marca: null, categoria: "Escadas" },
    { codigo: "EQP-058", descricao: "EXTENSÃO (PRETA - GRANDE - 2 X 1,5MM² - 36 METROS)", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-059", descricao: "GLP P13 (GÁS DE COZINHA)", modelo: null, marca: null, categoria: "Materiais Diversos" },
    { codigo: "EQP-060", descricao: "TORQUÊS", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-061", descricao: "CALDEIRA", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-062", descricao: "FOGAREIRO", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-063", descricao: "ESCADA (FERRO – 12/24 DEGRAUS)", modelo: null, marca: null, categoria: "Escadas" },
    { codigo: "EQP-064", descricao: "CARRINHO (CARGA)", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-065", descricao: "CINTO DE SEGURANÇA (CINZA/PRETO)", modelo: null, marca: null, categoria: "Equipamentos de Seguranca" },
    { codigo: "EQP-066", descricao: "LAVADORA DE ALTA PRESSÃO", modelo: null, marca: "KARCHER", categoria: "Ferramentas Eletricas" },
    { codigo: "EQP-067", descricao: "CORDA (09 METROS)", modelo: null, marca: null, categoria: "Equipamentos de Seguranca" },
    { codigo: "EQP-068", descricao: "MANGUEIRA DE JARDIM", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-069", descricao: "LIXADEIRA (ORBITAL)", modelo: null, marca: null, categoria: "Ferramentas Eletricas" },
    { codigo: "EQP-070", descricao: "MARTELETE/FURADEIRA", modelo: "USK", marca: "USK", categoria: "Ferramentas Eletricas" },
    { codigo: "EQP-071", descricao: "MISTURADOR", modelo: null, marca: null, categoria: "Ferramentas Eletricas" },
    { codigo: "EQP-072", descricao: "COLHER DE PEDREIRO 8\"", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-073", descricao: "CADEIRINHA MANUAL", modelo: null, marca: null, categoria: "Equipamentos de Seguranca" },
    { codigo: "EQP-074", descricao: "CABO DE AÇO", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-075", descricao: "PRESILHA/CASTANHA PARA CABO DE AÇO", modelo: null, marca: null, categoria: "Equipamentos de Seguranca" },
    { codigo: "EQP-076", descricao: "CORDA (PEDAÇO)", modelo: null, marca: null, categoria: "Equipamentos de Seguranca" },
    { codigo: "EQP-077", descricao: "ESCADA (ARTICULADA – ALUMÍNIO – 4X4 DEGRAUS)", modelo: null, marca: null, categoria: "Escadas" },
    { codigo: "EQP-078", descricao: "APLICADOR PROFISSIONAL (FLEX PU - DUPLA - MISTURADOR)", modelo: null, marca: null, categoria: "Ferramentas Eletricas" },
    { codigo: "EQP-079", descricao: "ESPÁTULA LIMPADORA (RASPADOR)", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-080", descricao: "TRENA", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-081", descricao: "MARRETA", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-082", descricao: "COLHER DE PEDREIRO", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-083", descricao: "ESPÁTULA DE ACABAMENTO (KIT)", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-084", descricao: "APLICADOR PROFISSIONAL (FLEX PU)", modelo: null, marca: null, categoria: "Equipamentos de Aplicacao" },
    { codigo: "EQP-085", descricao: "ESPÁTULA 6 CM", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-086", descricao: "TAMBOR", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-087", descricao: "FACA Nº 8", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-088", descricao: "PENEIRA", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-089", descricao: "JOGO DE CHAVE COMBINADA (Nº 06 À 17 - 10 PEÇAS)", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-090", descricao: "TALHADEIRA (NOVA)", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-091", descricao: "TALHADEIRA (MARTELETE)", modelo: null, marca: null, categoria: "Ferramentas Eletricas" },
    { codigo: "EQP-092", descricao: "VASSOURA", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-093", descricao: "JOGO CHAVE ALLEN", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-094", descricao: "EXTENSÃO PARA CADEIRINHA", modelo: null, marca: null, categoria: "Equipamentos de Seguranca" },
    { codigo: "EQP-095", descricao: "CADEIRINHA ELÉTRICA", modelo: null, marca: null, categoria: "Equipamentos de Seguranca" },
    { codigo: "EQP-096", descricao: "CENTRAL DE COMANDO", modelo: null, marca: null, categoria: "Equipamentos de Seguranca" },
    { codigo: "EQP-097", descricao: "MARRETA (1 KG)", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-098", descricao: "MARRETA (1KG)", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-099", descricao: "VENTILADOR", modelo: null, marca: null, categoria: "Materiais Diversos" },
    { codigo: "EQP-100", descricao: "ESTILETE", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
    { codigo: "EQP-101", descricao: "RÉGUA", modelo: null, marca: null, categoria: "Outros" },
    { codigo: "EQP-102", descricao: "BALANCIM (COMPLETO: Base/laterais/Afastadores/Cabos de aço/castanhas/parafusos/motores/Central)", modelo: null, marca: null, categoria: "Equipamentos de Seguranca" },
    { codigo: "EQP-103", descricao: "ESCADA", modelo: null, marca: null, categoria: "Escadas" },
    { codigo: "EQP-104", descricao: "TALHADEIRA (USADA)", modelo: null, marca: null, categoria: "Ferramentas Manuais" },
  ];

  for (const e of equipamentos) {
    const existente = await prisma.equipamento.findFirst({ where: { codigo: e.codigo } });
    if (existente) continue;
    await prisma.equipamento.create({
      data: {
        codigo: e.codigo,
        descricao: e.descricao,
        modelo: e.modelo,
        marcaId: e.marca ? (marcaEquipMap.get(e.marca) ?? null) : null,
        categoriaId: catEquipMap.get(e.categoria) ?? null,
        statusId: statusDisponivel.id,
      },
    });
  }
  console.log(`Seed equipamentos: ${equipamentos.length} itens criados.`);

  console.log("Seed concluído. Login admin: admin@imper.local / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
