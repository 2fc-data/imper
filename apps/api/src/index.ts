import express from "express";
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

fs.mkdirSync(config.uploadsDir, { recursive: true });

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(config.uploadsDir));

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

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`API ImperMeab escutando em http://localhost:${config.port}`);
});
