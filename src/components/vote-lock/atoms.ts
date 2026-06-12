import { indexDTFAtom } from '@/state/dtf/atoms'
import type {
  Amount,
  SupportedChainId,
  Token,
  VoteLockState,
} from '@reserve-protocol/react-sdk'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { Address, formatUnits } from 'viem'

type StToken = Token & {
  readonly id?: Address
  readonly totalSupply?: Amount
}

export type StTokenExtended = {
  readonly id: Address
  readonly chainId: SupportedChainId
  readonly token: StToken
  readonly underlying: Token
  readonly governance?: {
    readonly isOptimistic?: boolean | null
  }
  readonly dtfAddress?: Address
}

export type VoteLockDrawerState = Pick<
  VoteLockState,
  | 'underlyingBalance'
  | 'underlyingAllowance'
  | 'delegate'
  | 'optimisticDelegate'
  | 'maxWithdraw'
  | 'optimisticVotingPower'
  | 'hasOptimisticVotingPower'
  | 'unstakingDelay'
  | 'underlyingPrice'
>
export type VoteLockTab = 'lock' | 'unlock' | 'delegate'
export type VoteLockSidebarState = {
  open: boolean
  tab?: VoteLockTab
}

// Main stToken atom that will be set from props
export const stTokenAtom = atomWithReset<StTokenExtended | undefined>(undefined)

export const voteLockStateAtom = atomWithReset<VoteLockDrawerState | undefined>(
  undefined
)
export const stakingSidebarOpenAtom = atomWithReset<VoteLockSidebarState>({
  open: false,
})
export const portfolioStTokenAtom = atomWithReset<StTokenExtended | undefined>(
  undefined
)

export const openVoteLockSidebarAtom = atom(
  null,
  (
    _get,
    set,
    params: StTokenExtended | { stToken: StTokenExtended; tab?: VoteLockTab }
  ) => {
    const stToken = 'stToken' in params ? params.stToken : params
    const tab = 'stToken' in params ? params.tab : undefined

    set(portfolioStTokenAtom, stToken)
    set(stakingSidebarOpenAtom, { open: true, tab: tab ?? 'lock' })
  }
)

export const currentStakingTabAtom = atomWithReset<VoteLockTab>('lock')
export const stakingInputAtom = atomWithReset<string>('')
export const lockCheckboxAtom = atomWithReset<boolean>(false)
export const normalDelegateAtom = atomWithReset<string>('')
export const optimisticDelegateAtom = atomWithReset<string>('')
export const normalDelegateTouchedAtom = atomWithReset<boolean>(false)
export const optimisticDelegateTouchedAtom = atomWithReset<boolean>(false)

// Atom to trigger drawer close from child components
export const closeDrawerAtom = atom(false)

export const underlyingBalanceRawAtom = atom(
  (get) => get(voteLockStateAtom)?.underlyingBalance.raw
)

export const unlockBalanceRawAtom = atom(
  (get) => get(voteLockStateAtom)?.maxWithdraw.raw
)

export const unlockDelayAtom = atom<number | undefined>((get) => {
  const delay = get(voteLockStateAtom)?.unstakingDelay

  return delay === undefined ? undefined : Number(delay) / 86400
})

export const inputPriceAtom = atom<number>((get) => {
  const input = get(stakingInputAtom)
  const price = get(voteLockStateAtom)?.underlyingPrice
  return price ? price * Number(input) : 0
})

export const inputBalanceAtom = atom<string>((get) => {
  return get(voteLockStateAtom)?.underlyingBalance.formatted ?? '0'
})

export const unlockBalanceAtom = atom<string>((get) => {
  const stToken = get(stTokenAtom)
  const unlockBalanceRaw = get(unlockBalanceRawAtom)
  const decimals = stToken?.underlying.decimals

  return decimals !== undefined && unlockBalanceRaw !== undefined
    ? formatUnits(unlockBalanceRaw, decimals)
    : '0'
})

export const hasVoteLockedBalanceAtom = atom((get) =>
  Boolean((get(voteLockStateAtom)?.maxWithdraw.raw ?? 0n) > 0n)
)

export const updateCurrentDtfStTokenSupplyAtom = atom(
  null,
  (get, set, { stToken, delta }: { stToken: Address; delta: bigint }) => {
    const indexDTF = get(indexDTFAtom)
    const currentStToken = indexDTF?.stToken
    const currentSupply = currentStToken?.token.totalSupply

    if (
      !indexDTF ||
      !currentStToken ||
      !currentSupply ||
      currentStToken.id.toLowerCase() !== stToken.toLowerCase()
    ) {
      return
    }

    const nextRaw = currentSupply.raw + delta
    const safeRaw = nextRaw < 0n ? 0n : nextRaw
    const totalSupply = {
      raw: safeRaw,
      formatted: formatUnits(safeRaw, currentStToken.token.decimals),
    }

    set(indexDTFAtom, {
      ...indexDTF,
      stToken: {
        ...currentStToken,
        token: {
          ...currentStToken.token,
          totalSupply,
          ...(currentStToken.token.snapshot
            ? {
                snapshot: {
                  ...currentStToken.token.snapshot,
                  totalSupply,
                },
              }
            : {}),
        },
      },
    })
  }
)
