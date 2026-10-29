import { lingui } from '@lingui/vite-plugin'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import viteTsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['macros'],
      },
    }),
    lingui(),
    viteTsconfigPaths(),
  ],
  resolve: {
    alias: [
      {
        find: '@/state/atoms',
        replacement: fileURLToPath(
          new URL('./fixtures/token-logo-state.ts', import.meta.url)
        ),
      },
      {
        find: /^\.\/price-chart-atoms$/,
        replacement: fileURLToPath(
          new URL('./fixtures/price-chart-atoms.ts', import.meta.url)
        ),
      },
    ],
    dedupe: ['react', 'react-dom'],
  },
})
