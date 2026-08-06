import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(dir, "src"),
      "@assets": path.resolve(dir, "../../attached_assets"),
    },
  },
  build: {
    outDir: "dist/public",
    emptyOutDir: true,
  },
});
