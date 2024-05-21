import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import svgrPlugin from 'vite-plugin-svgr'
import path from 'path'
import { lingui } from '@lingui/vite-plugin'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({ babel: { plugins: ['macros'] } }),
    lingui(),
    viteTsconfigPaths(),
    svgrPlugin(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@reserve-protocol/rtokens/images/*',
          dest: 'svgs',
        },
      ],
    }),
  ],
  build: {
    outDir: 'build',
  },
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
