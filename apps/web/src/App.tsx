import { type ReactNode, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { Papel } from "@imper/shared";
import { homeFor } from "./lib/nav";
import { AdminLayout } from "./components/layout/AdminLayout";
import {
  AtendimentosSidebar,
  ClienteSidebar,
  DashboardSidebar,
  EmBreveSidebar,
  OrcamentosSidebar,
  OSSidebar,
  ServicosSidebar,
  UsuariosSidebar,
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
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { AtendimentosAdminPage } from "./pages/AtendimentosAdminPage";
import { OrcamentosAdminPage } from "./pages/OrcamentosAdminPage";
import { OSAdminPage } from "./pages/OSAdminPage";
import ServicosAdminPage from "./pages/ServicosAdminPage";

function ProtectedLayout({
  children,
  allowedRoles,
  sidebar,
}: {
  children: ReactNode;
  allowedRoles?: Papel[];
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

  if (allowedRoles && !allowedRoles.includes(user.papel)) {
    return <Navigate to={homeFor(user.papel)} replace />;
  }

  return (
    <AdminLayout sidebar={sidebar}>{children}</AdminLayout>
  );
}

function UsuariosRoute() {
  const [filtroPapel, setFiltroPapel] = useState<Papel | null>(null);

  return (
    <ProtectedLayout
      allowedRoles={[Papel.ADMIN, Papel.SUPERVISOR]}
      sidebar={
        <UsuariosSidebar valor={filtroPapel} onChange={setFiltroPapel} />
      }
    >
      <UsuariosPage filtroPapel={filtroPapel ?? undefined} />
    </ProtectedLayout>
  );
}

function AtendimentosRoute() {
  const [viewAtiva, setViewAtiva] = useState<"analises" | "lista" | "novo">("lista");

  return (
    <ProtectedLayout
      allowedRoles={[Papel.ADMIN, Papel.SUPERVISOR, Papel.ATENDENTE]}
      sidebar={<AtendimentosSidebar viewAtiva={viewAtiva} onNavegar={setViewAtiva} />}
    >
      <AtendimentosAdminPage key={viewAtiva} initialView={viewAtiva} onNavegar={setViewAtiva} />
    </ProtectedLayout>
  );
}

function OrcamentosRoute() {
  const [viewAtiva, setViewAtiva] = useState<"analises" | "lista" | "novo">("lista");

  return (
    <ProtectedLayout
      allowedRoles={[Papel.ADMIN, Papel.SUPERVISOR, Papel.ATENDENTE, Papel.CONTABILIDADE]}
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
      allowedRoles={[
        Papel.ADMIN,
        Papel.SUPERVISOR,
        Papel.ATENDENTE,
        Papel.TECNICO,
        Papel.ALMOXARIFE,
        Papel.CONTABILIDADE,
      ]}
      sidebar={<OSSidebar viewAtiva={viewAtiva} onNavegar={setViewAtiva} />}
    >
      <OSAdminPage key={viewAtiva} viewAtiva={viewAtiva} onGoToOrcamentos={() => navigate("/orcamentos")} />
    </ProtectedLayout>
  );
}

function GuestsOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={homeFor(user.papel)} replace />;
  return <>{children}</>;
}

function CatchAllRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? homeFor(user.papel) : "/login"} replace />;
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
      <Route
        element={
          <ProtectedLayout
            allowedRoles={[Papel.ADMIN, Papel.SUPERVISOR]}
            sidebar={<ServicosSidebar />}
          >
            <ServicosAdminPage />
          </ProtectedLayout>
        }
        path="/servicos-admin"
      />
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
            allowedRoles={[
              Papel.ADMIN,
              Papel.SUPERVISOR,
              Papel.ATENDENTE,
              Papel.TECNICO,
              Papel.ALMOXARIFE,
              Papel.CONTABILIDADE,
            ]}
            sidebar={<DashboardSidebar />}
          >
            <DashboardPage />
          </ProtectedLayout>
        }
      />
      <Route element={<AtendimentosRoute />} path="/atendimentos" />
      <Route element={<OrcamentosRoute />} path="/orcamentos" />
      <Route element={<OSRoute />} path="/os" />
      <Route
        element={
          <ProtectedLayout
            allowedRoles={[Papel.ADMIN, Papel.SUPERVISOR, Papel.TECNICO, Papel.ALMOXARIFE]}
            sidebar={
              <EmBreveSidebar texto="Gestão de materiais e estoque em breve." />
            }
          >
            <PlaceholderPage
              title="Materiais"
              description="Gestão de materiais e estoque (em breve)"
            />
          </ProtectedLayout>
        }
        path="/materiais"
      />
      <Route
        element={
          <ProtectedLayout
            allowedRoles={[Papel.CLIENTE]}
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
