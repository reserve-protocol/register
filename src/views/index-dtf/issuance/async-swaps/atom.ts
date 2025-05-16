import { balancesAtom, chainIdAtom, TokenBalance } from '@/state/atoms'
import { indexDTFPriceAtom } from '@/state/dtf/atoms'
import { Token } from '@/types'
import { reducedZappableTokens } from '@/views/yield-dtf/issuance/components/zapV2/constants'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { Address, parseEther } from 'viem'
import { AsyncSwapOrderResponse } from './types'

const ASYNC_SWAP_BUFFER = 0.005

export const asyncSwapResponseAtom = atom<AsyncSwapOrderResponse | undefined>(
  undefined
)
export const asyncSwapOrderIdAtom = atom<string | undefined>(
  // '5d3b5c96-ea7e-4bb2-bb54-40f082fb318d'
  undefined
)

export const collateralAcquiredAtom = atom<boolean>((get) => {
  const asyncSwapResponse = get(asyncSwapResponseAtom)
  return Boolean(
    asyncSwapResponse?.cowswapOrders.every(
      (order) =>
        order.status.type === 'traded' || order.status.type === 'solved'
    )
  )
})
export const collateralPanelOpenAtom = atom<boolean>(false)
export const currentAsyncSwapTabAtom = atom<'mint' | 'redeem'>('mint')
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
export const asyncSwapPriceImpactWarningCheckboxAtom = atom(false)
export const asyncSwapHighPriceImpactAtom = atom<boolean>(false)
export const isMintingAtom = atom<boolean>(false)
export const mintTxHashAtom = atom<string | undefined>(
  // '0x7dc75b765f28b2875c9b2ae52c2fe06472baf17ba0486f195b5b69212018582e'
  undefined
)

export const mintValueAtom = atom<number>((get) => {
  const inputAmount = get(asyncSwapInputAtom)
  const dtfPrice = get(indexDTFPriceAtom)
  return (
    ((Number(inputAmount) || 0) / (dtfPrice ?? 1)) * (1 - ASYNC_SWAP_BUFFER)
  )
})

export const mintValueUSDAtom = atom<number>((get) => {
  const inputAmount = get(asyncSwapInputAtom)
  return (Number(inputAmount) || 0) * (1 - ASYNC_SWAP_BUFFER)
})

export const bufferValueAtom = atom<number>((get) => {
  const inputAmount = get(asyncSwapInputAtom)
  return (Number(inputAmount) || 0) * ASYNC_SWAP_BUFFER
})

export const mintValueWeiAtom = atom<bigint>((get) => {
  const amountOut = get(mintValueAtom)
  return parseEther(amountOut.toString())
})

export const redeemAssetsAtom = atom<Record<Address, bigint>>({})
