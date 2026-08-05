import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { m, useInView } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import Turnstile from "../components/Turnstile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { cn } from "../lib/utils";
import { solicitarOrcamento } from "../lib/api";
import { useServicos } from "../lib/useServicos";
import { fadeUp, stagger, VIEWPORT } from "../lib/motion";

const selectClasses =
  "flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const textareaClasses =
  "flex min-h-[110px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export default function OrcamentoPage() {
  const { servicos, loading: loadingServicos } = useServicos();
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, VIEWPORT);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [servico, setServico] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [cepValido, setCepValido] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function buscarCep(digitos: string) {
    if (!/^\d{8}$/.test(digitos)) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.erro) {
        setError("CEP não encontrado. Verifique e tente novamente.");
        setCepValido(false);
        return;
      }
      setError(null);
      setCepValido(true);
      setEndereco(data.logradouro ?? "");
      setBairro(data.bairro ?? "");
      setCidade(data.localidade ?? "");
      setEstado(data.uf ?? "");
    } catch {
      setCepValido(false);
      setError("Não foi possível consultar o CEP. Tente novamente.");
    }
  }

  function formatarCep(valor: string) {
    const digitos = valor.replace(/\D/g, "").slice(0, 8);
    if (digitos.length > 5) return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
    return digitos;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await solicitarOrcamento({
        nome,
        telefone,
        email: email || undefined,
        servico: servico || undefined,
        mensagem: mensagem || undefined,
        cep: cep || undefined,
        endereco: endereco || undefined,
        bairro: bairro || undefined,
        cidade: cidade || undefined,
        estado: estado || undefined,
        numero: numero || undefined,
        complemento: complemento || undefined,
        turnstileToken: turnstileToken || undefined,
      });
      setEnviado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar pedido de orçamento");
    } finally {
      setLoading(false);
    }
  }

  if (enviado) {
    return (
      <section className="border-y bg-card/60 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4">
          <m.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="rounded-xl border bg-card p-8 text-center shadow-sm sm:p-12"
          >
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Pedido recebido!
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Recebemos sua solicitação de orçamento. Nossa equipe entrará em
              contato pelo telefone informado o mais rápido possível.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Voltar ao início
            </Link>
          </m.div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-y bg-card/60 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Orçamento
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Preencha o formulário com o serviço desejado e retornaremos com uma
          proposta sob medida.
        </p>
        <m.div
          ref={gridRef}
          className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]"
          variants={stagger()}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <m.div variants={fadeUp} className="w-full">
            <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl">Solicitação de orçamento</CardTitle>
              <CardDescription>
                Os campos marcados com * são obrigatórios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">
                    Nome <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nome"
                    required
                    autoComplete="name"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">
                    Telefone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="telefone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servico">
                    Serviço <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="servico"
                    required
                    className={cn(selectClasses)}
                    value={servico}
                    onChange={(e) => setServico(e.target.value)}
                  >
                    <option value="">Selecione um serviço...</option>
                    {servicos.map((s) => (
                      <option key={s.id} value={s.titulo}>
                        {s.titulo}
                      </option>
                    ))}
                  </select>
                  {loadingServicos && (
                    <p className="text-xs text-muted-foreground">
                      Carregando serviços...
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP (Local da visita técnica)</Label>
                  <Input
                    id="cep"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="00000-000"
                    value={cep}
                    onChange={(e) => {
                      const valor = formatarCep(e.target.value);
                      setCep(valor);
                      if (valor.replace(/\D/g, "").length === 8) {
                        buscarCep(valor.replace(/\D/g, ""));
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ao informar o CEP, preenchemos endereço, bairro, cidade e
                    UF automaticamente.
                  </p>
                </div>
                {cepValido && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input
                        id="endereco"
                        autoComplete="street-address"
                        placeholder="Rua, avenida..."
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-[1fr_1fr_120px]">
                      <div className="space-y-2">
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input
                          id="bairro"
                          autoComplete="address-level2"
                          placeholder="Bairro"
                          value={bairro}
                          onChange={(e) => setBairro(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input
                          id="cidade"
                          autoComplete="address-level1"
                          placeholder="Cidade"
                          value={cidade}
                          onChange={(e) => setCidade(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado">UF</Label>
                        <Input
                          id="estado"
                          autoComplete="address-level1"
                          maxLength={2}
                          placeholder="UF"
                          value={estado}
                          onChange={(e) => setEstado(e.target.value.toUpperCase())}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="numero">Número</Label>
                        <Input
                          id="numero"
                          inputMode="numeric"
                          autoComplete="address-line1"
                          placeholder="Número"
                          value={numero}
                          onChange={(e) => setNumero(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complemento">Complemento</Label>
                        <Input
                          id="complemento"
                          placeholder="Apto, bloco..."
                          value={complemento}
                          onChange={(e) => setComplemento(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mensagem">Mensagem</Label>
                      <textarea
                        id="mensagem"
                        className={cn(textareaClasses)}
                        placeholder="Descreva o problema e/ou a referência do local (opcional)"
                        maxLength={700}
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                      />
                      <p className="text-right text-xs text-muted-foreground">
                        {mensagem.length}/700
                      </p>
                    </div>
                  </>
                )}
                <Turnstile onChange={setTurnstileToken} />
                {error && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Solicitar orçamento"}
                </Button>
              </form>
            </CardContent>
          </Card>
          </m.div>
          <m.div variants={fadeUp} className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="font-semibold">Prefere conversar?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Fale direto com nossa equipe pelo WhatsApp e receba atendimento
                imediato.
              </p>
              <Link
                to="/contato"
                className="mt-4 flex items-center justify-center gap-1.5 rounded-md border border-input px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Ir para contato
              </Link>
            </div>
          </m.div>
        </m.div>
      </div>
    </section>
  );
}
