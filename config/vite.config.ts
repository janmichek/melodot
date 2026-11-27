import path from 'node:path'
import {fileURLToPath} from 'node:url'
import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'
import {apiPlugin} from '../vite-plugin-api'

const root = fileURLToPath(new URL('..', import.meta.url))
const e2eMock = process.env.VITE_E2E === '1'

export default defineConfig({
  root,
  plugins: [react(), apiPlugin()],
  resolve: {
    alias: [
      ...(e2eMock
        ? [
            {
              find: /^@web3auth\/modal\/react\/wagmi$/,
              replacement: path.resolve(root, './src/shared/config/e2e-wagmi.tsx'),
            },
            {
              find: /^@web3auth\/modal\/react$/,
              replacement: path.resolve(root, './src/shared/config/e2e-web3auth.ts'),
            },
          ]
        : []),
      {find: '@', replacement: path.resolve(root, './src')},
    ],
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
