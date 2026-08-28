import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const apiUrl = process.env.VITE_API_URL || "";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon_imper.webp"],
      manifest: {
        name: "ImperMeab - Gestão de Impermeabilização",
        short_name: "ImperMeab",
        description:
          "Gestão de serviços de impermeabilização",
        theme_color: "#0f172a",
        background_color: "#f8fafc",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/favicon_imper.webp",
            sizes: "any",
            type: "image/webp",
            purpose: "any",
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: apiUrl ? {
      "/auth": { target: apiUrl, changeOrigin: true },
      "/usuarios": { target: apiUrl, changeOrigin: true },
      "/atendimentos": { target: apiUrl, changeOrigin: true },
      "/visitas": { target: apiUrl, changeOrigin: true },
      "/orcamentos": { target: apiUrl, changeOrigin: true },
      "/os": { target: apiUrl, changeOrigin: true },
      "/materiais": { target: apiUrl, changeOrigin: true },
      "/separacoes": { target: apiUrl, changeOrigin: true },
      "/compras": { target: apiUrl, changeOrigin: true },
      "/financeiro": { target: apiUrl, changeOrigin: true },
      "/config": { target: apiUrl, changeOrigin: true },
      "/notificacoes": { target: apiUrl, changeOrigin: true },
      "/dashboard": { target: apiUrl, changeOrigin: true },
      "/cliente": { target: apiUrl, changeOrigin: true },
      "/publico": { target: apiUrl, changeOrigin: true },
      "/servicos-admin": { target: apiUrl, changeOrigin: true },
      "/agendamentos": { target: apiUrl, changeOrigin: true },
      "/equipamentos": { target: apiUrl, changeOrigin: true },
      "/manutencoes": { target: apiUrl, changeOrigin: true },
      "/epis": { target: apiUrl, changeOrigin: true },
      "/rbac": { target: apiUrl, changeOrigin: true },
      "/uploads": { target: apiUrl, changeOrigin: true },
    } : undefined,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
