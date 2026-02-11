import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock @lingui/macro to avoid babel-plugin-macros CommonJS issues
vi.mock('@lingui/macro', () => ({
  t: (strings: TemplateStringsArray) => strings.join(''),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  Plural: () => null,
  Select: () => null,
  SelectOrdinal: () => null,
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
