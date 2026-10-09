import { TooltipProvider } from '@/components/ui/tooltip'
import { chainIdAtom } from '@/state/atoms'
import { rTokenMetaAtom } from '@/state/rtoken/atoms/rTokenAtom'
import { createTestQueryClient } from '@/test-utils'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore, Provider } from 'jotai'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { UnderlyingFees } from '../api'
import UnderlyingFeesSection from '../../underlying-fees'

const EUSD = '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F'
const OTHER_RTOKEN = '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8'
const NOW = 1_800_000_000

const fetchMock = vi.fn()
const { trackClick } = vi.hoisted(() => ({ trackClick: vi.fn() }))

vi.mock('@/hooks/useTrackPage', () => ({ trackClick }))

const respond = (status: number, body?: unknown) =>
  fetchMock.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })

const amounts = (
  management: number,
  performance: number,
  protocol: number
) => ({
  management,
  performance,
  protocol,
  total: management + performance + protocol,
})

const payload = (overrides: Partial<UnderlyingFees> = {}): UnderlyingFees => ({
  rToken: EUSD,
  chainId: 1,
  period: { from: NOW - 30 * 86_400, to: NOW },
  trackingSince: NOW - 2 * 86_400,
  lastSnapshotAt: NOW - 1_800,
  annualizedDragBps: 12.345,
  totals: amounts(10, 5, 2.5),
  collaterals: [
    {
      address: '0x0000000000000000000000000000000000000001',
      symbol: 'vaultUSDC',
      label: 'Morpho Vault USDC',
      positionUsd: 1_000_000,
      status: 'onchain',
      rates: [
        {
          category: 'management',
          basis: 'aum',
          rate: 0.01,
          weight: 1,
          source: 'onchain',
          layer: { kind: 'morpho-vault-v2', address: '0x01', label: 'Vault' },
        },
      ],
      accrued: amounts(10, 5, 0.0042),
    },
    {
      address: '0x0000000000000000000000000000000000000002',
      symbol: 'newToken',
      label: 'Untracked Wrapper',
      positionUsd: 500_000,
      status: 'unavailable',
      rates: [],
      accrued: amounts(0, 0, 0),
    },
    {
      address: '0x0000000000000000000000000000000000000003',
      symbol: 'oldToken',
      label: 'Old Collateral',
      positionUsd: 0,
      status: 'estimated',
      rates: [],
      accrued: amounts(0, 0, 2.5),
    },
  ],
  ...overrides,
})

const renderSection = (rToken: string, chainId = 1) => {
  const store = createStore()
  store.set(chainIdAtom, chainId as never)
  store.set(rTokenMetaAtom, { address: rToken, chain: chainId } as never)

  return render(
    <Provider store={store}>
      <QueryClientProvider client={createTestQueryClient()}>
        <TooltipProvider>
          <UnderlyingFeesSection />
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  )
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(Date, 'now').mockReturnValue(NOW * 1000)
})

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('UnderlyingFeesSection', () => {
  it('does not request or render for other RTokens', () => {
    const { container } = renderSection(OTHER_RTOKEN)

    expect(container).toBeEmptyDOMElement()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not request eUSD on another chain', () => {
    const { container } = renderSection(EUSD, 8453)

    expect(container).toBeEmptyDOMElement()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('renders nothing before tracking starts', async () => {
    respond(
      200,
      payload({ collaterals: [], trackingSince: null, lastSnapshotAt: null })
    )

    const { container } = renderSection(EUSD)

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(container).toBeEmptyDOMElement())
    expect(fetchMock.mock.calls[0][0]).toContain(
      `yield-dtf/underlying-fees?chainId=1&address=${EUSD}&period=30d`
    )
  })

  it('renders nothing on 404', async () => {
    respond(404, { message: 'not tracked' })

    const { container } = renderSection(EUSD)

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(container).toBeEmptyDOMElement())
  })

  it('renders nothing when the payload breaks the contract', async () => {
    respond(200, { collaterals: 'nope' })

    const { container } = renderSection(EUSD)

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(container).toBeEmptyDOMElement())
  })

  it('keeps the section and the toggle when another period fails', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url.includes('period=all')
        ? { ok: false, status: 404, json: async () => ({}) }
        : { ok: true, status: 200, json: async () => payload() }
    )

    renderSection(EUSD)
    await screen.findByText('$17.50')
    await userEvent.click(screen.getByText('Since tracking'))

    expect(await screen.findByText(/not available right now/)).toBeVisible()
    expect(screen.getByText('30D')).toBeVisible()
    expect(fetchMock.mock.calls.at(-1)?.[0]).toContain('period=all')
    expect(trackClick).toHaveBeenCalledWith(
      'overview',
      'underlying_fees_period_all',
      EUSD
    )
  })

  it('renders the endpoint values', async () => {
    respond(200, payload())

    renderSection(EUSD)

    expect(await screen.findByText('$17.50')).toBeVisible()
    expect(screen.getByText('Underlying protocol fees')).toBeVisible()
    expect(screen.getByText('12.35 bps')).toBeVisible()
    expect(screen.getByText('$0.0042')).toBeVisible()
    expect(screen.getByText('1% / yr')).toBeVisible()
    expect(screen.getByText('Observed')).toBeVisible()
    expect(screen.getByText('Estimated')).toBeVisible()
    expect(screen.getByText('Unavailable')).toBeVisible()
    expect(screen.getByText('Exited')).toBeVisible()
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(4)
    expect(screen.queryByText(/data may be outdated/)).toBeNull()
  })

  it('flags snapshots older than 3 hours', async () => {
    respond(200, payload({ lastSnapshotAt: NOW - 4 * 3_600 }))

    renderSection(EUSD)

    expect(await screen.findByText(/data may be outdated/)).toBeVisible()
  })
})
