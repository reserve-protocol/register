import { defineConfig } from 'vite'
import { reactRouter } from '@react-router/dev/vite'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'
import { lingui } from '@lingui/vite-plugin'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import macrosPlugin from 'vite-plugin-babel-macros'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRouter(),
    macrosPlugin(),
    lingui(),
    viteTsconfigPaths(),
    // viteStaticCopy({
    //   targets: [
    //     {
    //       src: 'node_modules/@reserve-protocol/rtokens/images/*',
    //       dest: 'svgs',
    //     },
    //     {
    //       src: '_headers',
    //       dest: '',
    //     },
    //   ],
    // }),
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
  ],
  resolve: {
    alias: {
      components: path.resolve('src/components/'),
      types: path.resolve('src/types/'),
      utils: path.resolve('src/utils/'),
    },
  },
  optimizeDeps: { exclude: ['ts-node'] },
  server: {
    port: 3000,
  },
})
