import { useState, type ReactNode } from "react";
import {
  categoriasApi,
  estadosConservacaoApi,
  fornecedoresApi,
  localizacoesApi,
  marcasApi,
  statusEquipamentoApi,
  subcategoriasApi,
  tiposManutencaoApi,
  type EquipamentoLookups,
  type FornecedorInput,
  type FornecedorItem,
  type LookupInput,
  type LookupItem,
  type SubcategoriaInput,
} from "../lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "../lib/utils";

const selectClasses =
  "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

type Modulo = "EQUIPAMENTO" | "EPI";

interface CatalogosOperacionaisProps {
  modulo: Modulo;
  lookups: EquipamentoLookups | null;
  relerLookups: () => Promise<void>;
}

function SeletorAtualizacaoLookup({
  item,
  api,
  aoSalvar,
}: {
  item: LookupItem;
  api: {
    atualizar: (id: number, input: Partial<LookupInput> & { ativo?: boolean }) => Promise<unknown>;
  };
  aoSalvar: () => Promise<void>;
}) {
  const [value, setValue] = useState(item.descricao ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function salvar() {
    setBusy(true);
    setErr(null);
    try {
      await api.atualizar(item.id, { descricao: value || undefined });
      await aoSalvar();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Falha ao atualizar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={salvar}
        placeholder="Descrição (opcional)"
        className="h-9 max-w-[220px]"
      />
      {busy && <span className="text-xs text-muted-foreground">Salvando...</span>}
      {err && <span className="text-xs text-destructive">{err}</span>}
    </div>
  );
}

function LinhaLookup({
  item,
  api,
  aoSalvar,
  extra,
}: {
  item: LookupItem;
  api: {
    atualizar: (id: number, input: Partial<LookupInput> & { ativo?: boolean }) => Promise<unknown>;
    desativar: (id: number) => Promise<unknown>;
  };
  aoSalvar: () => Promise<void>;
  extra?: ReactNode;
}) {
  const [toggling, setToggling] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function alternarAtivo() {
    setToggling(true);
    setErr(null);
    try {
      await api.atualizar(item.id, { ativo: !item.ativo });
      await aoSalvar();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Falha ao atualizar");
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{item.nome}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              item.ativo
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-muted text-muted-foreground",
            )}
          >
            {item.ativo ? "Ativo" : "Inativo"}
          </span>
        </div>
        {item.descricao && (
          <span className="text-xs text-muted-foreground">{item.descricao}</span>
        )}
        {extra}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SeletorAtualizacaoLookup item={item} api={api} aoSalvar={aoSalvar} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={toggling}
          onClick={alternarAtivo}
        >
          {item.ativo ? "Desativar" : "Ativar"}
        </Button>
      </div>
      {err && <span className="w-full text-xs text-destructive">{err}</span>}
    </div>
  );
}

function CardCatologo({
  titulo,
  descricao,
  itens,
  api,
  aoSalvar,
  formularioNovo,
}: {
  titulo: string;
  descricao: string;
  itens: LookupItem[];
  api: {
    criar: (input: LookupInput) => Promise<unknown>;
    atualizar: (id: number, input: Partial<LookupInput> & { ativo?: boolean }) => Promise<unknown>;
    desativar: (id: number) => Promise<unknown>;
  };
  aoSalvar: () => Promise<void>;
  formularioNovo?: (form: LookupInput, setForm: (f: LookupInput) => void) => ReactNode;
}) {
  const [form, setForm] = useState<LookupInput>({ nome: "", descricao: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function criar() {
    if (!form.nome.trim()) return;
    setSaving(true);
    setErr(null);
    try {
      await api.criar({ nome: form.nome.trim(), descricao: form.descricao || undefined });
      setForm({ nome: "", descricao: "" });
      await aoSalvar();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Falha ao cadastrar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{titulo}</CardTitle>
        <CardDescription>{descricao}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Nome do item"
            />
          </div>
          {formularioNovo && formularioNovo(form, setForm)}
        </div>
        {form.descricao !== undefined && (
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input
              value={form.descricao ?? ""}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Descrição (opcional)"
            />
          </div>
        )}
        {err && <span className="text-xs text-destructive">{err}</span>}
        <Button type="button" size="sm" disabled={saving} onClick={criar}>
          {saving ? "Salvando..." : "Adicionar"}
        </Button>
        <div className="space-y-2 pt-2">
          {itens.map((item) => (
            <LinhaLookup key={item.id} item={item} api={api} aoSalvar={aoSalvar} />
          ))}
          {itens.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhum item cadastrado.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ItemFornecedor({ item }: { item: FornecedorItem }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{item.nome}</span>
      <span className="text-xs text-muted-foreground">
        {[item.cnpj && `CNPJ: ${item.cnpj}`, item.telefone && `Tel: ${item.telefone}`, item.email && `Email: ${item.email}`]
          .filter(Boolean)
          .join(" · ") || "Sem contato"}
      </span>
    </div>
  );
}

export function CatalogosOperacionais({
  modulo,
  lookups,
  relerLookups,
}: CatalogosOperacionaisProps) {
  const [categoriaParaSub, setCategoriaParaSub] = useState<number | "">("");
  const [formFornecedor, setFormFornecedor] = useState<FornecedorInput>({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
  });
  const [savingFornecedor, setSavingFornecedor] = useState(false);
  const [formSub, setFormSub] = useState<LookupInput>({ nome: "", descricao: "" });
  const [savingSub, setSavingSub] = useState(false);
  const [errSub, setErrSub] = useState<string | null>(null);
  const [errFornecedor, setErrFornecedor] = useState<string | null>(null);

  if (!lookups) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Carregando catálogos...
      </p>
    );
  }

  async function criarSubcategoria() {
    if (!formSub.nome.trim() || !categoriaParaSub) return;
    setSavingSub(true);
    setErrSub(null);
    try {
      const input: SubcategoriaInput = {
        nome: formSub.nome.trim(),
        descricao: formSub.descricao || undefined,
        categoriaId: Number(categoriaParaSub),
      };
      await subcategoriasApi.criar(input);
      setFormSub({ nome: "", descricao: "" });
      await relerLookups();
    } catch (e) {
      setErrSub(e instanceof Error ? e.message : "Falha ao cadastrar subcategoria");
    } finally {
      setSavingSub(false);
    }
  }

  async function criarFornecedor() {
    if (!formFornecedor.nome.trim()) return;
    setSavingFornecedor(true);
    setErrFornecedor(null);
    try {
      await fornecedoresApi.criar({
        nome: formFornecedor.nome.trim(),
        cnpj: formFornecedor.cnpj || undefined,
        telefone: formFornecedor.telefone || undefined,
        email: formFornecedor.email || undefined,
      });
      setFormFornecedor({ nome: "", cnpj: "", telefone: "", email: "" });
      await relerLookups();
    } catch (e) {
      setErrFornecedor(e instanceof Error ? e.message : "Falha ao cadastrar fornecedor");
    } finally {
      setSavingFornecedor(false);
    }
  }

  const somenteEpi = modulo === "EPI";
  const titulo = somenteEpi ? "Catálogos de EPIs" : "Catálogos de Equipamentos";
  const descricao = somenteEpi
    ? "Tabelas auxiliares usadas no cadastro de EPIs."
    : "Tabelas auxiliares usadas no cadastro de equipamentos.";
  const subcategoriasAtivas = lookups.subcategorias.filter((s) => s.ativo);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">{titulo}</h2>
        <p className="text-sm text-muted-foreground">{descricao}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CardCatologo
          titulo="Categorias"
          descricao="Agrupamentos gerais."
          itens={lookups.categorias}
          api={categoriasApi}
          aoSalvar={relerLookups}
        />
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Subcategorias</CardTitle>
            <CardDescription>Refinamento das categorias.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Categoria pai</Label>
                <select
                  value={categoriaParaSub}
                  onChange={(e) =>
                    setCategoriaParaSub(e.target.value ? Number(e.target.value) : "")
                  }
                  className={selectClasses}
                >
                  <option value="">Selecione...</option>
                  {lookups.categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input
                  value={formSub.nome}
                  onChange={(e) => setFormSub({ ...formSub, nome: e.target.value })}
                  placeholder="Nome da subcategoria"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Input
                value={formSub.descricao ?? ""}
                onChange={(e) => setFormSub({ ...formSub, descricao: e.target.value })}
                placeholder="Descrição (opcional)"
              />
            </div>
            {errSub && <span className="text-xs text-destructive">{errSub}</span>}
            <Button type="button" size="sm" disabled={savingSub} onClick={criarSubcategoria}>
              {savingSub ? "Salvando..." : "Adicionar"}
            </Button>
            <div className="space-y-2 pt-2">
              {subcategoriasAtivas
                .concat()
                .map((s) => {
                  const nomeCategoria = lookups.categorias.find(
                    (c) => c.id === s.categoriaId,
                  )?.nome;

                  return (
                    <LinhaLookup
                      key={s.id}
                      item={s}
                      api={subcategoriasApi}
                      aoSalvar={relerLookups}
                      extra={
                        <span className="text-xs text-muted-foreground">
                          Categoria: {nomeCategoria ?? "—"}
                        </span>
                      }
                    />
                  );
                })}
              {subcategoriasAtivas.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nenhuma subcategoria cadastrada.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <CardCatologo
          titulo="Marcas"
          descricao="Fabricantes."
          itens={lookups.marcas}
          api={marcasApi}
          aoSalvar={relerLookups}
        />
        <CardCatologo
          titulo="Localizações"
          descricao="Onde os itens ficam instalados."
          itens={lookups.localizacoes}
          api={localizacoesApi}
          aoSalvar={relerLookups}
        />
        {!somenteEpi && (
          <CardCatologo
            titulo="Status de equipamento"
            descricao="Situação operacional do equipamento."
            itens={lookups.statuses}
            api={statusEquipamentoApi}
            aoSalvar={relerLookups}
          />
        )}
        {!somenteEpi && (
          <CardCatologo
            titulo="Estados de conservação"
            descricao="Condição física do equipamento."
            itens={lookups.estadosConservacao}
            api={estadosConservacaoApi}
            aoSalvar={relerLookups}
          />
        )}
        {!somenteEpi && (
          <CardCatologo
            titulo="Tipos de manutenção"
            descricao="Classificação das manutenções."
            itens={lookups.tiposManutencao}
            api={tiposManutencaoApi}
            aoSalvar={relerLookups}
          />
        )}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Fornecedores</CardTitle>
            <CardDescription>Empresas fornecedoras.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input
                  value={formFornecedor.nome}
                  onChange={(e) =>
                    setFormFornecedor({ ...formFornecedor, nome: e.target.value })
                  }
                  placeholder="Nome do fornecedor"
                />
              </div>
              <div className="space-y-1.5">
                <Label>CNPJ</Label>
                <Input
                  value={formFornecedor.cnpj ?? ""}
                  onChange={(e) =>
                    setFormFornecedor({ ...formFornecedor, cnpj: e.target.value })
                  }
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input
                  value={formFornecedor.telefone ?? ""}
                  onChange={(e) =>
                    setFormFornecedor({ ...formFornecedor, telefone: e.target.value })
                  }
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formFornecedor.email ?? ""}
                  onChange={(e) =>
                    setFormFornecedor({ ...formFornecedor, email: e.target.value })
                  }
                  placeholder="Opcional"
                />
              </div>
            </div>
            {errFornecedor && <span className="text-xs text-destructive">{errFornecedor}</span>}
            <Button
              type="button"
              size="sm"
              disabled={savingFornecedor}
              onClick={criarFornecedor}
            >
              {savingFornecedor ? "Salvando..." : "Adicionar"}
            </Button>
            <div className="space-y-2 pt-2">
              {lookups.fornecedores.map((item) => (
                <LinhaLookup
                  key={item.id}
                  item={item as unknown as LookupItem}
                  api={fornecedoresApi}
                  aoSalvar={relerLookups}
                  extra={<ItemFornecedor item={item} />}
                />
              ))}
              {lookups.fornecedores.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nenhum fornecedor cadastrado.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}