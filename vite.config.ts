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
    'process.env.GIT_SHA': JSON.stringify(process.env.GIT_SHA || 'development'),
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  resolve: {
    alias: {
      components: path.resolve('src/components/'),
      types: path.resolve('src/types/'),
      utils: path.resolve('src/utils/'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: { exclude: ['ts-node'] },
  server: {
    port: 3000,
  },
  test: {
    include: ['src/lib/**/*.test.{ts,.tsx}'],
    globals: true,
    environment: 'node',
  },
})
