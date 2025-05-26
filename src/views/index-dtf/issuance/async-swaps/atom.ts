import { balancesAtom, chainIdAtom, TokenBalance } from '@/state/atoms'
import { indexDTFPriceAtom } from '@/state/dtf/atoms'
import { Token } from '@/types'
import { reducedZappableTokens } from '@/views/yield-dtf/issuance/components/zapV2/constants'
import { EnrichedOrder, OrderStatus } from '@cowprotocol/cow-sdk'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { Address, parseEther, parseUnits } from 'viem'
import { AsyncSwapOrderResponse, QuoteAggregated } from './types'

const ASYNC_SWAP_BUFFER = 0.005

// Main Atoms
export const operationAtom = atom<'mint' | 'redeem'>('mint')
export const userInputAtom = atomWithReset<string>('')
export const indexDTFBalanceAtom = atom<bigint>(0n)
export const asyncSwapResponseAtom = atom<AsyncSwapOrderResponse | undefined>(
  undefined
)
export const txHashAtom = atom<string | undefined>(undefined) // tx hash for minting or redeeming
export const redeemAssetsAtom = atom<Record<Address, bigint>>({})
export const quotesAtom = atom<Record<Address, QuoteAggregated>>({})
export const orderIdsAtom = atom<string[]>([])
export const ordersAtom = atom<Record<string, EnrichedOrder>>({})

export const refetchQuotesAtom = atom<{ fn: () => void }>({ fn: () => {} })
export const fetchingQuotesAtom = atom<boolean>(false)

export const isMintingAtom = atom<boolean>(false)
export const successAtom = atom<boolean>(false)

// Render Atoms
export const openCollateralPanelAtom = atom<boolean>(true)
export const showSettingsAtom = atom<boolean>(false)

// Computed Atoms
export const selectedTokenAtom = atom<Token>((get) => {
  const chainId = get(chainIdAtom)
  return reducedZappableTokens[chainId][2] // USDC
})

export const selectedTokenBalanceAtom = atom<TokenBalance | undefined>(
  (get) => {
    const balances = get(balancesAtom)
    const token = get(selectedTokenAtom)
    return balances[token.address]
  }
)

export const insufficientBalanceAtom = atom<boolean>((get) => {
  const inputAmount = get(userInputAtom)
  const operation = get(operationAtom)
  const selectedToken = get(selectedTokenAtom)
  const selectedTokenBalance = get(selectedTokenBalanceAtom)
  const indexDTFParsedBalance = get(indexDTFBalanceAtom)
  return operation === 'mint'
    ? parseUnits(inputAmount, selectedToken.decimals) >
        (selectedTokenBalance?.value || 0n)
    : parseEther(inputAmount) > indexDTFParsedBalance
})

export const collateralAcquiredAtom = atom<boolean>((get) => {
  const asyncSwapResponse = get(asyncSwapResponseAtom)
  return Boolean(
    asyncSwapResponse?.cowswapOrders.every(
      (order) => order.status === OrderStatus.FULFILLED
    )
  )
})

export const mintValueAtom = atom<number>((get) => {
  const inputAmount = get(userInputAtom)
  const dtfPrice = get(indexDTFPriceAtom)
  const result =
    ((Number(inputAmount) || 0) / (dtfPrice ?? 1)) * (1 - ASYNC_SWAP_BUFFER)

  // 0.000001 is the minimum to avoid exponential notation when converting to string
  return result > 0 && result < 0.000001 ? 0.000001 : result
})

export const mintValueUSDAtom = atom<number>((get) => {
  const inputAmount = get(userInputAtom)
  return (Number(inputAmount) || 0) * (1 - ASYNC_SWAP_BUFFER)
})

export const bufferValueAtom = atom<number>((get) => {
  const inputAmount = get(userInputAtom)
  return (Number(inputAmount) || 0) * ASYNC_SWAP_BUFFER
})

export const mintValueWeiAtom = atom<bigint>((get) => {
  const amountOut = get(mintValueAtom)
  return parseEther(amountOut.toString())
})
