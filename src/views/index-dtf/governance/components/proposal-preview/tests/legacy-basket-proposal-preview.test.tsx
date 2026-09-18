import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, within } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { base } from 'wagmi/chains'
import { encodeFunctionData, type Address, type Hex } from 'viem'
import abi from '@/abis/dtf-index-abi-v1'
import { chainIdAtom } from '@/state/atoms'
import BasketProposalPreview from '../rebalance-preview/legacy-basket-proposal-preview'
import fixture from './fixtures/bdtf-sell-to-usdc.json'

afterEach(cleanup)

function renderPreview(
  calldatas = fixture.calldatas,
  prices: Record<string, number> = {}
) {
  const store = createStore()
  store.set(chainIdAtom, base.id)
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const config = createConfig({
    chains: [base],
    transports: { [base.id]: http() },
  })
  const tokens = [
    ...fixture.basket,
    { ...fixture.usdc, decimals: 6, symbol: 'USDC', weight: '0' },
  ]
  return render(
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <MemoryRouter>
            <BasketProposalPreview
              address={fixture.address as Address}
              calldatas={calldatas as Hex[]}
              basket={tokens.map((token) => ({
                ...token,
                name: token.symbol,
                address: token.address.toLowerCase() as Address,
              }))}
              shares={Object.fromEntries(
                tokens.map((token) => [
                  token.address.toLowerCase(),
                  token.weight,
                ])
              )}
              prices={{
                [fixture.address]: fixture.price,
                ...Object.fromEntries(
                  tokens.map((token) => [
                    token.address.toLowerCase(),
                    token.price,
                  ])
                ),
                ...prices,
              }}
            />
          </MemoryRouter>
        </Provider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

describe('legacy basket proposal preview', () => {
  it('shows 100% USDC when the BDTF proposal sells its entire basket with an unlimited buy cap', async () => {
    const view = renderPreview()
    const usdc = await view.findByRole('row', { name: /USDC/ })
    expect(
      within(usdc)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
        .slice(1)
    ).toEqual(['0%', '100.00%', '+100%'])
    for (const token of fixture.basket) {
      const row = view.getByRole('row', { name: new RegExp(token.symbol) })
      expect(within(row).getAllByRole('cell')[2]).toHaveTextContent('0.00%')
    }
  })

  it('keeps untouched holdings when only SPX is sold', async () => {
    const view = renderPreview(fixture.calldatas.slice(0, 1))
    const usdc = await view.findByRole('row', { name: /USDC/ })
    expect(within(usdc).getAllByRole('cell')[2]).toHaveTextContent('34.86%')
    for (const token of fixture.basket.filter(
      (token) => token.symbol !== 'SPX'
    )) {
      const row = view.getByRole('row', { name: new RegExp(token.symbol) })
      expect(within(row).getAllByRole('cell')[2]).toHaveTextContent(
        `${token.weight}%`
      )
    }
  })

  it('does not count the same sell allocation twice for repeated approvals', async () => {
    const view = renderPreview([fixture.calldatas[0], fixture.calldatas[0]])
    const usdc = await view.findByRole('row', { name: /USDC/ })
    expect(within(usdc).getAllByRole('cell')[2]).toHaveTextContent('34.86%')
  })

  it.each([
    {
      sellLimit: 0n,
      buyLimit: 3486n * 10n ** 11n,
      sell: '0.00%',
      buy: '34.86%',
    },
    {
      sellLimit: 10n ** 16n,
      buyLimit: 10n ** 54n,
      sell: '10.00%',
      buy: '24.86%',
    },
  ])(
    'preserves finite limits and funds only the sold portion ($sell → $buy)',
    async ({ sellLimit, buyLimit, sell, buy }) => {
      const spx = fixture.basket.find((token) => token.symbol === 'SPX')!
      const calldata = encodeFunctionData({
        abi,
        functionName: 'approveAuction',
        args: [
          spx.address as Address,
          fixture.usdc.address as Address,
          { spot: sellLimit, low: sellLimit, high: sellLimit },
          { spot: buyLimit, low: buyLimit, high: buyLimit },
          { start: 10n ** 27n, end: 10n ** 27n },
          604800n,
          1n,
        ],
      })
      const view = renderPreview([calldata], {
        [fixture.address]: 1,
        [spx.address]: 1,
        [fixture.usdc.address.toLowerCase()]: 1,
      })
      expect(
        within(await view.findByRole('row', { name: /SPX/ })).getAllByRole(
          'cell'
        )[2]
      ).toHaveTextContent(sell)
      expect(
        within(view.getByRole('row', { name: /USDC/ })).getAllByRole('cell')[2]
      ).toHaveTextContent(buy)
    }
  )
})
