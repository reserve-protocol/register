import { createStore } from 'jotai'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_LOCALE, isSupportedLocale } from '../i18n'

// localeAtom reads localStorage at module load (atomWithStorage getOnInit),
// so persisted-value tests re-import the module after seeding storage.
const loadI18n = async () => {
  vi.resetModules()
  return await import('../i18n')
}

describe('isSupportedLocale', () => {
  it('accepts supported locales', () => {
    expect(isSupportedLocale('en')).toBe(true)
    expect(isSupportedLocale('es')).toBe(true)
    expect(isSupportedLocale('ko')).toBe(true)
    expect(isSupportedLocale('zh')).toBe(true)
  })

  it('rejects unsupported values', () => {
    expect(isSupportedLocale('fr')).toBe(false)
    expect(isSupportedLocale('')).toBe(false)
    expect(isSupportedLocale(undefined)).toBe(false)
    expect(isSupportedLocale(null)).toBe(false)
    expect(isSupportedLocale(42)).toBe(false)
  })
})

// A stale/hand-edited persisted locale must never reach dynamicActivate —
// it would trigger the FallbackUI reload loop in app.tsx.
describe('localeAtom', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['en-US'])
  })

  it('uses the browser locale when the user has not selected a language', async () => {
    vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['es-ES', 'en-US'])

    const { localeAtom } = await loadI18n()
    const store = createStore()

    expect(store.get(localeAtom)).toBe('es')
  })

  it.each(['zh-TW', 'zh-Hant', 'zh-Hant-CN', 'zh-Hant-SG'])(
    'does not map the Traditional Chinese locale %s to Simplified Chinese',
    async (language) => {
      vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue([language, 'en-US'])

      const { localeAtom } = await loadI18n()
      const store = createStore()

      expect(store.get(localeAtom)).toBe('en')
    }
  )

  it.each(['zh', 'zh-CN', 'zh-SG', 'zh-Hans'])(
    'maps the Simplified Chinese locale %s to Chinese',
    async (language) => {
      vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue([language, 'en-US'])

      const { localeAtom } = await loadI18n()
      const store = createStore()

      expect(store.get(localeAtom)).toBe('zh')
    }
  )

  it('falls back to the default locale when storage holds garbage', async () => {
    localStorage.setItem('register.locale', JSON.stringify('xx'))

    const { localeAtom } = await loadI18n()
    const store = createStore()

    expect(store.get(localeAtom)).toBe(DEFAULT_LOCALE)
  })

  it('reads a valid persisted locale instead of the browser locale', async () => {
    vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['es-ES'])
    localStorage.setItem('register.locale', JSON.stringify('ko'))

    const { localeAtom } = await loadI18n()
    const store = createStore()

    expect(store.get(localeAtom)).toBe('ko')
  })

  it('coerces invalid writes to the default locale', async () => {
    const { localeAtom } = await loadI18n()
    const store = createStore()

    store.set(localeAtom, 'nope' as never)

    expect(store.get(localeAtom)).toBe(DEFAULT_LOCALE)
  })

  it('persists valid writes', async () => {
    const { localeAtom } = await loadI18n()
    const store = createStore()

    store.set(localeAtom, 'ko')

    expect(store.get(localeAtom)).toBe('ko')
    expect(localStorage.getItem('register.locale')).toBe(JSON.stringify('ko'))
  })
})
