import { atom } from 'jotai'
import { DeployStepId } from './form-fields'
import { Token } from '@/types'
import { atomWithReset } from 'jotai/utils'
import { Address } from 'viem'

export const deployStepAtom = atom<DeployStepId | undefined>(undefined)

export const selectedTokensAtom = atomWithReset<Token[]>([])
export const searchTokenAtom = atomWithReset<string>('')

export const basketAtom = atom<Token[]>([])

export const tokenPricesAtom = atom<Record<Address, number>>({})

export const formReadyForSubmitAtom = atom(false)

// TODO: Remove hardcoded value
export const daoTokenAddressAtom = atom<Address | undefined>(
  '0xaB36452DbAC151bE02b16Ca17d8919826072f64a'
)
