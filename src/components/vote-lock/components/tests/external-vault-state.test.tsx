import { render, cleanup } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAddress } from 'viem'
import { walletAtom } from '@/state/atoms'
import { ExternalVoteLockDrawer } from '../../external-vote-lock-drawer'
import type { StTokenExtended } from '../../atoms'
import type { VoteLockDrawer } from '../../drawer'
import type { ComponentProps } from 'react'

const mocks = vi.hoisted(() => ({
  dtf: vi.fn(),
  dtfState: vi.fn(),
  vaultState: vi.fn(),
  drawer: vi.fn((_props: ComponentProps<typeof VoteLockDrawer>) => null),
}))
vi.mock('@/state/atoms', async () => {
  const { atom } = await import('jotai')
  return { walletAtom: atom<string | null>(null) }
})
vi.mock('@reserve-protocol/react-sdk', () => ({
  useIndexDtf: mocks.dtf,
  useIndexDtfVoteLockState: mocks.dtfState,
  useIndexDtfVoteLockVaultState: mocks.vaultState,
}))
vi.mock('../../drawer', () => ({ VoteLockDrawer: mocks.drawer }))
vi.mock('../../hooks/use-vote-lock-refresh', () => ({
  useExternalVoteLockRefresh: () => vi.fn(),
}))

const SAFE = getAddress('0xcfdc66b13cecd2143f4be3d112e7846f18015733')
const CURRENT = getAddress('0xabbdd9ac016e43c7ca85e2258e669948f029bc0c')
const LEGACY = getAddress('0x9f65716046ba5920f5385ebda9fc532ecd8014b7')
const DTF = getAddress('0xe4a10951f962e6cb93cb843a4ef05d2f99db1f94')
const token = { address: LEGACY, name: 'legacy', symbol: 'vlRSR', decimals: 18 }
const selectedVault: StTokenExtended = {
  id: LEGACY,
  chainId: 1,
  token,
  underlying: token,
}
const selectedState = {
  stToken: LEGACY,
  account: SAFE,
  shareBalance: { raw: 0n, formatted: '0' },
}
const successorState = {
  ...selectedState,
  stToken: CURRENT,
  shareBalance: { raw: 2000000n, formatted: '2000000' },
}
const optimisticDtf = (vault: string) => ({
  voteLockVault: {
    token: { address: vault },
    governance: { isOptimistic: true },
  },
})
const refetch = vi.fn()

function openDrawer() {
  const store = createStore()
  store.set(walletAtom, SAFE)
  render(
    <Provider store={store}>
      <ExternalVoteLockDrawer stToken={selectedVault} dtfAddress={DTF} open />
    </Provider>
  )
  return mocks.drawer.mock.calls.at(-1)![0]
}

describe('external vault state identity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.vaultState.mockReturnValue({ data: selectedState, refetch })
    mocks.dtf.mockReturnValue({ data: optimisticDtf(CURRENT) })
  })
  afterEach(cleanup)

  it('keeps the optimistic governance of the DTF vault while the account state loads', () => {
    mocks.dtf.mockReturnValue({ data: optimisticDtf(LEGACY) })
    mocks.dtfState.mockReturnValue({
      data: undefined,
      isError: false,
      refetch,
    })
    mocks.vaultState.mockReturnValue({ data: undefined, refetch })
    const drawer = openDrawer()
    expect(drawer.voteLockState).toBeUndefined()
    expect(drawer.isOptimisticGovernance).toBe(true)
  })

  it('reads the selected legacy vault instead of borrowing the successor balance', () => {
    mocks.dtfState.mockReturnValue({
      data: successorState,
      isError: false,
      refetch,
    })
    const drawer = openDrawer()
    expect(mocks.vaultState).toHaveBeenCalledWith({
      chainId: 1,
      stToken: LEGACY,
      account: SAFE,
    })
    expect(drawer.stToken.id).toBe(LEGACY)
    expect(drawer.voteLockState).toBe(selectedState)
    expect(drawer.isOptimisticGovernance).toBe(false)
  })

  it('does not expose successor state while the explicit vault read is pending', () => {
    mocks.dtfState.mockReturnValue({
      data: successorState,
      isError: false,
      refetch,
    })
    mocks.vaultState.mockReturnValue({ data: undefined, refetch })
    expect(openDrawer().voteLockState).toBeUndefined()
  })

  it('uses the DTF read when its vault and account match', () => {
    mocks.dtfState.mockReturnValue({
      data: selectedState,
      isError: false,
      refetch,
    })
    expect(openDrawer().voteLockState).toBe(selectedState)
    expect(mocks.vaultState).toHaveBeenCalledWith(undefined)
  })

  it('rejects state cached for another account', () => {
    mocks.dtfState.mockReturnValue({
      data: { ...selectedState, account: CURRENT },
      isError: false,
      refetch,
    })
    mocks.vaultState.mockReturnValue({
      data: { ...selectedState, account: CURRENT },
      refetch,
    })
    expect(openDrawer().voteLockState).toBeUndefined()
  })
})
