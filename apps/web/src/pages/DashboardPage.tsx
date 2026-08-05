import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

interface DashboardResumo {
  contatosNovos: number;
  orcamentosAbertos: number;
  osAndamento: number;
  baixaEstoque: number;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<DashboardResumo>("/dashboard/resumo")
      .then(setResumo)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Erro ao carregar"),
      );
  }, []);

  const itens = [
    { label: "Contatos novos", value: resumo?.contatosNovos, to: "/contatos" },
    {
      label: "Orçamentos abertos",
      value: resumo?.orcamentosAbertos,
      to: "/orcamentos",
    },
    {
      label: "OS em andamento",
      value: resumo?.osAndamento,
      to: "/os",
    },
    {
      label: "Materiais em baixa",
      value: resumo?.baixaEstoque,
      to: "/materiais",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Olá, {user?.nome}</h1>
          <p className="text-sm text-muted-foreground">
            Resumo das operações
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          Sair
        </Button>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {itens.map((item) => (
          <a key={item.label} href={item.to} className="contents">
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <span className="text-3xl font-bold">
                  {item.value === undefined ? "–" : item.value}
                </span>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
