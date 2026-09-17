import { lingui } from '@lingui/vite-plugin'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { defineConfig } from 'vite'

const projectRoot = process.cwd()
const entryRoot = resolve(
  projectRoot,
  'src/views/internal/design-system/standalone'
)

export default defineConfig({
  root: entryRoot,
  publicDir: resolve(entryRoot, 'public'),
  plugins: [
    react({
      babel: {
        plugins: ['macros'],
      },
    }),
    lingui(),
    viteTsconfigPaths({ projects: [resolve(projectRoot, 'tsconfig.json')] }),
    viteStaticCopy({
      targets: [
        {
          src: resolve(projectRoot, 'public/favicon.ico'),
          dest: '.',
        },
        {
          src: resolve(projectRoot, 'public/fonts/TWKLausanne-*.otf'),
          dest: 'fonts',
        },
        {
          src: [
            resolve(projectRoot, 'public/imgs/beefy.png'),
            resolve(projectRoot, 'public/imgs/bnb.png'),
            resolve(projectRoot, 'public/imgs/cmc20.png'),
            resolve(projectRoot, 'public/imgs/curve.png'),
          ],
          dest: 'imgs',
        },
        {
          src: resolve(projectRoot, 'public/imgs/socials/zindex.png'),
          dest: 'imgs/socials',
        },
        {
          src: resolve(projectRoot, 'public/svgs'),
          dest: '.',
        },
      ],
    }),
  ],
  define: {
    'import.meta.env.VITE_DESIGN_SYSTEM_STANDALONE': JSON.stringify('true'),
    'import.meta.env.VITE_GIT_SHA': JSON.stringify(
      process.env.CF_PAGES_COMMIT_SHA ?? ''
    ),
  },
  build: {
    outDir: resolve(projectRoot, 'build/design-system'),
    emptyOutDir: true,
    manifest: true,
    sourcemap: true,
    rollupOptions: {
      input: resolve(entryRoot, 'index.html'),
    },
  },
  resolve: {
    alias: [
      {
        find: './component-detail-entry',
        replacement: resolve(entryRoot, 'component-detail.tsx'),
      },
      {
        find: '@/components/token-logo',
        replacement: resolve(entryRoot, 'token-logo.tsx'),
      },
      { find: 'node-fetch', replacement: 'cross-fetch' },
    ],
    dedupe: ['react', 'react-dom'],
  },
  server: {
    host: '127.0.0.1',
    port: 3055,
  },
})
