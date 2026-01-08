import { accountHoldingsAtom, accountTokensAtom, rsrPriceAtom } from '@/state/atoms'
import { Token } from '@/types'
import { RSR_ADDRESS } from '@/utils/addresses'
import { atom } from 'jotai'
import { Address, Chain, formatUnits } from 'viem'
import { PortfolioTabs } from './sidebar'

const getTokenValue = (
  token: {
    address: Address
    decimals: number
    underlying?: { address: Address }
  },
  amount: bigint | undefined,
  prices: Record<string, number>
) => {
  const numAmount = Number(formatUnits(amount ?? 0n, token.decimals))
  return (prices[token.underlying?.address ?? token.address] ?? 0) * numAmount
}

const sortByValueDesc = <
  T extends {
    address: Address
    decimals: number
    underlying?: { address: Address }
    amount?: bigint
  },
>(
  items: T[],
  prices: Record<string, number>
) =>
  [...items].sort(
    (a, b) =>
      getTokenValue(b, b.amount, prices) - getTokenValue(a, a.amount, prices)
  )

export interface IndexToken extends Token {
  chainId: number
  amount: bigint
}

export interface StakingToken extends Token {
  chainId: number
  amount: bigint
  delegate: Address | null
  underlying: Token
}

export interface Lock {
  chainId: number
  lockId: bigint
  amount: bigint
  unlockTime: number
  token: Token
  underlying: Token
}

export interface RewardToken extends Token {
  chainId: number
  accrued: bigint
  accruedUSD?: number
}

export const portfolioSidebarOpenAtom = atom(false)
export const portfolioShowRewardsAtom = atom(false)
export const selectedPortfolioTabAtom = atom<PortfolioTabs>('all')
export const accountIndexTokensAtom = atom<IndexToken[]>([])
export const accountStakingTokensAtom = atom<StakingToken[]>([])
export const accountUnclaimedLocksAtom = atom<Lock[]>([])
export const accountTokenPricesAtom = atom<Record<Address, number>>({})
export const rsrBalancesAtom = atom<Record<Chain['id'], bigint>>({})
export const accountRewardsAtom = atom<Record<Address, RewardToken[]>>({})
export const indexDTFIconsAtom = atom<Record<number, Record<string, string>>>(
  {}
)
export const portfolioLastUpdatedAtom = atom<number>(0)
export const portfolioRefreshFnAtom = atom<(() => void) | null>(null)
export const portfolioLoadingAtom = atom(false)

export const resetPortfolioAtom = atom(null, (_, set) => {
  set(accountIndexTokensAtom, [])
  set(accountStakingTokensAtom, [])
  set(accountUnclaimedLocksAtom, [])
  set(accountTokenPricesAtom, {})
  set(rsrBalancesAtom, {})
  set(accountRewardsAtom, {})
  set(portfolioLoadingAtom, true)
})

export const indexAccountHoldingsAtom = atom<number>((get) => {
  const indexTokens = get(accountIndexTokensAtom)
  const stTokens = get(accountStakingTokensAtom)
  const locks = get(accountUnclaimedLocksAtom)
  const prices = get(accountTokenPricesAtom)

  const allTokens = [
    ...indexTokens.map((token) => ({ ...token, price: prices[token.address] })),
    ...stTokens.map((token) => ({
      ...token,
      price: prices[token.underlying.address],
    })),
    ...locks.map((lock) => ({
      ...lock.token,
      amount: lock.amount,
      price: prices[lock.underlying.address],
    })),
  ]

  return allTokens.reduce(
    (acc, { decimals, amount, price }) =>
      acc + Number(formatUnits(amount, decimals)) * (price ?? 0),
    0
  )
})

export const rsrAccountHoldingsAtom = atom<number>((get) => {
  const balances = get(rsrBalancesAtom)
  const rsrPrice = get(rsrPriceAtom)

  return Object.values(balances).reduce(
    (acc, balance) => acc + Number(formatUnits(balance, 18)) * (rsrPrice ?? 0),
    0
  )
})

export const totalAccountHoldingsAtom = atom<number>((get) => {
  const yieldHoldings = get(accountHoldingsAtom)
  const indexHoldings = get(indexAccountHoldingsAtom)
  const rsrHoldings = get(rsrAccountHoldingsAtom)

  return yieldHoldings + indexHoldings + rsrHoldings
})

export const sortedStakingTokensAtom = atom((get) => {
  const stTokens = get(accountStakingTokensAtom)
  const prices = get(accountTokenPricesAtom)
  return sortByValueDesc(stTokens, prices)
})

export const sortedLocksAtom = atom((get) => {
  const locks = get(accountUnclaimedLocksAtom)
  const prices = get(accountTokenPricesAtom)
  return [...locks].sort(
    (a, b) =>
      getTokenValue({ ...b.token, underlying: b.underlying }, b.amount, prices) -
      getTokenValue({ ...a.token, underlying: a.underlying }, a.amount, prices)
  )
})

export const sortedIndexTokensAtom = atom((get) => {
  const indexDTFs = get(accountIndexTokensAtom)
  const prices = get(accountTokenPricesAtom)
  return sortByValueDesc(indexDTFs, prices)
})

export const sortedYieldDTFsAtom = atom((get) => {
  const yieldDTFs = get(accountTokensAtom)
  return yieldDTFs
    .filter(({ usdAmount }) => usdAmount > 0.01)
    .sort((a, b) => b.usdAmount - a.usdAmount)
})

export const sortedStakedRSRAtom = atom((get) => {
  const yieldDTFs = get(accountTokensAtom)
  return yieldDTFs
    .filter(({ stakedRSR }) => stakedRSR > 1)
    .sort((a, b) => (b.stakedRSRUsd ?? 0) - (a.stakedRSRUsd ?? 0))
})

export const sortedRSRChainIdsAtom = atom((get) => {
  const rsrBalances = get(rsrBalancesAtom)
  if (!rsrBalances) return []
  return Object.keys(RSR_ADDRESS)
    .map(Number)
    .sort((a, b) => {
      const aBalance = rsrBalances[a] ?? 0n
      const bBalance = rsrBalances[b] ?? 0n
      return aBalance > bBalance ? -1 : aBalance < bBalance ? 1 : 0
    })
})

export interface StTokenWithRewards extends StakingToken {
  rewards: RewardToken[]
}

export const sortedStTokensWithRewardsAtom = atom((get) => {
  const accountStTokens = get(accountStakingTokensAtom)
  const accountRewards = get(accountRewardsAtom)
  const prices = get(accountTokenPricesAtom)

  const mapped = accountStTokens
    .filter((stToken) => accountRewards[stToken.address]?.length > 0)
    .map((stToken) => ({
      ...stToken,
      rewards: [...accountRewards[stToken.address]].sort(
        (a, b) => (b.accruedUSD ?? 0) - (a.accruedUSD ?? 0)
      ),
    }))
  return sortByValueDesc(mapped, prices)
})
