import path from "path";
import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";
import {apiPlugin} from "./vite-plugin-api";

export default defineConfig({
  plugins: [react(), apiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
  },
});
