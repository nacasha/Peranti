import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    vanillaExtractPlugin({
      // configuration
    }),
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },

  resolve: {
    alias: [
      { find: 'src', replacement: fileURLToPath(new URL('./src', import.meta.url)) }
    ]
  }
}));
