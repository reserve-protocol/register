import type { StorybookConfig } from '@storybook/react-vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-themes', '@storybook/addon-a11y'],
  staticDirs: ['../public'],

  viteFinal: async (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': resolve(projectRoot, 'src'),
      // Bare module imports used in legacy code
      components: resolve(projectRoot, 'src/components'),
      hooks: resolve(projectRoot, 'src/hooks'),
      state: resolve(projectRoot, 'src/state'),
      utils: resolve(projectRoot, 'src/utils'),
      types: resolve(projectRoot, 'src/types'),
      views: resolve(projectRoot, 'src/views'),
      abis: resolve(projectRoot, 'src/abis'),
    }

    config.define = {
      ...config.define,
      'import.meta.env.VITE_WALLETCONNECT_ID': JSON.stringify(''),
      'import.meta.env.VITE_GIT_SHA': JSON.stringify('storybook'),
    }

    return config
  },
}

export default config
