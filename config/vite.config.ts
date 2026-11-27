import path from 'node:path'
import {fileURLToPath} from 'node:url'
import react from '@vitejs/plugin-react'
import {defineConfig, loadEnv} from 'vite'
import {apiPlugin} from '../vite-plugin-api'

const root = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig(({mode}) => {
  // The local Vite API plugin runs in this process. Load all .env values into
  // process.env so server-side secrets (VERIFICATION_SECRET, RAPIDAPI_KEY,
  // CLAIM_SIGNER_PRIVATE_KEY) are available in dev, exactly as Vercel does.
  const env = loadEnv(mode, root, '')
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) {process.env[key] = value}
  }

  const e2eMock = process.env.VITE_E2E === '1'

  return {
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
    },
    build: {
      outDir: 'dist',
    },
    define: {
      global: 'globalThis',
    },
  }
})
