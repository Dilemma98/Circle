
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Circle",
        short_name: "Circle",
        description: "Dela minnen med familj och vänner.",
        theme_color: "#17151b",
        background_color: "#17151b",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
      },
    }),
  ],
});
