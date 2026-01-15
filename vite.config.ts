import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { lingui } from '@lingui/vite-plugin'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          'macros', // Lingui macros
          ['@locator/babel-jsx/dist', { env: 'development' }], // Click-to-source in dev
        ],
      },
    }),
    lingui(),
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

          // Core React - rarely changes, cache separately
          if (id.includes('react-dom')) return 'react-dom'
          if (id.includes('react') && !id.includes('react-')) return 'react'

          // Wallet stack - large, updates together
          if (id.includes('@rainbow-me/rainbowkit')) return 'wallet'
          if (id.includes('wagmi') || id.includes('@wagmi')) return 'wallet'
          if (id.includes('viem')) return 'wallet'
          if (id.includes('@walletconnect')) return 'wallet'
          if (id.includes('@coinbase/wallet-sdk')) return 'wallet'

          // UI libraries
          if (id.includes('@radix-ui')) return 'ui'
          if (id.includes('recharts')) return 'ui'

          // Data/state management
          if (id.includes('@tanstack')) return 'data'
          if (id.includes('jotai')) return 'data'
          if (id.includes('graphql')) return 'data'

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
