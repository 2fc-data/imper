import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";

import { config } from "./config";
import { errorHandler, notFoundHandler } from "./lib/errors";

import authRoutes from "./routes/auth.routes";
import usuariosRoutes from "./routes/usuarios.routes";
import atendimentosRoutes from "./routes/atendimentos.routes";
import visitasRoutes from "./routes/visitas.routes";
import orcamentosRoutes from "./routes/orcamentos.routes";
import osRoutes from "./routes/os.routes";
import materiaisRoutes from "./routes/materiais.routes";
import separacoesRoutes from "./routes/separacoes.routes";
import comprasRoutes from "./routes/compras.routes";
import financeiroRoutes from "./routes/financeiro.routes";
import configRoutes from "./routes/config.routes";
import notificacoesRoutes from "./routes/notificacoes.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import clienteRoutes from "./routes/cliente.routes";
import publicoRoutes from "./routes/publico.routes";
import servicosAdminRoutes from "./routes/servicosAdmin.routes";
import agendamentosRoutes from "./routes/agendamentos.routes";
import equipamentosRoutes from "./routes/equipamentos.routes";
import manutencoesRoutes from "./routes/manutencoes.routes";
import episRoutes from "./routes/epis.routes";
import papeisRoutes from "./routes/papeis.routes";

fs.mkdirSync(config.uploadsDir, { recursive: true });

const app = express();

app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://darkseagreen-eagle-232257.hostingersite.com",
    "https://cornflowerblue-stork-313024.hostingersite.com",
  ],
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(config.uploadsDir));
app.use(express.static(path.resolve(__dirname, "../../web/dist")));

app.use("/auth", authRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/atendimentos", atendimentosRoutes);
app.use("/visitas", visitasRoutes);
app.use("/orcamentos", orcamentosRoutes);
app.use("/os", osRoutes);
app.use("/materiais", materiaisRoutes);
app.use("/separacoes", separacoesRoutes);
app.use("/compras", comprasRoutes);
app.use("/financeiro", financeiroRoutes);
app.use("/config", configRoutes);
app.use("/notificacoes", notificacoesRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/cliente", clienteRoutes);
app.use("/publico", publicoRoutes);
app.use("/servicos-admin", servicosAdminRoutes);
app.use("/agendamentos", agendamentosRoutes);
app.use("/equipamentos", equipamentosRoutes);
app.use("/manutencoes", manutencoesRoutes);
app.use("/epis", episRoutes);
app.use("/rbac", papeisRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

const webDist = path.resolve(__dirname, "../../web/dist");
const spaIndex = path.join(webDist, "index.html");
// console.log(`SPA dist: ${webDist} (exists: ${fs.existsSync(webDist)})`);

const API_PREFIXES = ["/auth", "/usuarios", "/rbac", "/health", "/uploads", "/publico"];
app.get("*path", (req, res, next) => {
  if (API_PREFIXES.some((p) => req.path.startsWith(p))) return next();
  if (fs.existsSync(spaIndex)) {
    res.sendFile(spaIndex);
  } else {
    res.status(404).json({ error: "spa_not_found", message: "Frontend não encontrado" });
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, "0.0.0.0", () => {
  console.log(`API Impermeab escutando em http://0.0.0.0:${config.port}`);
});
