import path from 'node:path'
import {fileURLToPath} from 'node:url'
import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'
import {apiPlugin} from '../vite-plugin-api'

const root = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  root,
  plugins: [react(), apiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(root, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: undefined,
  },
  build: {
    outDir: 'dist',
  },
  define: {
    global: 'globalThis',
  },
})
