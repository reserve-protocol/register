import type { LinguiConfig } from '@lingui/conf'

const config: LinguiConfig = {
  locales: ['en', 'es'],
  catalogs: [
    {
      path: 'src/locales/{locale}',
      include: ['<rootDir>/src'],
    },
  ],
}

export default config
