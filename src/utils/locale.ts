import { i18n } from '@lingui/core'

// Maps our app locale (Lingui's active locale) to the codes each formatting
// library expects. Unknown / 'pseudo' fall back to English (there is no pseudo
// date/number locale — pseudo only mangles translated strings).
type LocaleCodes = { date: string; dayjs: string; duration: string }

const LOCALE_CODES: Record<string, LocaleCodes> = {
  en: { date: 'en-US', dayjs: 'en', duration: 'en' },
  es: { date: 'es', dayjs: 'es', duration: 'es' },
  ko: { date: 'ko', dayjs: 'ko', duration: 'ko' },
  zh: { date: 'zh-CN', dayjs: 'zh-cn', duration: 'zh_CN' },
  pseudo: { date: 'en-US', dayjs: 'en', duration: 'en' },
}

const codesFor = (locale: string): LocaleCodes =>
  LOCALE_CODES[locale] ?? LOCALE_CODES.en

// BCP-47 tag for Intl / `toLocale*` date formatting, from the active locale.
export const dateLocale = (): string => codesFor(i18n.locale).date

// humanize-duration language code, from the active locale.
export const durationLocale = (): string => codesFor(i18n.locale).duration

// dayjs locale code for a given app locale (used when activating the locale).
export const dayjsLocaleCode = (locale: string): string => codesFor(locale).dayjs
