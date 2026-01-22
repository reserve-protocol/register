import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { lingui } from '@lingui/vite-plugin'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          // Skip lingui macros in test - we mock @lingui/macro directly
          ...(!isTest ? ['macros'] : []),
          ['@locator/babel-jsx/dist', { env: 'development' }], // Click-to-source in dev
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

          // Wallet stack - large, updates together (check first, most specific)
          if (
            id.includes('@rainbow-me/rainbowkit') ||
            id.includes('wagmi') ||
            id.includes('@wagmi') ||
            id.includes('viem') ||
            id.includes('@walletconnect') ||
            id.includes('@coinbase/wallet-sdk') ||
            id.includes('@reown/') ||
            id.includes('ox/_esm') // viem dependency
          ) {
            return 'wallet'
          }

          // Core React - check after wallet to avoid circular deps
          if (id.includes('/react-dom/')) return 'react-dom'
          if (id.includes('/react/') && !id.includes('react-')) return 'react'

          // UI libraries
          if (id.includes('@radix-ui') || id.includes('recharts')) return 'ui'

          // Data/state management
          if (
            id.includes('@tanstack') ||
            id.includes('jotai') ||
            id.includes('graphql')
          ) {
            return 'data'
          }

          // Legacy - can remove when ethers is fully removed
          if (id.includes('ethers')) return 'ethers'

          // Everything else goes to vendor chunk
          return 'vendor'
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
