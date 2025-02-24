import { balancesAtom, chainIdAtom, TokenBalance } from '@/state/atoms'
import { Token } from '@/types'
import { reducedZappableTokens } from '@/views/yield-dtf/issuance/components/zapV2/constants'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

export const openZapMintModalAtom = atom(false)
export const currentZapMintTabAtom = atom<'buy' | 'sell'>('buy')
export const showZapSettingsAtom = atom<boolean>(false)
export const zapMintInputAtom = atomWithReset<string>('')
export const indexDTFBalanceAtom = atom<bigint>(0n)

export const selectedTokenAtom = atom<Token | undefined>(undefined)
export const defaultSelectedTokenAtom = atom<Token>((get) => {
  const chainId = get(chainIdAtom)
  return reducedZappableTokens[chainId][0]
})
export const selectedTokenOrDefaultAtom = atom<Token>((get) => {
  const selectedToken = get(selectedTokenAtom)
  const defaultToken = get(defaultSelectedTokenAtom)
  return selectedToken || defaultToken
})

export const selectedTokenBalanceAtom = atom<TokenBalance | undefined>(
  (get) => {
    const balances = get(balancesAtom)
    const token = get(selectedTokenOrDefaultAtom)
    return balances[token.address]
  }
)

export const tokensAtom = atom<(Token & { balance?: string })[]>((get) => {
  const chainId = get(chainIdAtom)
  const balances = get(balancesAtom)
  return reducedZappableTokens[chainId].map((token) => ({
    ...token,
    balance: balances[token.address]?.balance,
  }))
})

export const slippageAtom = atomWithReset<string>('100')
export const forceMintAtom = atomWithReset<boolean>(false)
export const zapRefetchAtom = atom<{ fn: () => void }>({ fn: () => {} })
export const zapFetchingAtom = atom<boolean>(false)
export const zapOngoingTxAtom = atom<boolean>(false)
export const zapSwapEndpointAtom = atom<string>('')
