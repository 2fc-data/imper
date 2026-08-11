import { PrismaClient, Papel, TipoMaterial, TipoItemServico, UnidadeMedida } from "@prisma/client";
import bcrypt from "bcryptjs";

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
    papel: Papel;
    cargoId: number;
  }> = [
    { nome: "Admin Sistema", email: "admin@imper.local", papel: Papel.ADMIN, cargoId: diretor.id },
    { nome: "Supervisor A", email: "supervisor@imper.local", papel: Papel.SUPERVISOR, cargoId: supervisor.id },
    { nome: "Técnico 1", email: "tecnico@imper.local", papel: Papel.TECNICO, cargoId: tecnicoSenior.id },
    { nome: "Almoxarife A", email: "almoxarife@imper.local", papel: Papel.ALMOXARIFE, cargoId: almoxarife.id },
    { nome: "Contabilidade", email: "contabilidade@imper.local", papel: Papel.CONTABILIDADE, cargoId: contabil.id },
    { nome: "Atendente A", email: "atendente@imper.local", papel: Papel.ATENDENTE, cargoId: atendente.id },
  ];

  for (const u of usuarios) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { nome: u.nome, papel: u.papel, cargoId: u.cargoId, ativo: true },
      create: { ...u, senhaHash },
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

  const materiais = [
    { nome: "Manta asfáltica", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.M2, quantidadeMinima: 100, custoUnitario: 18.5 },
    { nome: "Primer asfáltico", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.L, quantidadeMinima: 20, custoUnitario: 32.0 },
    { nome: "Massa asfáltica", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.KG, quantidadeMinima: 50, custoUnitario: 12.9 },
    { nome: "Geotêxtil", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.M2, quantidadeMinima: 100, custoUnitario: 9.8 },
    { nome: "Tela de poliéster", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.M2, quantidadeMinima: 100, custoUnitario: 7.5 },
    { nome: "Impermeabilizante acrílico", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.GL, quantidadeMinima: 20, custoUnitario: 220.0 },
    { nome: "Selante PU", tipo: TipoMaterial.MATERIAL, unidade: UnidadeMedida.UN, quantidadeMinima: 24, custoUnitario: 45.0 },
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

  console.log("Seed concluído. Login admin: admin@imper.local / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
