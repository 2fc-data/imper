import { Router } from "express";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { dashboardService } from "../services/dashboard.service";

const router = Router();

router.get("/resumo", authMiddleware("ADMIN", "SUPERVISOR", "ATENDENTE"), wrap(async (_req, res) => {
  res.json(await dashboardService.resumo());
}));

router.get("/kanban", authMiddleware("ADMIN", "SUPERVISOR"), wrap(async (_req, res) => {
  res.json(await dashboardService.kanbanOs());
}));

export default router;
