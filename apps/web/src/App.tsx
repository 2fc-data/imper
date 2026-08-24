import { type ReactNode, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

import { homeFor } from "./lib/nav";
import { AdminLayout } from "./components/layout/AdminLayout";
import {
  AtendimentosSidebar,
  AgendamentosSidebar,
  ClienteSidebar,
  DashboardSidebar,
  EpisSidebar,
  EquipamentosSidebar,
  ManutencoesSidebar,
  MateriaisSidebar,
  OrcamentosSidebar,
  OSSidebar,
  ServicosSidebar,
  UsuariosSidebar,
  VisitasSidebar,
  RbacSidebar,
} from "./components/layout/sidebarContent";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import UsuariosPage from "./pages/UsuariosPage";
import MinhaContaPage from "./pages/MinhaContaPage";
import LandingContent from "./pages/LandingContent";
import OrcamentoPage from "./pages/OrcamentoPage";
import { LandingLayout } from "./components/landing/LandingLayout";
import { AtendimentosAdminPage } from "./pages/AtendimentosAdminPage";
import { AgendamentosAdminPage } from "./pages/AgendamentosAdminPage";
import { VisitasAdminPage } from "./pages/VisitasAdminPage";
import { OrcamentosAdminPage } from "./pages/OrcamentosAdminPage";
import { OSAdminPage } from "./pages/OSAdminPage";
import ServicosAdminPage from "./pages/ServicosAdminPage";
import EquipamentosAdminPage from "./pages/EquipamentosAdminPage";
import ManutencoesAdminPage from "./pages/ManutencoesAdminPage";
import EpisAdminPage from "./pages/EpisAdminPage";
import MateriaisAdminPage from "./pages/MateriaisAdminPage";
import RbacAdminPage from "./pages/RbacAdminPage";

function ProtectedLayout({
  children,
  requiredPermissions,
  onlyNoPermissions,
  sidebar,
}: {
  children: ReactNode;
  requiredPermissions?: string[];
  onlyNoPermissions?: boolean;
  sidebar?: ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (onlyNoPermissions && user.permissoes.length > 0) {
    return <Navigate to={homeFor(user.permissoes)} replace />;
  }

  if (requiredPermissions && !requiredPermissions.some((p) => user.permissoes.includes(p))) {
    return <Navigate to={homeFor(user.permissoes)} replace />;
  }

  return (
    <AdminLayout sidebar={sidebar}>{children}</AdminLayout>
  );
}

function UsuariosRoute() {
  const [viewAtiva, setViewAtiva] = useState<"analises" | "lista" | "novo">("lista");

  return (
    <ProtectedLayout
      requiredPermissions={["criar_usuario", "editar_usuario", "definir_perfil"]}
      sidebar={
        <UsuariosSidebar
          viewAtiva={viewAtiva}
          onNavegar={setViewAtiva}
        />
      }
    >
      <UsuariosPage
        key={viewAtiva}
        viewAtiva={viewAtiva}
        onNavegar={setViewAtiva}
      />
    </ProtectedLayout>
  );
}

function AtendimentosRoute() {
  const [viewAtiva, setViewAtiva] = useState<"analises" | "lista" | "novo">("lista");

  return (
    <ProtectedLayout
      requiredPermissions={["criar_atendimento", "editar_atendimento"]}
      sidebar={<AtendimentosSidebar viewAtiva={viewAtiva} onNavegar={setViewAtiva} />}
    >
      <AtendimentosAdminPage key={viewAtiva} initialView={viewAtiva} onNavegar={setViewAtiva} />
    </ProtectedLayout>
  );
}

function AgendamentosRoute() {
  const [viewAtiva, setViewAtiva] = useState<"analises" | "lista" | "novo">("lista");

  return (
    <ProtectedLayout
      requiredPermissions={["criar_atendimento", "editar_atendimento"]}
      sidebar={<AgendamentosSidebar viewAtiva={viewAtiva} onNavegar={setViewAtiva} />}
    >
      <AgendamentosAdminPage key={viewAtiva} initialView={viewAtiva} onNavegar={setViewAtiva} />
    </ProtectedLayout>
  );
}

function VisitasRoute() {
  const [viewAtiva, setViewAtiva] = useState<"analises" | "lista" | "agendar" | "realizar">("lista");

  return (
    <ProtectedLayout
      requiredPermissions={["editar_os", "iniciar_os", "confirmar_obra"]}
      sidebar={<VisitasSidebar viewAtiva={viewAtiva} onNavegar={setViewAtiva} />}
    >
      <VisitasAdminPage key={viewAtiva} initialView={viewAtiva} onNavegar={setViewAtiva} />
    </ProtectedLayout>
  );
}

function OrcamentosRoute() {
  const [viewAtiva, setViewAtiva] = useState<"analises" | "lista" | "novo">("lista");

  return (
    <ProtectedLayout
      requiredPermissions={["aprovar_compra", "ver_financeiro"]}
      sidebar={<OrcamentosSidebar viewAtiva={viewAtiva} onNavegar={setViewAtiva} />}
    >
      <OrcamentosAdminPage key={viewAtiva} initialView={viewAtiva} onNavegar={setViewAtiva} />
    </ProtectedLayout>
  );
}

function OSRoute() {
  const [viewAtiva, setViewAtiva] = useState<"analises" | "lista" | "novo">("lista");
  const navigate = useNavigate();

  return (
    <ProtectedLayout
      requiredPermissions={[
        "criar_os",
        "editar_os",
        "iniciar_os",
        "concluir_os",
        "aprovar_os",
        "entregar_os",
      ]}
      sidebar={<OSSidebar viewAtiva={viewAtiva} onNavegar={setViewAtiva} />}
    >
      <OSAdminPage key={viewAtiva} viewAtiva={viewAtiva} onGoToOrcamentos={() => navigate("/orcamentos")} />
    </ProtectedLayout>
  );
}

function EquipamentosRoute() {
  const [viewAtiva, setViewAtiva] = useState<"analises" | "lista" | "novo" | "catalogos">("lista");

  return (
    <ProtectedLayout
      requiredPermissions={["gerenciar_estoque", "gerenciar_equipamentos"]}
      sidebar={<EquipamentosSidebar viewAtiva={viewAtiva} onNavegar={setViewAtiva} />}
    >
      <EquipamentosAdminPage key={viewAtiva} viewAtiva={viewAtiva} onNavegar={setViewAtiva} />
    </ProtectedLayout>
  );
}

function ManutencoesRoute() {
  const [viewAtiva, setViewAtiva] = useState<"analises" | "lista" | "novo">("lista");

  return (
    <ProtectedLayout
      requiredPermissions={["editar_os", "iniciar_os", "concluir_os"]}
      sidebar={<ManutencoesSidebar viewAtiva={viewAtiva} onNavegar={setViewAtiva} />}
    >
      <ManutencoesAdminPage key={viewAtiva} viewAtiva={viewAtiva} onNavegar={setViewAtiva} />
    </ProtectedLayout>
  );
}

function EpisRoute() {
  const [viewAtiva, setViewAtiva] = useState<
    "analises" | "lista" | "novo" | "catalogos"
  >("lista");

  return (
    <ProtectedLayout
      requiredPermissions={["gerenciar_epis", "gerenciar_estoque"]}
      sidebar={<EpisSidebar viewAtiva={viewAtiva} onNavegar={setViewAtiva} />}
    >
      <EpisAdminPage key={viewAtiva} viewAtiva={viewAtiva} onNavegar={setViewAtiva} />
    </ProtectedLayout>
  );
}

function MateriaisRoute() {
  const [viewAtiva, setViewAtiva] = useState<
    "analises" | "lista" | "novo" | "movimentos"
  >("lista");

  return (
    <ProtectedLayout
      requiredPermissions={["gerenciar_estoque", "criar_material", "entrada_estoque"]}
      sidebar={<MateriaisSidebar viewAtiva={viewAtiva} onNavegar={setViewAtiva} />}
    >
      <MateriaisAdminPage key={viewAtiva} viewAtiva={viewAtiva} onNavegar={setViewAtiva} />
    </ProtectedLayout>
  );
}

function ServicosRoute() {
  const [viewAtiva, setViewAtiva] = useState<"analises" | "lista" | "novo">("lista");

  return (
    <ProtectedLayout
      requiredPermissions={["criar_servico", "editar_servico"]}
      sidebar={<ServicosSidebar viewAtiva={viewAtiva} onNavegar={setViewAtiva} />}
    >
      <ServicosAdminPage key={viewAtiva} viewAtiva={viewAtiva} onNavegar={setViewAtiva} />
    </ProtectedLayout>
  );
}

function RbacRoute() {
  const [viewAtiva, setViewAtiva] = useState<"papeis" | "permissoes">("papeis");

  return (
    <ProtectedLayout
      requiredPermissions={["gerenciar_papeis"]}
      sidebar={<RbacSidebar viewAtiva={viewAtiva} onNavegar={setViewAtiva} />}
    >
      <RbacAdminPage key={viewAtiva} viewAtiva={viewAtiva} onNavegar={setViewAtiva} />
    </ProtectedLayout>
  );
}

function GuestsOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={homeFor(user.permissoes)} replace />;
  return <>{children}</>;
}

function CatchAllRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? homeFor(user.permissoes) : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestsOnly>
            <LoginPage />
          </GuestsOnly>
        }
      />
      <Route
        path="/cadastro"
        element={
          <GuestsOnly>
            <RegisterPage />
          </GuestsOnly>
        }
      />
      <Route
        path="/recuperar-senha"
        element={
          <GuestsOnly>
            <ForgotPasswordPage />
          </GuestsOnly>
        }
      />
      <Route
        path="/redefinir-senha"
        element={
          <GuestsOnly>
            <ResetPasswordPage />
          </GuestsOnly>
        }
      />
      <Route element={<UsuariosRoute />} path="/usuarios" />
      <Route element={<ServicosRoute />} path="/servicos-admin" />
      <Route element={<RbacRoute />} path="/rbac" />
      <Route
        element={
          <LandingLayout>
            <LandingContent />
          </LandingLayout>
        }
        path="/"
      />
      <Route
        element={
          <LandingLayout>
            <LandingContent />
          </LandingLayout>
        }
        path="/servicos"
      />
      <Route
        element={
          <LandingLayout>
            <LandingContent />
          </LandingLayout>
        }
        path="/como-trabalhamos"
      />
      <Route
        element={
          <LandingLayout>
            <LandingContent />
          </LandingLayout>
        }
        path="/area-de-atuacao"
      />
      <Route
        element={
          <LandingLayout>
            <LandingContent />
          </LandingLayout>
        }
        path="/contato"
      />
      <Route
        element={
          <LandingLayout>
            <OrcamentoPage />
          </LandingLayout>
        }
        path="/orcamento"
      />
      <Route
        path="/painel"
        element={
          <ProtectedLayout
            sidebar={<DashboardSidebar />}
          >
            <DashboardPage />
          </ProtectedLayout>
        }
      />
      <Route element={<AtendimentosRoute />} path="/atendimentos" />
      <Route element={<AgendamentosRoute />} path="/agendamentos" />
      <Route element={<VisitasRoute />} path="/visitas" />
      <Route element={<OrcamentosRoute />} path="/orcamentos" />
      <Route element={<OSRoute />} path="/os" />
      <Route element={<EquipamentosRoute />} path="/equipamentos" />
      <Route element={<ManutencoesRoute />} path="/manutencoes" />
      <Route element={<EpisRoute />} path="/epis" />
      <Route element={<MateriaisRoute />} path="/materiais" />
      <Route
        element={
          <ProtectedLayout
            onlyNoPermissions
            sidebar={<ClienteSidebar />}
          >
            <MinhaContaPage />
          </ProtectedLayout>
        }
        path="/minha-conta"
      />
      <Route path="*" element={<CatchAllRedirect />} />
    </Routes>
  );
}
