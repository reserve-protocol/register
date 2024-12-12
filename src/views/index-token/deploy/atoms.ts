import { atom } from 'jotai'
import { DeployStepId } from './form-fields'
import { Token } from '@/types'
import { atomWithReset } from 'jotai/utils'
import { zappableTokens } from '@/views/rtoken/issuance/components/zapV2/constants'
import { Address } from 'viem'

export const deployStepAtom = atom<DeployStepId | undefined>(undefined)

export const selectedTokensAtom = atomWithReset<Token[]>([])
export const searchTokenAtom = atomWithReset<string>('')

export const basketAtom = atom<Token[]>([])

export const tokenListAtom = atom<Token[]>(zappableTokens[1]) // TODO: replace with real data
export const tokenPricesAtom = atom<Record<Address, number>>({})
