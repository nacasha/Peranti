import { fileURLToPath, URL } from "url";
import { readFileSync } from 'fs';
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const packageJson = JSON.parse(readFileSync('./package.json').toString())

  return {
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version)
    },

    plugins: [
      react(),

      nodePolyfills({
        globals: {
          process: true,
        },
      }),
    ],

    css: {
      preprocessorOptions: {
        scss: {
          // Vite 4 can only drive Sass through its legacy JS API, so the
          // deprecation notice is about Vite's internals, not our stylesheets,
          // and there is nothing actionable in it until Vite is upgraded.
          silenceDeprecations: ["legacy-js-api"]
        }
      }
    },

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
        { find: "src", replacement: fileURLToPath(new URL("./src", import.meta.url)) }
      ]
    },
  }
});
