import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { parseEther } from 'viem'
import ZapThrottleWarning from '../zap-throttle-warning'

const { useZap, useReadContracts } = vi.hoisted(() => ({
  useZap: vi.fn(),
  useReadContracts: vi.fn(),
}))
vi.mock('../context/ZapContext', () => ({ useZap }))
vi.mock('hooks/useWatchReadContract', () => ({
  useWatchReadContracts: useReadContracts,
}))

const rToken = {
  address: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
  symbol: 'eUSD',
  decimals: 18,
  price: 1,
}
const usdc = { symbol: 'USDC', decimals: 6, price: 1 }
const redeem = {
  chainId: 1,
  operation: 'redeem',
  amountIn: '5000001',
  tokenIn: rToken,
  tokenOut: usdc,
}

afterEach(cleanup)
beforeEach(() => {
  vi.clearAllMocks()
  useZap.mockReturnValue(redeem)
  useReadContracts.mockReturnValue({
    data: [parseEther('5000000')],
    isError: false,
  })
})

describe('Zap throttle warning', () => {
  it('explains the redemption cap before a quote or wallet is available', () => {
    render(<ZapThrottleWarning />)
    expect(screen.getByRole('alert').textContent).toContain(
      'Redeem capacity exceeded'
    )
    expect(screen.getByRole('alert').textContent).toContain('5000000 eUSD')
    expect(screen.getByRole('alert').textContent).toContain('market liquidity')
    expect(useReadContracts.mock.calls[0][0].contracts[0]).toMatchObject({
      address: rToken.address,
      chainId: 1,
      functionName: 'redemptionAvailable',
    })
  })

  it.each(['4999999', '5000000', '', '0', '-1', 'invalid'])(
    'does not warn for %s',
    (amountIn) => {
      useZap.mockReturnValue({ ...redeem, amountIn })
      render(<ZapThrottleWarning />)
      expect(screen.queryByRole('alert')).toBeNull()
    }
  )

  it('detects one wei above capacity without floating-point rounding', () => {
    useZap.mockReturnValue({
      ...redeem,
      amountIn: '5000000.000000000000000001',
    })
    render(<ZapThrottleWarning />)
    expect(screen.getByRole('alert')).toBeVisible()
  })

  it('reacts to replenishment and treats zero capacity as a real limit', () => {
    const { rerender } = render(<ZapThrottleWarning />)
    useReadContracts.mockReturnValue({
      data: [parseEther('5000001')],
      isError: false,
    })
    rerender(<ZapThrottleWarning />)
    expect(screen.queryByRole('alert')).toBeNull()
    useReadContracts.mockReturnValue({ data: [0n], isError: false })
    rerender(<ZapThrottleWarning />)
    expect(screen.getByRole('alert').textContent).toContain('0 eUSD')
  })

  it.each([
    { data: undefined, isError: false },
    { data: [parseEther('5000000')], isError: true },
  ])('does not invent capacity when the read is unavailable: %o', (result) => {
    useReadContracts.mockReturnValue(result)
    render(<ZapThrottleWarning />)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('estimates issuance in DTF units, not input-token units or fallback quote output', () => {
    useZap.mockReturnValue({
      ...redeem,
      operation: 'mint',
      amountIn: '2501',
      amountOut: '10',
      tokenIn: { ...usdc, symbol: 'WETH', decimals: 18, price: 2000 },
      tokenOut: rToken,
    })
    render(<ZapThrottleWarning />)
    expect(screen.getByRole('alert').textContent).toContain(
      'Estimated Mint amount exceeds capacity'
    )
    expect(useReadContracts.mock.calls[0][0].contracts[0].functionName).toBe(
      'issuanceAvailable'
    )
  })

  it.each([0, undefined, NaN, Infinity])(
    'does not estimate Mint with missing price %s',
    (price) => {
      useZap.mockReturnValue({
        ...redeem,
        operation: 'mint',
        tokenIn: { ...usdc, price },
        tokenOut: rToken,
      })
      render(<ZapThrottleWarning />)
      expect(screen.queryByRole('alert')).toBeNull()
    }
  )
})
