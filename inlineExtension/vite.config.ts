import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyExtensionAssets } from "./vite.extensionCopy";

// Popup build: bundles index.html + React popup UI into dist/
export default defineConfig(({ mode }) => ({
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  plugins: [react(), copyExtensionAssets(mode)],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        assetFileNames: "assets/[name]-[hash].[ext]",
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
      },
    },
  },
}));
