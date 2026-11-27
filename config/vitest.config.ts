import {fileURLToPath} from 'node:url'
import react from '@vitejs/plugin-react'
import {defineConfig} from 'vitest/config'
import coverageFloors from './coverage-floors.json' with {type: 'json'}

const root = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  root,
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}', 'api/**/*.test.ts'],
    environment: 'happy-dom',
    setupFiles: ['config/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/**/*.{ts,tsx}', 'api/**/*.ts'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.d.ts',
        'src/shared/config/generated.ts',
        'src/app/main.tsx',
        'src/vite-env.d.ts',
        'scripts/api-test.ts',
        'api/endpoints/**',
      ],
      thresholds: coverageFloors,
    },
  },
})
