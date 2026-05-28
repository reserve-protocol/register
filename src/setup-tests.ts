import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Resolve both macro call shapes: tagged template (t`Hi ${x}`) and
// MessageDescriptor / string passthrough (t(msg`Hi`)). Hoisted so the
// vi.mock factories (themselves hoisted) can reference it.
const { resolveMessage } = vi.hoisted(() => ({
  resolveMessage: (strings: any, ...values: any[]): string => {
    if (Array.isArray(strings)) {
      return strings.reduce(
        (acc: string, part: string, i: number) =>
          acc + part + (i < values.length ? String(values[i]) : ''),
        ''
      )
    }
    if (typeof strings === 'string') return strings
    return strings?.message ?? strings?.id ?? ''
  },
}))

// Mock @lingui/macro to avoid babel-plugin-macros CommonJS issues
vi.mock('@lingui/macro', () => ({
  t: (strings: TemplateStringsArray) => strings.join(''),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  Plural: () => null,
  Select: () => null,
  SelectOrdinal: () => null,
  defineMessage: (msg: any) => msg,
}))

// Mock @lingui/react/macro — reactive hooks/components used post-migration.
vi.mock('@lingui/react/macro', () => ({
  useLingui: () => ({
    t: resolveMessage,
    _: resolveMessage,
    i18n: { _: resolveMessage, locale: 'en' },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  Plural: () => null,
  Select: () => null,
  SelectOrdinal: () => null,
}))

// Mock @lingui/core/macro — msg descriptors + defineMessage.
vi.mock('@lingui/core/macro', () => ({
  msg: resolveMessage,
  defineMessage: (msg: any) => msg,
}))

// Mock window.matchMedia for components that use media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock ResizeObserver for components that use it
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = class IntersectionObserver {
  root = null
  rootMargin = ''
  thresholds = []

  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
