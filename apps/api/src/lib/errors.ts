import { NextFunction, Request, RequestHandler, Response } from "express";

export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "not_found", message: "Rota não encontrada" });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message, details: err.details });
    return;
  }
  const e = err as { name?: string; message?: string };
  if (e?.name === "PrismaClientKnownRequestError") {
    res.status(400).json({ error: "database", message: e.message });
    return;
  }
  if (e?.name === "MulterError") {
    res.status(400).json({ error: "upload", message: e.message });
    return;
  }
  res.status(500).json({ error: "internal", message: e?.message || "Erro interno" });
}

export function wrap(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
