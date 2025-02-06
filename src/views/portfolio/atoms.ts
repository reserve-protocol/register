import { Token } from '@/types'
import { atom } from 'jotai'
import { Address, Chain, formatUnits, Hex, parseUnits } from 'viem'
import { PortfolioTabs } from './sidebar'
import { accountHoldingsAtom, rsrPriceAtom } from '@/state/atoms'

export interface IndexToken extends Token {
  amount: bigint
}

export interface StakingToken extends Token {
  amount: bigint
  delegate: Address | null
  underlying: Token
}

export interface Lock {
  lockId: bigint
  amount: bigint
  unlockTime: number
  token: Token
  underlying: Token
}

export const portfolioSidebarOpenAtom = atom(false)
export const portfolioShowRewardsAtom = atom(false)
export const selectedPortfolioTabAtom = atom<PortfolioTabs>('all')
export const accountIndexTokensAtom = atom<IndexToken[]>([])
export const accountStakingTokensAtom = atom<StakingToken[]>([])
export const accountUnclaimedLocksAtom = atom<Lock[]>([])
export const accountTokenPricesAtom = atom<Record<Address, number>>({})
export const rsrBalancesAtom = atom<Record<Chain['id'], bigint>>({})
export const accountRewardsAtom = atom<Record<Address, Address[]>>({})

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
