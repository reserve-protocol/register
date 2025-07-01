import { vi } from 'vitest'

// Mock Wagmi hooks
vi.mock('wagmi', () => ({
  useConfig: () => ({}),
  useAccount: () => ({ address: '0x123' }),
  useBalance: () => ({ data: { value: 0n, formatted: '0' } }),
  useReadContract: () => ({ data: undefined }),
  useWriteContract: () => ({ writeContract: vi.fn() }),
  useWaitForTransactionReceipt: () => ({ data: undefined }),
}))

// Mock Jotai
vi.mock('jotai', () => ({
  atom: vi.fn(() => ({ key: 'test' })),
  useAtom: vi.fn(() => [undefined, vi.fn()]),
  useAtomValue: vi.fn(() => undefined),
  useSetAtom: vi.fn(() => vi.fn()),
}))

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})