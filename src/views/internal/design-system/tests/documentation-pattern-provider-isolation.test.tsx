import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const providerProbe = vi.hoisted(() => ({ stateAtomImports: 0 }))

vi.mock('@/state/atoms', () => {
  providerProbe.stateAtomImports += 1
  throw new Error('Documentation imported provider-coupled application state')
})

vi.mock('@/components/token-logo', () =>
  import('../standalone/token-logo').then(({ default: TokenLogo }) => ({
    default: TokenLogo,
  }))
)

beforeAll(() => {
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: Promise.resolve() },
  })
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 824,
    height: 320,
    top: 0,
    right: 824,
    bottom: 320,
    left: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })
  Object.defineProperty(SVGElement.prototype, 'getBBox', {
    configurable: true,
    value: () => ({ width: 40 }),
  })
  global.ResizeObserver = class ResizeObserver {
    constructor(private callback: ResizeObserverCallback) {}
    observe() {
      this.callback(
        [{ contentRect: { width: 824, height: 320 } } as ResizeObserverEntry],
        this
      )
    }
    unobserve() {}
    disconnect() {}
  }
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
afterAll(() => vi.restoreAllMocks())

describe('canonical pattern provider isolation', () => {
  it('imports and renders the active Patterns and Workbench surface without application state or wallet configuration', async () => {
    const requestTargets: string[] = []
    const webSocketTargets: string[] = []
    const fetchSpy = vi.fn(async (input: RequestInfo | URL) => {
      requestTargets.push(
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url
      )
      throw new Error('Unexpected documentation fetch')
    })
    class WebSocketProbe {
      constructor(url: string | URL) {
        webSocketTargets.push(String(url))
      }
    }

    vi.stubGlobal('fetch', fetchSpy)
    vi.stubGlobal('WebSocket', WebSocketProbe)

    const [{ default: PatternsDocumentation }, { WorkbenchOverviewPage }] =
      await Promise.all([
        import('../documentation-patterns-overview'),
        import('../documentation-pages'),
      ])

    render(
      <MemoryRouter initialEntries={['/internal/design-system/patterns']}>
        <PatternsDocumentation />
        <WorkbenchOverviewPage />
      </MemoryRouter>
    )

    expect(screen.getByTestId('patterns-overview')).toBeVisible()
    expect(screen.getByTestId('workbench-overview')).toBeVisible()
    expect(screen.getByTestId('documentation-pattern-charts')).toBeVisible()
    expect(screen.getByTestId('navigation-pattern-documentation')).toBeVisible()
    expect(screen.getByTestId('documentation-pattern-tables')).toBeVisible()
    expect(document.getElementById('transaction-workbench')).toBeVisible()
    expect(
      document.querySelectorAll('[data-documentation-token-logo][src^="http"]')
    ).toHaveLength(0)
    expect(providerProbe.stateAtomImports).toBe(0)
    expect(
      requestTargets.filter((target) =>
        /api\.web3modal\.org|walletconnect|binance/i.test(target)
      )
    ).toEqual([])
    expect(
      webSocketTargets.filter((target) =>
        /walletconnect|binance|web3modal/i.test(target)
      )
    ).toEqual([])
  }, 15_000)
})
