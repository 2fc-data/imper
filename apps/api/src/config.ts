import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const config = {
  port: Number(process.env.PORT || 3333),
  jwtSecret: process.env.JWT_SECRET || "imper-dev-secret",
  jwtExpires: process.env.JWT_EXPIRES || "12h",
  uploadsDir: path.resolve(process.cwd(), "uploads"),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://localhost:3333",
  turnstileSecret: process.env.TURNSTILE_SECRET || "",
  resetTokenExpiresMin: Number(process.env.RESET_TOKEN_EXPIRES_MIN || 60),
  isDev: process.env.NODE_ENV !== "production",
};
