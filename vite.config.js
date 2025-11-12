// @ts-check

import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootDir = path.dirname(new URL(import.meta.url).pathname);

/** @type {import("vite").UserConfigExport} */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
  define: {
    global: "globalThis",
  },
});
