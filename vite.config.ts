import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'
import { lingui } from '@lingui/vite-plugin'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          'macros',
          [
            '@locator/babel-jsx/dist',
            {
              env: 'development',
            },
          ],
        ],
      },
    }),
    lingui(),
    viteTsconfigPaths(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@reserve-protocol/rtokens/images/*',
          dest: 'svgs',
        },
        {
          src: '_headers',
          dest: '',
        },
      ],
    }),
    {
      name: 'configure-response-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader('X-Frame-Options', 'SAMEORIGIN')
          res.setHeader(
            'Strict-Transport-Security',
            'max-age=63072000; includeSubDomains; preload'
          )
          res.setHeader(
            'Content-Security-Policy',
            "object-src 'none'; base-uri 'self'; frame-ancestors 'none';"
          )
          next()
        })
      },
    },
    sentryVitePlugin({
      org: 'abc-labs-0g',
      project: 'register',
    }),
  ],
  define: {
    'import.meta.env.VITE_GIT_SHA': JSON.stringify(
      process.env.CF_PAGES_COMMIT_SHA
    ),
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Skip non-node_modules
          if (!id.includes('node_modules')) {
            return undefined
          }

          // Core React dependencies
          if (id.includes('react-dom')) {
            return 'react-dom'
          }
          if (id.includes('react') && !id.includes('react-')) {
            return 'react'
          }

          // Large libraries that should be separate
          if (id.includes('@rainbow-me/rainbowkit')) {
            return 'rainbowkit'
          }
          if (id.includes('wagmi') || id.includes('@wagmi')) {
            return 'wagmi'
          }
          if (id.includes('viem')) {
            return 'viem'
          }
          if (id.includes('@walletconnect')) {
            return 'walletconnect'
          }
          if (id.includes('@coinbase/wallet-sdk')) {
            return 'coinbase'
          }

          // UI libraries
          if (id.includes('@radix-ui')) {
            return 'radix-ui'
          }
          if (id.includes('recharts')) {
            return 'charts'
          }

          // Other vendor libs
          if (id.includes('ethers')) {
            return 'ethers'
          }
          if (id.includes('@tanstack')) {
            return 'tanstack'
          }
          if (id.includes('jotai')) {
            return 'jotai'
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      components: path.resolve('src/components/'),
      types: path.resolve('src/types/'),
      utils: path.resolve('src/utils/'),
      '@': path.resolve(__dirname, './src'),
    },
  },
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
    esbuildOptions: {
      target: 'es2020',
      // Help with tree shaking
      treeShaking: true,
    },
  },
  server: {
    port: 3000,
  },
})
