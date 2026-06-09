import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import 'dayjs/locale/ko'
import 'dayjs/locale/zh-cn'
import { atom, useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { ReactNode, useCallback, useEffect } from 'react'
import { dayjsLocaleCode } from '@/utils/locale'

export type SupportedLocale = 'en' | 'es' | 'ko' | 'zh' | 'pseudo'

export const DEFAULT_LOCALE: SupportedLocale = 'en'

// 'pseudo' is a dev-only debugging locale that mangles every wrapped string,
// making unwrapped (untranslated) text visually obvious.
export const SUPPORTED_LOCALES: SupportedLocale[] = import.meta.env.DEV
  ? ['en', 'es', 'ko', 'zh', 'pseudo']
  : ['en', 'es', 'ko', 'zh']

// Each language's name written in its own language, so the switcher is legible
// no matter which locale is currently active.
export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  es: 'Español',
  ko: '한국어',
  zh: '中文',
  pseudo: 'Pseudo',
}

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return (
    typeof value === 'string' && SUPPORTED_LOCALES.includes(value as SupportedLocale)
  )
}

export async function dynamicActivate(locale: SupportedLocale) {
  const target = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE
  const { messages } = await import(`./locales/${target}.po`)

  i18n.load(target, messages)
  // Keep dayjs in sync before activating, so date formatting is ready when
  // Lingui re-renders its subscribers on activate.
  dayjs.locale(dayjsLocaleCode(target))
  i18n.activate(target)
}

const storedLocaleAtom = atomWithStorage<SupportedLocale>(
  'register.locale',
  DEFAULT_LOCALE,
  undefined,
  { getOnInit: true }
)

// Validates on both read and write so a stale/unsupported persisted value
// (e.g. 'pseudo' in production, or a hand-edited slug) can never reach
// dynamicActivate and trigger the FallbackUI reload loop in app.tsx.
export const localeAtom = atom(
  (get) => {
    const stored = get(storedLocaleAtom)
    return isSupportedLocale(stored) ? stored : DEFAULT_LOCALE
  },
  (_get, set, next: SupportedLocale) => {
    set(storedLocaleAtom, isSupportedLocale(next) ? next : DEFAULT_LOCALE)
  }
)

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
