import tailwindcss from "@tailwindcss/vite";
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    css: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["node_modules", "dist", "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["node_modules/", "src/test/", "**/*.d.ts", "**/*.config.*"],
    },
  },
  build: {
    // Vite 8 (Rolldown) renamed this from rollupOptions and requires
    // manualChunks as a function, not the old { chunkName: [pkgs] } object.
    rolldownOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return;
          // Core React runtime — cached aggressively across deploys
          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/react-router-dom/")
          ) {
            return "vendor-react";
          }
          // Data layer — changes less often than UI
          if (id.includes("/node_modules/@tanstack/react-query")) {
            return "vendor-query";
          }
          // Heavy UI primitives — rarely change between deploys
          if (
            [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-select",
              "@radix-ui/react-tabs",
              "@radix-ui/react-popover",
              "@radix-ui/react-tooltip",
            ].some((pkg) => id.includes(`/node_modules/${pkg}/`))
          ) {
            return "vendor-ui";
          }
        },
      },
    },
  },
})
