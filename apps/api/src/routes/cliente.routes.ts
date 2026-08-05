import { Router } from "express";
import { wrap } from "../lib/errors";
import { authMiddleware } from "../lib/auth";
import { clienteService } from "../services/cliente.service";

const router = Router();

router.get("/me", authMiddleware("CLIENTE"), wrap(async (req, res) => {
  res.json(await clienteService.me(req.user!.id));
}));

router.get("/os", authMiddleware("CLIENTE"), wrap(async (req, res) => {
  res.json(await clienteService.listarOs(req.user!.id));
}));

export default router;
