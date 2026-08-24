import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const config = {
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET || "imper-dev-secret",
  jwtExpires: process.env.JWT_EXPIRES || "12h",
  uploadsDir: path.resolve(__dirname, "../uploads"),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://localhost:3000",
  turnstileSecret: process.env.TURNSTILE_SECRET || "",
  resetTokenExpiresMin: Number(process.env.RESET_TOKEN_EXPIRES_MIN || 60),
  isDev: process.env.NODE_ENV !== "production",
};
