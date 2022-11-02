import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { atom, useAtomValue } from 'jotai'
import { en, es, PluralCategory } from 'make-plural/plurals'
import { ReactNode, useCallback, useEffect } from 'react'

const SUPPORTED_LOCALES = [
  // order as they appear in the language dropdown
  'en-US',
  'es-ES',
]

type SupportedLocale = typeof SUPPORTED_LOCALES[number] | 'pseudo'
type LocalePlural = {
  [key in SupportedLocale]: (
    n: number | string,
    ord?: boolean
  ) => PluralCategory
}

export const DEFAULT_LOCALE: SupportedLocale = 'en-US'

const plurals: LocalePlural = {
  'en-US': en,
  'es-ES': es,
  pseudo: en,
}

export async function dynamicActivate(locale: SupportedLocale) {
  i18n.loadLocaleData(locale, { plurals: () => plurals[locale] })
  try {
    const catalog = await import(`locales/${locale}.js`)
    // Bundlers will either export it as default or as a named export named default.
    i18n.load(locale, catalog.messages || catalog.default.messages)
  } catch {}
  i18n.activate(locale)
}

interface ProviderProps {
  locale: SupportedLocale
  forceRenderAfterLocaleChange?: boolean
  onActivate?: (locale: SupportedLocale) => void
  children: ReactNode
}

export function Provider({
  locale,
  forceRenderAfterLocaleChange = true,
  onActivate,
  children,
}: ProviderProps) {
  useEffect(() => {
    dynamicActivate(locale)
      .then(() => onActivate?.(locale))
      .catch((error) => {
        console.error('Failed to activate locale', locale, error)
      })
  }, [locale, onActivate])

  if (i18n.locale === undefined && locale === DEFAULT_LOCALE) {
    i18n.loadLocaleData(DEFAULT_LOCALE, {
      plurals: () => plurals[DEFAULT_LOCALE],
    })
    i18n.load(DEFAULT_LOCALE, {})
    i18n.activate(DEFAULT_LOCALE)
  }

  return (
    <I18nProvider
      forceRenderOnLocaleChange={forceRenderAfterLocaleChange}
      i18n={i18n}
    >
      {children}
    </I18nProvider>
  )
}

dynamicActivate(DEFAULT_LOCALE)

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

  return (
    <Provider
      forceRenderAfterLocaleChange={false}
      onActivate={onActivate}
      locale={locale}
    >
      {children}
    </Provider>
  )
}
