import { Token } from '@/types'
import { atom } from 'jotai'
import { Address, Hex } from 'viem'

interface IndexToken extends Token {
  amount: bigint
}

interface StakingToken extends Token {
  amount: bigint
  delegate: Address | null
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
