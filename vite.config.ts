import tailwindcss from "@tailwindcss/vite";
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — cached aggressively across deploys
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Data layer — changes less often than UI
          "vendor-query": ["@tanstack/react-query"],
          "vendor-supabase": ["@supabase/supabase-js"],
          // Heavy UI primitives — rarely change between deploys
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-popover",
            "@radix-ui/react-tooltip",
          ],
        },
      },
    },
  },
})
