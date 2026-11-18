import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAddress, parseUnits, zeroAddress, type Address } from 'viem'
import { walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { normalDelegateAtom, normalDelegateTouchedAtom } from '../../atoms'
import { CurrentDtfVoteLock } from '../../current-dtf-vote-lock'

const mocks = vi.hoisted(() => ({
  writeContract: vi.fn(),
  voteLockState: vi.fn(),
  refetchDtf: vi.fn(),
  refetchState: vi.fn(),
}))

vi.mock('@/state/atoms', async () => {
  const { atom } = await import('jotai')
  return { walletAtom: atom<string | null>(null) }
})
vi.mock('@/state/dtf/atoms', async () => {
  const { atom } = await import('jotai')
  return { indexDTFAtom: atom(undefined) }
})
vi.mock('@reserve-protocol/react-sdk', async (original) => ({
  ...(await original<typeof import('@reserve-protocol/react-sdk')>()),
  useCurrentIndexDtf: () => ({ refetch: mocks.refetchDtf }),
  useIndexDtfVoteLockState: mocks.voteLockState,
}))
vi.mock('wagmi', () => ({
  useAccount: () => ({}),
  useWriteContract: () => ({
    writeContract: mocks.writeContract,
    isPending: false,
  }),
  useWaitForTransactionReceipt: () => ({}),
}))
vi.mock('@/components/ui/transaction-button', () => ({
  default: ({
    onClick,
    disabled,
    text,
  }: {
    onClick?: () => void
    disabled?: boolean
    text?: ReactNode
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {text}
    </button>
  ),
}))
vi.mock('@/components/ui/drawer', () => {
  const Pass = ({ children }: { children?: ReactNode }) => <div>{children}</div>
  return {
    Drawer: Pass,
    DrawerContent: Pass,
    DrawerTitle: Pass,
    DrawerFooter: Pass,
    DrawerTrigger: ({
      children,
      onClick,
    }: {
      children?: ReactNode
      onClick?: () => void
    }) => <div onClick={onClick}>{children}</div>,
  }
})
vi.mock('../vote-lock', () => ({ default: () => null }))
vi.mock('../vote-unlock', () => ({ default: () => null }))
vi.mock('../../hooks/use-vote-lock-refresh', () => ({
  useCurrentDtfVoteLockRefresh: () => vi.fn(),
}))
vi.mock('../../hooks/use-vote-lock-quotes', () => ({
  useLockQuote: () => ({}),
}))
vi.mock('@/hooks/useTrackPage', () => ({ trackClick: vi.fn() }))
vi.mock('@/components/transaction-error/TransactionError', () => ({
  getWalletFailure: vi.fn(),
}))
vi.mock('mixpanel-browser/src/loaders/loader-module-core', () => ({
  default: { track: vi.fn() },
}))

const SAFE = getAddress('0xcfdc66b13cecd2143f4be3d112e7846f18015733')
const OTHER_ACCOUNT = getAddress('0x000000000000000000000000000000000000dead')
const DELEGATE = getAddress('0xb209eed4d80fb47e5c16577e44dad1073c5c5015')
const CURRENT_VAULT = getAddress('0xabbdd9ac016e43c7ca85e2258e669948f029bc0c')
const LEGACY_VAULT = getAddress('0x9f65716046ba5920f5385ebda9fc532ecd8014b7')
const DTF = getAddress('0xe4a10951f962e6cb93cb843a4ef05d2f99db1f94')
const RSR = getAddress('0x320623b8e4ff03373931769a31fc52a4e78b5d70')
const amount = (value: string) => ({
  raw: parseUnits(value, 18),
  formatted: value,
})
const dtfWithVault = (vault: Address) =>
  ({
    id: DTF,
    chainId: 1,
    stToken: {
      id: vault,
      token: { address: vault, name: 'vault', symbol: 'vlRSR', decimals: 18 },
      underlying: { address: RSR, name: 'RSR', symbol: 'RSR', decimals: 18 },
    },
  }) as never
const stateFor = (vault: Address, account: Address) => ({
  stToken: vault,
  account,
  underlyingBalance: amount('0'),
  underlyingAllowance: amount('0'),
  maxWithdraw: amount('2000000'),
  shareBalance: amount('2000000'),
  exchangeRate: amount('1'),
  delegate: account,
  optimisticDelegate: zeroAddress,
  optimisticVotingPower: null,
  hasOptimisticVotingPower: false,
  unstakingDelay: 86400n,
})

function openDelegateTab(vault: Address, state: ReturnType<typeof stateFor>) {
  const store = createStore()
  store.set(walletAtom, SAFE)
  store.set(indexDTFAtom, dtfWithVault(vault))
  mocks.voteLockState.mockReturnValue({
    data: state,
    refetch: mocks.refetchState,
  })

  render(
    <Provider store={store}>
      <CurrentDtfVoteLock initialTab="delegate">
        <span>open</span>
      </CurrentDtfVoteLock>
    </Provider>
  )
  fireEvent.click(screen.getByText('open'))
  act(() => {
    store.set(normalDelegateTouchedAtom, true)
    store.set(normalDelegateAtom, DELEGATE)
  })

  return store
}

const update = () => screen.getByRole('button', { name: 'Update' })

describe('current DTF drawer vault state identity', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(cleanup)

  it('does not delegate on a stale legacy vault with the balance of the current vault', () => {
    const store = openDelegateTab(
      LEGACY_VAULT,
      stateFor(CURRENT_VAULT, SAFE)
    )

    expect(update()).toBeDisabled()
    fireEvent.click(update())
    expect(mocks.writeContract).not.toHaveBeenCalled()
    expect(mocks.refetchDtf).toHaveBeenCalledTimes(1)
    expect(mocks.refetchState).toHaveBeenCalledTimes(1)

    act(() => store.set(indexDTFAtom, dtfWithVault(CURRENT_VAULT)))
    fireEvent.click(update())

    expect(mocks.writeContract).toHaveBeenCalledTimes(1)
    expect(mocks.writeContract.mock.calls[0][0]).toMatchObject({
      address: CURRENT_VAULT,
      chainId: 1,
      functionName: 'delegate',
      args: [DELEGATE],
    })
  })

  it('does not use state cached for another account', () => {
    openDelegateTab(CURRENT_VAULT, stateFor(CURRENT_VAULT, OTHER_ACCOUNT))

    expect(update()).toBeDisabled()
    fireEvent.click(update())
    expect(mocks.writeContract).not.toHaveBeenCalled()
    expect(mocks.refetchDtf).not.toHaveBeenCalled()
  })

  it('delegates on the DTF vault when the state matches it', () => {
    openDelegateTab(CURRENT_VAULT, stateFor(CURRENT_VAULT, SAFE))

    fireEvent.click(update())

    expect(mocks.refetchDtf).not.toHaveBeenCalled()
    expect(mocks.writeContract.mock.calls[0][0]).toMatchObject({
      address: CURRENT_VAULT,
      functionName: 'delegate',
      args: [DELEGATE],
    })
  })
})
