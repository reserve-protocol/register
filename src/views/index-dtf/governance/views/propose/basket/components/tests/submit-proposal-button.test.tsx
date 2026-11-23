import { render } from '@testing-library/react'
import { atom, createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/views/index-dtf/index-dtf-container', () => ({ indexDTFRefreshFnAtom: atom(undefined) }))
vi.mock('@/views/index-dtf/governance/hooks/use-is-propose-allowed', () => ({
  useIsProposeAllowed: () => ({ isProposeAllowed: true, isLoading: false }),
}))
vi.mock('@/views/index-dtf/governance/hooks/use-recent-proposal-receipt', () => ({ default: () => vi.fn() }))
vi.mock('@/views/index-dtf/governance/views/propose/shared', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/views/index-dtf/governance/views/propose/shared')>()),
  useProposalTypeEligibility: () => ({ hasSelectorError: false, isChecking: false, isOptimisticEligible: false }),
}))
vi.mock('@reserve-protocol/react-sdk', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@reserve-protocol/react-sdk')>()),
  useIndexDtfIdentity: () => ({ chainId: 8453, address: undefined }),
  useIndexDtfTradeAllowlist: () => ({ data: undefined, isLoading: false, isError: false }),
}))
vi.mock('wagmi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('wagmi')>()),
  useWriteContract: () => ({ writeContract: vi.fn(), isPending: false }),
  useWaitForTransactionReceipt: () => ({ data: undefined }),
}))

import { v6RebalanceContextErrorAtom } from '../../atoms'
import ProposeGatekeeper from '../submit-proposal-button'

describe('basket ProposeGatekeeper', () => {
  it("says why the proposal can't be built when the 6.0 nonce or governor timing read failed", () => {
    const store = createStore()
    store.set(v6RebalanceContextErrorAtom, true)
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter>
        <Provider store={store}>{children}</Provider>
      </MemoryRouter>
    )
    const { getByTestId } = render(<ProposeGatekeeper />, { wrapper })

    expect(getByTestId('basket-propose-context-unavailable')).toBeTruthy()
  })
})
