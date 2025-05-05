import { atom } from 'jotai'
import { AsyncSwapOrderResponse } from './types'
import { balancesAtom, chainIdAtom, TokenBalance } from '@/state/atoms'
import { Token } from '@/types'
import { reducedZappableTokens } from '@/views/yield-dtf/issuance/components/zapV2/constants'
import { atomWithReset } from 'jotai/utils'

export const asyncSwapResponseAtom = atom<AsyncSwapOrderResponse | undefined>(
  undefined
)
export const asyncSwapOrderIdAtom = atom<string | undefined>(undefined)

export const currentAsyncSwapTabAtom = atom<'buy' | 'sell'>('buy')
export const showAsyncSwapSettingsAtom = atom<boolean>(false)
export const asyncSwapInputAtom = atomWithReset<string>('')
export const indexDTFBalanceAtom = atom<bigint>(0n)

export const selectedTokenAtom = atom<Token | undefined>(undefined)
export const defaultSelectedTokenAtom = atom<Token>((get) => {
  const chainId = get(chainIdAtom)
  return reducedZappableTokens[chainId][2] // USDC
})
export const selectedTokenOrDefaultAtom = atom<Token>((get) => {
  const chainId = get(chainIdAtom)
  return reducedZappableTokens[chainId][2] // USDC
})

export const selectedTokenBalanceAtom = atom<TokenBalance | undefined>(
  (get) => {
    const balances = get(balancesAtom)
    const token = get(selectedTokenOrDefaultAtom)
    return balances[token.address]
  }
)

export const slippageAtom = atomWithReset<string>('100')
export const forceMintAtom = atomWithReset<boolean>(false)
export const asyncSwapRefetchAtom = atom<{ fn: () => void }>({ fn: () => {} })
export const asyncSwapFetchingAtom = atom<boolean>(false)
export const asyncSwapOngoingTxAtom = atom<boolean>(false)
export const asyncSwapEndpointAtom = atom<string>('')
export const asyncSwapPriceImpactWarningCheckboxAtom = atom(false)
export const asyncSwapHighPriceImpactAtom = atom<boolean>(false)
