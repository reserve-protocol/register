import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { lingui } from '@lingui/vite-plugin'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST
const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          // Skip lingui macros in test - we mock @lingui/macro directly
          ...(!isTest ? ['macros'] : []),
          // Only include locator in development - breaks React internals in prod
          ...(isDev ? [['@locator/babel-jsx/dist', { env: 'development' }]] : []),
        ],
      },
    }),
    // Skip lingui plugin in test - interferes with vi.mock
    ...(!isTest ? [lingui()] : []),
    viteTsconfigPaths(), // Resolves tsconfig paths (@/, utils/, etc.)
    viteStaticCopy({
      targets: [
        { src: 'node_modules/@reserve-protocol/rtokens/images/*', dest: 'svgs' },
        { src: '_headers', dest: '' }, // Cloudflare security headers
      ],
    }),
    sentryVitePlugin({ org: 'abc-labs-0g', project: 'register' }),
  ],

  define: {
    'import.meta.env.VITE_GIT_SHA': JSON.stringify(process.env.CF_PAGES_COMMIT_SHA),
  },

  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined

          // Wallet stack: ~4MB self-contained chunk
          // These packages form a cohesive unit and don't import from app code
          if (
            id.includes('/wagmi/') ||
            id.includes('/@wagmi/') ||
            id.includes('/viem/') ||
            id.includes('/@rainbow-me/rainbowkit') ||
            id.includes('/@walletconnect/') ||
            id.includes('/@coinbase/wallet-sdk') ||
            id.includes('/@reown/')
          ) {
            return 'wallet'
          }

          // Let Vite handle everything else to avoid circular deps
          return undefined
        },
      },
    },
  },

  // Aliases handled by viteTsconfigPaths - no need to duplicate here

  optimizeDeps: {
    exclude: ['ts-node'],
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
    ],
  },

  server: {
    port: 3000,
  },

  test: {
    include: ['src/**/tests/**/*.test.{ts,tsx}'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setup-tests.ts'],
  },
})
