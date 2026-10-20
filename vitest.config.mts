import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    passWithNoTests: true,
    // Inline ESM-only packages that jsdom transitively requires via CJS
    // (html-encoding-sniffer → @exodus/bytes) to avoid ERR_REQUIRE_ESM on Node 22
    server: {
      deps: {
        inline: ['@exodus/bytes'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
})
