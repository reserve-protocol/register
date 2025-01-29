import { Token } from '@/types'
import { atom } from 'jotai'
import { Address, Hex } from 'viem'
import { PortfolioTabs } from './sidebar'

interface IndexToken extends Token {
  amount: bigint
}

interface StakingToken extends Token {
  amount: bigint
  delegate: Address | null
  underlying: Token
}

interface Lock {
  lockId: Hex
  amount: bigint
  unlockTime: number
  token: Token
  underlying: Token
}

export const accountIndexTokensAtom = atom<IndexToken[]>([])
export const accountStakingTokensAtom = atom<StakingToken[]>([])
export const accountUnclaimedLocksAtom = atom<Lock[]>([])
export const accountTokenPricesAtom = atom<Record<Address, number>>({})
export const selectedPortfolioTabAtom = atom<PortfolioTabs>('all')
