import useDebounce from '@/hooks/useDebounce'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { safeParseEther } from '@/utils'
import {
  AsyncZapExecution,
  AsyncZapQuote,
  useFolioMintZap,
  useFolioRedeemZap,
} from '@reserve-protocol/async-zap-sdk'
import { UseQueryResult } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { createContext, ReactNode, useContext } from 'react'
import { Address, parseUnits, zeroAddress } from 'viem'
import {
  inputTokenAtom,
  mintAmountAtom,
  operationAtom,
  redeemAmountAtom,
  slippageAtom,
  useExistingBalancesAtom,
} from './atoms'

// Unified shape consumed by the wizard steps, independent of mint/redeem.
type AsyncZapContextValue = {
  operation: 'mint' | 'redeem'
  quote: AsyncZapQuote | undefined
  quoteQuery: UseQueryResult<AsyncZapQuote, Error>
  execution: AsyncZapExecution
}

// Single invocation point. `execution` is instance state, so both hooks are
// called once here and the active one is shared via context.
const AsyncZapContext = createContext<AsyncZapContextValue | null>(null)

export const useAsyncZap = () => {
  const ctx = useContext(AsyncZapContext)
  if (!ctx) {
    throw new Error('useAsyncZap must be used within AsyncZapProvider')
  }
  return ctx
}

export const AsyncZapProvider = ({ children }: { children: ReactNode }) => {
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const account = useAtomValue(walletAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const operation = useAtomValue(operationAtom)
  const mintAmount = useAtomValue(mintAmountAtom)
  const redeemAmount = useAtomValue(redeemAmountAtom)
  const slippage = useAtomValue(slippageAtom)
  const useExistingBalances = useAtomValue(useExistingBalancesAtom)

  // Debounce typed amounts so we don't re-quote on every keystroke.
  const debouncedMint = useDebounce(mintAmount, 500)
  const debouncedRedeem = useDebounce(redeemAmount, 500)

  let inputAmount = 0n
  if (debouncedMint && Number(debouncedMint) > 0) {
    try {
      inputAmount = parseUnits(debouncedMint, inputToken.decimals)
    } catch {
      inputAmount = 0n
    }
  }

  let redeemShares = 0n
  if (debouncedRedeem && Number(debouncedRedeem) > 0) {
    try {
      redeemShares = safeParseEther(debouncedRedeem)
    } catch {
      redeemShares = 0n
    }
  }

  const baseParams = {
    chainId,
    folioAddress: (indexDTF?.id ?? zeroAddress) as Address,
    quoteToken: inputToken.address as Address,
    account: account as Address | undefined,
    slippageBps: Number(slippage) || undefined,
    useExistingBalances,
  }

  const ready = !!indexDTF?.id && !!account

  const mintResult = useFolioMintZap({
    ...baseParams,
    mode: 'maxInput',
    inputAmount,
    enabled: ready && operation === 'mint' && inputAmount > 0n,
  })

  const redeemResult = useFolioRedeemZap({
    ...baseParams,
    shares: redeemShares,
    enabled: ready && operation === 'redeem' && redeemShares > 0n,
  })

  const active = operation === 'mint' ? mintResult : redeemResult

  return (
    <AsyncZapContext.Provider
      value={{
        operation,
        quote: active.quote,
        quoteQuery: active.quoteQuery,
        execution: active.execution,
      }}
    >
      {children}
    </AsyncZapContext.Provider>
  )
}
