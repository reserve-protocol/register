declare module 'mixpanel-browser/src/loaders/loader-module-core'

declare module '*.po' {
  import type { Messages } from '@lingui/core'

  export const messages: Messages
}
