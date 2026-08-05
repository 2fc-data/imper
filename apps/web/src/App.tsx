import { type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { Papel } from "@imper/shared";
import { AppLayout } from "./components/layout/AppLayout";
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

function homeFor(papel: Papel): string {
  return papel === Papel.CLIENTE ? "/minha-conta" : "/painel";
}

function ProtectedLayout({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: Papel[];
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.papel)) {
    return <Navigate to={homeFor(user.papel)} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
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
      <Route
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
          >
            <UsuariosPage />
          </ProtectedLayout>
        }
        path="/usuarios"
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
          >
            <DashboardPage />
          </ProtectedLayout>
        }
      />
      <Route
        element={
          <ProtectedLayout
            allowedRoles={[
              Papel.ADMIN,
              Papel.SUPERVISOR,
              Papel.ATENDENTE,
            ]}
          >
            <PlaceholderPage
              title="Contatos"
              description="Gestão de contatos e atendimento (em breve)"
            />
          </ProtectedLayout>
        }
        path="/contatos"
      />
      <Route
        element={
          <ProtectedLayout
            allowedRoles={[
              Papel.ADMIN,
              Papel.SUPERVISOR,
              Papel.ATENDENTE,
              Papel.CONTABILIDADE,
            ]}
          >
            <PlaceholderPage
              title="Orçamentos"
              description="Gestão de orçamentos (em breve)"
            />
          </ProtectedLayout>
        }
        path="/orcamentos"
      />
      <Route
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
          >
            <PlaceholderPage
              title="Ordens de Serviço"
              description="Gestão de ordens de serviço (em breve)"
            />
          </ProtectedLayout>
        }
        path="/os"
      />
      <Route
        element={
          <ProtectedLayout
            allowedRoles={[Papel.ADMIN, Papel.SUPERVISOR, Papel.TECNICO, Papel.ALMOXARIFE]}
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
          <ProtectedLayout allowedRoles={[Papel.CLIENTE]}>
            <MinhaContaPage />
          </ProtectedLayout>
        }
        path="/minha-conta"
      />
      <Route path="*" element={<CatchAllRedirect />} />
    </Routes>
  );
}
