import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { atom, useAtomValue } from 'jotai'
import { ReactNode, useCallback, useEffect, useState } from 'react'

type SupportedLocale = 'en' | 'es' | 'pseudo'

export const DEFAULT_LOCALE: SupportedLocale = 'en'

const catalogs = {
  // Import .po files so the Lingui Vite plugin can transform them to ESM in dev.
  en: () => import('./locales/en.po'),
  es: () => import('./locales/es.po'),
} as const satisfies Record<Exclude<SupportedLocale, 'pseudo'>, () => Promise<any>>

export async function dynamicActivate(locale: SupportedLocale) {
  if (locale === 'pseudo') {
    i18n.load(locale, {})
    i18n.activate(locale)
    return
  }

  const catalogModule = await catalogs[locale]()
  const messages = catalogModule.messages ?? catalogModule.default?.messages ?? {}

  i18n.load(locale, messages)
  i18n.activate(locale)
}

export const localeAtom = atom(DEFAULT_LOCALE)

export default function LanguageProvider({
  children,
}: {
  children: ReactNode
}) {
  const locale = useAtomValue(localeAtom)
  const [ready, setReady] = useState(false)

  const onActivate = useCallback((locale: SupportedLocale) => {
    document.documentElement.setAttribute('lang', locale)
  }, [])

  useEffect(() => {
    setReady(false)

    dynamicActivate(locale)
      .then(() => {
        onActivate?.(locale)
        setReady(true)
      })
      .catch((error) => {
        console.error('Failed to activate locale', locale, error)
        setReady(true)
      })
  }, [locale, onActivate])

  if (!ready) return null

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}
