import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { atom, useAtomValue } from 'jotai'
import { ReactNode, useCallback, useEffect } from 'react'

type SupportedLocale = 'en' | 'es' | 'pseudo'

export const DEFAULT_LOCALE: SupportedLocale = 'en'

export async function dynamicActivate(locale: SupportedLocale) {
  const { messages } = await import(`./locales/${locale}.po`)

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

  const onActivate = useCallback((locale: SupportedLocale) => {
    document.documentElement.setAttribute('lang', locale)
  }, [])

  useEffect(() => {
    dynamicActivate(locale)
      .then(() => onActivate?.(locale))
      .catch((error) => {
        console.error('Failed to activate locale', locale, error)
      })
  }, [locale, onActivate])

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}
