import dotenv from "dotenv";
import crypto from "crypto";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const isProd = process.env.NODE_ENV === "production";

export const config = {
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET || (isProd ? (() => { throw new Error("JWT_SECRET must be set in production"); })() : "imper-dev-secret"),
  jwtExpires: process.env.JWT_EXPIRES || "12h",
  uploadsDir: path.resolve(__dirname, "../uploads"),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://localhost:3000",
  turnstileSecret: process.env.TURNSTILE_SECRET || "",
  resetTokenExpiresMin: Number(process.env.RESET_TOKEN_EXPIRES_MIN || 60),
  isDev: !isProd,
  corsOrigins: (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};
