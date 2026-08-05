import { z } from "zod";
import { AppError } from "./errors";

export function parseBody<T extends z.ZodType>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new AppError(400, "Dados inválidos", result.error.flatten());
  }
  return result.data;
}

export function parseParams<T extends z.ZodType>(schema: T, params: unknown): z.infer<T> {
  const result = schema.safeParse(params);
  if (!result.success) {
    throw new AppError(400, "Parâmetros inválidos", result.error.flatten());
  }
  return result.data;
}

export function parseQuery<T extends z.ZodType>(schema: T, query: unknown): z.infer<T> {
  const result = schema.safeParse(query);
  if (!result.success) {
    throw new AppError(400, "Query inválida", result.error.flatten());
  }
  return result.data;
}
