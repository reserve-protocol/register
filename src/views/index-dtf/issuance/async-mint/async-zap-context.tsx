import useDebounce from '@/hooks/useDebounce'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFPriceAtom } from '@/state/dtf/atoms'
import { safeParseEther } from '@/utils'
import {
  FolioMintZapResult,
  useFolioMintZap,
} from '@reserve-protocol/async-zap-sdk'
import { useAtomValue } from 'jotai'
import { createContext, ReactNode, useContext } from 'react'
import { Address, parseUnits, zeroAddress } from 'viem'
import {
  inputTokenAtom,
  mintAmountAtom,
  mintStrategyAtom,
  slippageAtom,
} from './atoms'

// Single invocation point for the async-zap SDK mint hook. `execution` is
// instance state (execute/reset/step), so the hook must be called ONCE and
// shared via context — calling it per-step would give each step its own
// detached execution.
const AsyncZapMintContext = createContext<FolioMintZapResult | null>(null)

export const useAsyncZapMint = () => {
  const ctx = useContext(AsyncZapMintContext)
  if (!ctx) {
    throw new Error('useAsyncZapMint must be used within AsyncZapMintProvider')
  }
  return ctx
}

export const AsyncZapMintProvider = ({ children }: { children: ReactNode }) => {
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const dtfPrice = useAtomValue(indexDTFPriceAtom)
  const account = useAtomValue(walletAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const mintAmount = useAtomValue(mintAmountAtom)
  const strategy = useAtomValue(mintStrategyAtom)
  const slippage = useAtomValue(slippageAtom)

  // Debounce the typed amount so we don't re-quote on every keystroke.
  const debouncedAmount = useDebounce(mintAmount, 500)

  let inputAmount = 0n
  if (debouncedAmount && Number(debouncedAmount) > 0) {
    try {
      inputAmount = parseUnits(debouncedAmount, inputToken.decimals)
    } catch {
      inputAmount = 0n
    }
  }

  // SDK expects folioPrice scaled to 18 decimals (FOLIO_PRICE_SCALE = 10^18):
  // priceUsd × 10^18.
  const folioPrice =
    dtfPrice && dtfPrice > 0 ? safeParseEther(dtfPrice.toFixed(18)) : 0n

  const result = useFolioMintZap({
    chainId,
    folioAddress: (indexDTF?.id ?? zeroAddress) as Address,
    quoteToken: inputToken.address as Address,
    account: account as Address | undefined,
    mode: 'maxInput',
    inputAmount,
    folioPrice,
    useExistingBalances: strategy === 'partial',
    cowSlippageBps: Number(slippage) || undefined,
    enabled:
      !!indexDTF?.id && !!account && inputAmount > 0n && folioPrice > 0n,
  })

  return (
    <AsyncZapMintContext.Provider value={result}>
      {children}
    </AsyncZapMintContext.Provider>
  )
}
