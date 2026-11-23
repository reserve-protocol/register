import { render } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

const WETH = '0x4200000000000000000000000000000000000006'
const UNLISTED = '0x5555555555555555555555555555555555555555'

vi.mock('@/hooks/use-token-list', () => ({
  default: () => ({ data: [{ address: WETH, symbol: 'WETH', name: 'Wrapped Ether' }] }),
}))
vi.mock('wagmi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('wagmi')>()),
  useReadContracts: () => ({
    data: [
      { status: 'success', result: 'QAT' },
      { status: 'success', result: 'QA Token' },
    ],
  }),
}))

import { TradeAllowlistPreview } from '../dtf-settings-preview'

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <Provider store={createStore()}>{children}</Provider>
  </MemoryRouter>
)

describe('TradeAllowlistPreview', () => {
  it('names listed tokens and reads unlisted symbols on-chain', () => {
    const { getAllByTestId } = render(
      <TradeAllowlistPreview
        decodedCalldata={{ signature: 'addToAllowlist', data: [[WETH, UNLISTED]] } as any}
      />,
      { wrapper }
    )

    const rows = getAllByTestId('settings-preview-allowlist-token')
    expect(rows[0].textContent).toContain('WETH')
    expect(rows[1].textContent).toContain('QAT')
  })
})
