import type { LinguiConfig } from '@lingui/conf'

const config: LinguiConfig = {
  locales: ['en', 'es', 'ko', 'zh', 'pseudo'],
  pseudoLocale: 'pseudo',
  fallbackLocales: {
    default: 'en',
  },
  catalogs: [
    {
      path: 'src/locales/{locale}',
      include: ['<rootDir>/src'],
    },
  ],
}

export default config
