import type { Config } from '@react-router/dev/config'

export default {
  appDirectory: 'src',
  // Production build uses client side, but if not enabled file copying fails
  ssr: false,
} satisfies Config
