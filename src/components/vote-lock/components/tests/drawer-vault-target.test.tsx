import { act, fireEvent, render, screen, cleanup } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAddress, parseUnits, zeroAddress } from 'viem'
import { walletAtom } from '@/state/atoms'
import {
  lockCheckboxAtom,
  normalDelegateAtom,
  optimisticDelegateAtom,
  stakingInputAtom,
  stTokenAtom,
  voteLockStateAtom,
  type StTokenExtended,
  type VoteLockDrawerState,
} from '../../atoms'
import VoteLockDrawerFooter from '../drawer-footer'

const { writeContract } = vi.hoisted(() => ({ writeContract: vi.fn() }))

vi.mock('@/state/atoms', async () => {
  const { atom } = await import('jotai')
  return { walletAtom: atom<string | null>(null) }
})
vi.mock('@/state/dtf/atoms', async () => {
  const { atom } = await import('jotai')
  return { indexDTFAtom: atom(undefined) }
})
vi.mock('wagmi', () => ({
  useAccount: () => ({}),
  useWriteContract: () => ({ writeContract, isPending: false }),
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
vi.mock('@/components/ui/drawer', () => ({
  DrawerFooter: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
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
const DELEGATE = getAddress('0xb209eed4d80fb47e5c16577e44dad1073c5c5015')
const CURRENT_VAULT = getAddress('0xabbdd9ac016e43c7ca85e2258e669948f029bc0c')
const LEGACY_VAULT = getAddress('0x9f65716046ba5920f5385ebda9fc532ecd8014b7')
const RSR = getAddress('0x320623b8e4ff03373931769a31fc52a4e78b5d70')
const currentVault: StTokenExtended = {
  id: CURRENT_VAULT,
  chainId: 1,
  token: {
    address: CURRENT_VAULT,
    name: 'Vote-Locked Reserve Rights',
    symbol: 'vlRSR',
    decimals: 18,
  },
  underlying: {
    address: RSR,
    name: 'Reserve Rights',
    symbol: 'RSR',
    decimals: 18,
  },
}
const amount = (value: string) => ({
  raw: parseUnits(value, 18),
  formatted: value,
})
const state: VoteLockDrawerState = {
  underlyingBalance: amount('10'),
  underlyingAllowance: amount('10'),
  maxWithdraw: amount('10'),
  shareBalance: amount('10'),
  exchangeRate: amount('1'),
  delegate: SAFE,
  optimisticDelegate: zeroAddress,
  optimisticVotingPower: null,
  hasOptimisticVotingPower: false,
  unstakingDelay: 86400n,
}

describe('drawer-scoped vault target', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(cleanup)

  it('approves the drawer vault, never the stale shared vault', () => {
    const store = createStore()
    store.set(walletAtom, SAFE)
    store.set(stTokenAtom, { ...currentVault, id: LEGACY_VAULT })
    store.set(voteLockStateAtom, { ...state, underlyingAllowance: amount('0') })
    store.set(stakingInputAtom, '1')
    store.set(lockCheckboxAtom, true)

    render(
      <Provider store={store}>
        <VoteLockDrawerFooter
          stToken={currentVault}
          currentTab="lock"
          isOptimisticGovernance={false}
        />
      </Provider>
    )
    expect(screen.getByRole('button')).toBeDisabled()
    fireEvent.click(screen.getByRole('button'))
    expect(writeContract).not.toHaveBeenCalled()
    act(() => store.set(stTokenAtom, currentVault))
    fireEvent.click(screen.getByRole('button'))

    expect(writeContract).toHaveBeenCalledTimes(1)
    expect(writeContract.mock.calls[0][0]).toMatchObject({
      address: RSR,
      chainId: 1,
      functionName: 'approve',
      args: [CURRENT_VAULT, parseUnits('1', 18)],
    })
  })

  it('preserves an explicitly selected legacy-vault unlock', () => {
    const legacyVault: StTokenExtended = {
      ...currentVault,
      id: LEGACY_VAULT,
      token: { ...currentVault.token, address: LEGACY_VAULT },
    }
    const store = createStore()
    store.set(walletAtom, SAFE)
    store.set(stTokenAtom, legacyVault)
    store.set(voteLockStateAtom, { ...state, unstakingDelay: 0n })
    store.set(stakingInputAtom, '1')

    render(
      <Provider store={store}>
        <VoteLockDrawerFooter
          stToken={legacyVault}
          currentTab="unlock"
          isOptimisticGovernance={false}
        />
      </Provider>
    )
    fireEvent.click(screen.getByRole('button'))

    expect(writeContract).toHaveBeenCalledTimes(1)
    expect(writeContract.mock.calls[0][0]).toMatchObject({
      address: LEGACY_VAULT,
      chainId: 1,
      functionName: 'redeem',
      args: [parseUnits('1', 18), SAFE, SAFE],
    })
  })

  it('does not submit while the shared vault belongs to another chain', () => {
    const store = createStore()
    store.set(walletAtom, SAFE)
    store.set(stTokenAtom, { ...currentVault, chainId: 8453 })
    store.set(voteLockStateAtom, state)
    store.set(normalDelegateAtom, DELEGATE)

    render(
      <Provider store={store}>
        <VoteLockDrawerFooter
          stToken={currentVault}
          currentTab="delegate"
          isOptimisticGovernance={false}
        />
      </Provider>
    )

    expect(screen.getByRole('button')).toBeDisabled()
    expect(writeContract).not.toHaveBeenCalled()
  })

  it('fast delegation uses the same drawer vault', () => {
    const store = createStore()
    store.set(walletAtom, SAFE)
    store.set(stTokenAtom, { ...currentVault, id: LEGACY_VAULT })
    store.set(voteLockStateAtom, state)
    store.set(normalDelegateAtom, SAFE)
    store.set(optimisticDelegateAtom, DELEGATE)

    render(
      <Provider store={store}>
        <VoteLockDrawerFooter
          stToken={currentVault}
          currentTab="delegate"
          isOptimisticGovernance
        />
      </Provider>
    )
    expect(screen.getByRole('button')).toBeDisabled()
    expect(writeContract).not.toHaveBeenCalled()
    act(() => store.set(stTokenAtom, currentVault))
    fireEvent.click(screen.getByRole('button'))

    expect(writeContract).toHaveBeenCalledTimes(1)
    expect(writeContract.mock.calls[0][0]).toMatchObject({
      address: CURRENT_VAULT,
      chainId: 1,
      functionName: 'delegateOptimistic',
      args: [DELEGATE],
    })
  })

  it.each([
    ['lock', 'depositAndDelegate', [parseUnits('1', 18)]],
    ['unlock', 'redeem', [parseUnits('1', 18), SAFE, SAFE]],
    ['delegate', 'delegate', [DELEGATE]],
  ] as const)(
    '%s uses the drawer vault rather than a stale shared vault',
    (tab, functionName, args) => {
      const store = createStore()
      store.set(walletAtom, SAFE)
      store.set(stTokenAtom, { ...currentVault, id: LEGACY_VAULT })
      store.set(voteLockStateAtom, state)
      store.set(stakingInputAtom, '1')
      store.set(lockCheckboxAtom, true)
      store.set(normalDelegateAtom, DELEGATE)

      render(
        <Provider store={store}>
          <VoteLockDrawerFooter
            stToken={currentVault}
            currentTab={tab}
            isOptimisticGovernance={false}
          />
        </Provider>
      )
      expect(screen.getByRole('button')).toBeDisabled()
      expect(writeContract).not.toHaveBeenCalled()
      act(() => store.set(stTokenAtom, currentVault))
      fireEvent.click(screen.getByRole('button'))

      expect(writeContract).toHaveBeenCalledTimes(1)
      expect(writeContract.mock.calls[0][0]).toMatchObject({
        address: CURRENT_VAULT,
        chainId: 1,
        functionName,
        args,
      })
    }
  )
})
