import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const apiUrl = process.env.VITE_API_URL || "http://localhost:3000";

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
    proxy: {
      "/api": { target: apiUrl, changeOrigin: true },
      "/auth": { target: apiUrl, changeOrigin: true },
      "/uploads": { target: apiUrl, changeOrigin: true },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
