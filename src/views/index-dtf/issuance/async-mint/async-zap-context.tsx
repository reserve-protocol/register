import useDebounce from '@/hooks/useDebounce'
import { useIsMetaMask } from '@/hooks/useIsMetaMask'
import { useWatchReadContract } from '@/hooks/useWatchReadContract'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { safeParseEther } from '@/utils'
import {
  AsyncZapExecution,
  AsyncZapLegState,
  AsyncZapQuote,
  useFolioMintZap,
  useFolioRedeemZap,
} from '@reserve-protocol/async-zap-sdk'
import { UseQueryResult } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { createContext, ReactNode, useContext, useEffect, useRef } from 'react'
import { Address, erc20Abi, parseUnits, zeroAddress } from 'viem'
import {
  inputTokenAtom,
  mintAmountAtom,
  operationAtom,
  quoteCanceledAtom,
  redeemAmountAtom,
  slippageAtom,
  useExistingBalancesAtom,
} from './atoms'
import { useTrackAsyncZap } from './hooks/use-track-async-zap'

// MetaMask caps EIP-5792 `wallet_sendCalls` at 10 calls per batch.
const METAMASK_MAX_CALLS_PER_BATCH = 10

// Unified shape consumed by the wizard steps, independent of mint/redeem.
type AsyncZapContextValue = {
  operation: 'mint' | 'redeem'
  quote: AsyncZapQuote | undefined
  quoteQuery: UseQueryResult<AsyncZapQuote, Error>
  // Per-leg state, populated with all legs (skeleton data) before their CoW
  // quotes resolve — drives per-asset loading in the quote screen.
  legStates: AsyncZapLegState[]
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
  // Escape hatch: when the user cancels a slow quote, stop the SDK from
  // (re)fetching. Inputs stay put so they keep their place.
  const quoteCanceled = useAtomValue(quoteCanceledAtom)
  // MetaMask rejects EIP-5792 batches with more than 10 calls; cap the batch size
  // so the SDK splits larger batches into sequential signatures. Other wallets
  // keep a single atomic batch.
  const isMetaMask = useIsMetaMask()

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
    maxCallsPerBatch: isMetaMask ? METAMASK_MAX_CALLS_PER_BATCH : undefined,
  }

  const ready = !!indexDTF?.id && !!account

  // Live DTF share balance. Cap redeem shares to it so a stale/over amount can
  // never build a redeem that exceeds what the wallet holds (reverts on-chain).
  const { data: dtfShareBalance } = useWatchReadContract({
    address: (indexDTF?.id ?? zeroAddress) as Address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [account as Address],
    chainId,
    query: { enabled: ready && operation === 'redeem' },
  })
  // Only cap while idle: once execution starts the balance drops as shares burn,
  // and changing `shares` would reset the in-flight execution (it's in the
  // query key) — wiping the orders. Freeze the submitted amount during the run.
  const executingRef = useRef(false)
  if (
    !executingRef.current &&
    dtfShareBalance !== undefined &&
    redeemShares > dtfShareBalance
  ) {
    redeemShares = dtfShareBalance
  }

  const mintResult = useFolioMintZap({
    ...baseParams,
    mode: 'maxInput',
    inputAmount,
    enabled: ready && operation === 'mint' && inputAmount > 0n && !quoteCanceled,
  })

  const redeemResult = useFolioRedeemZap({
    ...baseParams,
    shares: redeemShares,
    // With "use my wallet balances" on, redeem can run with 0 shares to convert
    // basket tokens already held in the wallet into the quote token.
    enabled:
      ready &&
      operation === 'redeem' &&
      (redeemShares > 0n || useExistingBalances) &&
      !quoteCanceled,
  })

  const active = operation === 'mint' ? mintResult : redeemResult

  // Track whether the active execution has started so the redeem cap above
  // freezes the submitted amount instead of following the dropping balance.
  useEffect(() => {
    executingRef.current = active.execution.step !== 'idle'
  }, [active.execution.step])

  // Lifecycle analytics: fire once per error/completion transition.
  const { track } = useTrackAsyncZap()
  useEffect(() => {
    const ex = active.execution
    if (ex.step === 'error') {
      track('error', {
        errorType: ex.error?.type,
        errorAction: ex.error?.action,
        message: ex.error?.message,
        legId: ex.error?.legId,
        asset: ex.error?.asset,
      })
    } else if (ex.step === 'complete') {
      track('complete', {
        mintedShares: ex.mintedShares?.toString(),
        shares: active.quote?.shares?.toString(),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active.execution.step])

  return (
    <AsyncZapContext.Provider
      value={{
        operation,
        quote: active.quote,
        quoteQuery: active.quoteQuery,
        legStates: active.legStates,
        execution: active.execution,
      }}
    >
      {children}
    </AsyncZapContext.Provider>
  )
}
