import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import Copy from '@/components/ui/copy'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TransactionButtonContainer } from '@/components/ui/transaction-button'
import { cn } from '@/lib/utils'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { wagmiConfig } from '@/state/chain'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFBasketPricesAtom,
  indexDTFPriceAtom,
} from '@/state/dtf/atoms'
import {
  formatCurrency,
  formatTokenAmount,
  getFolioRoute,
  shortenString,
} from '@/utils'
import { ROUTES } from '@/utils/constants'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import {
  AsyncZapExecutionStep,
  fetchTokenPrices,
} from '@reserve-protocol/async-zap-sdk'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  ArrowDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  PenLine,
  RefreshCw,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Address, erc20Abi, formatUnits } from 'viem'
import { useWalletClient } from 'wagmi'
import { readContracts } from 'wagmi/actions'
import { useAsyncZap } from '../async-zap-context'
import LegRow from '../components/leg-row'
import { usePriceImpact } from '../hooks/use-price-impact'
import { useWizardBalances } from '../hooks/use-wizard-balances'
import { formatPriceImpact, HIGH_PRICE_IMPACT } from '../quote-utils'
import {
  dustStartBalancesAtom,
  inputTokenAtom,
  mintAmountAtom,
  redeemAmountAtom,
  slippageAtom,
  useExistingBalancesAtom,
  wizardStepAtom,
} from '../atoms'

// Submit-button label while the execution lifecycle is running (signing happens
// at the button level; the per-leg orders carry their own status pills).
const EXECUTION_BUTTON_LABELS: Partial<Record<AsyncZapExecutionStep, string>> =
  {
    idle: 'Preparing…',
    finalized: 'Preparing…',
    submitting_and_signing: 'Sign in your wallet…',
    waiting_submit_and_sign: 'Confirming…',
    waiting_orders: 'Filling orders…',
    finishing: 'Sign mint…',
    waiting_finish: 'Completing mint…',
  }

const formatOrderCountdown = (seconds: number) => {
  if (seconds <= 0) return '0s'

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes === 0) return `${remainingSeconds}s`

  return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`
}

const ceilDiv = (value: bigint, divisor: bigint) =>
  divisor === 0n ? 0n : (value + divisor - 1n) / divisor

const QuoteSummary = () => {
  const setStep = useSetAtom(wizardStepAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const basketPrices = useAtomValue(indexDTFBasketPricesAtom)
  const indexDTFPrice = useAtomValue(indexDTFPriceAtom)
  const chainId = useAtomValue(chainIdAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const mintAmount = useAtomValue(mintAmountAtom)
  const redeemAmount = useAtomValue(redeemAmountAtom)
  const setMintAmount = useSetAtom(mintAmountAtom)
  const setRedeemAmount = useSetAtom(redeemAmountAtom)
  const slippage = useAtomValue(slippageAtom)
  const account = useAtomValue(walletAtom)
  const { data: walletClient, isLoading: walletClientLoading } =
    useWalletClient({
      chainId,
      account: account as Address | undefined,
      query: {
        enabled: !!account,
      },
    })
  const [useExistingBalances, setUseExistingBalances] = useAtom(
    useExistingBalancesAtom
  )
  const [dustStartBalances, setDustStart] = useAtom(dustStartBalancesAtom)
  const { balanceOf } = useWizardBalances()
  const [collateralExpanded, setCollateralExpanded] = useState(false)
  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000))
  const [finalMintSnapshot, setFinalMintSnapshot] = useState<{
    shares?: bigint
    leftoverCollateralUsd: number
  } | null>(null)

  const { quote, quoteQuery, execution, operation, legStates } = useAsyncZap()
  const isMint = operation === 'mint'
  const mintComplete = isMint && execution.step === 'complete'
  const finalMintLocked =
    isMint &&
    (execution.step === 'finishing' ||
      execution.step === 'waiting_finish' ||
      execution.step === 'complete')
  const displayQuote = finalMintLocked
    ? (execution.activeQuote ?? quote)
    : quote

  // Only CoW swap legs are shown; direct/balance-covered legs aren't swaps.
  const cowLegStates = legStates.filter(
    (ls) => ls.leg.kind === 'cowswap' && ls.leg.assetAmount > 0n
  )
  const legsResolving = cowLegStates.some(
    (ls) => ls.status === 'pending' || ls.status === 'idle'
  )
  // Legs not computed yet but the base quote is still being built.
  const initialLoading = legStates.length === 0 && quoteQuery.isFetching
  // Any quote work in flight: drives aggregate skeletons + the submit spinner.
  const quotesLoading = initialLoading || legsResolving

  const priceImpactLegs = cowLegStates.map((ls) => ls.leg)
  const {
    byLeg: legImpacts,
    aggregate: aggregateImpact,
    actualAggregate: actualAggregateImpact,
  } = usePriceImpact({
    legs: priceImpactLegs,
    quoteToken: inputToken,
    chainId,
    ordersByLegId: execution.ordersByLegId,
  })

  // What the user provides (pay side).
  const payAmountStr = isMint ? mintAmount : redeemAmount
  const parsedPay = Number(payAmountStr) || 0
  const inputBalanceAmount = Number(
    formatUnits(balanceOf(inputToken.address), inputToken.decimals)
  )
  const dtfBalanceAmount = indexDTF
    ? Number(formatUnits(balanceOf(indexDTF.id), 18))
    : 0
  const payBalance = isMint ? inputBalanceAmount : dtfBalanceAmount
  // Only meaningful before execution: once it starts, the balance drops as the
  // DTF burns/tokens move, which would otherwise flip this to a false error.
  const exceedsBalance = parsedPay > payBalance && execution.step === 'idle'
  // Redeem with "use my wallet balances" at 0 shares: convert held basket
  // tokens to the quote token (no DTF redeemed).
  const isConvertHeld = !isMint && useExistingBalances && parsedPay === 0
  const isValidAmount = parsedPay > 0 || isConvertHeld
  const queryClient = useQueryClient()
  const heldCollateralBalances = (basket ?? [])
    .filter(
      (token) =>
        token.address.toLowerCase() !== inputToken.address.toLowerCase()
    )
    .map((token) => ({ token, value: balanceOf(token.address) }))
    .filter(({ value }) => value > 0n)
  const heldCollateralTotalUsd = heldCollateralBalances.reduce(
    (sum, { token, value }) => {
      const amount = Number(formatUnits(value, token.decimals))
      return sum + amount * (basketPrices[token.address.toLowerCase()] ?? 0)
    },
    0
  )
  const heldCollateralCount = heldCollateralBalances.length
  const { data: inputPrices } = useQuery({
    queryKey: ['async-mint/input-price', chainId, inputToken.address],
    queryFn: () =>
      fetchTokenPrices(queryClient, [
        {
          chainId,
          tokenAddress: inputToken.address as Address,
        },
      ]),
    staleTime: 30_000,
    enabled: !!inputToken.address,
  })
  const inputTokenPrice = inputPrices?.[0]?.price ?? 1
  const provideValueUsd = isMint
    ? parsedPay * inputTokenPrice
    : parsedPay * (indexDTFPrice ?? 0)
  const walletCollateralUsedUsd = useExistingBalances
    ? isMint
      ? Math.min(heldCollateralTotalUsd, provideValueUsd)
      : // Redeem settles all held basket tokens, so the full held value applies.
        heldCollateralTotalUsd
    : 0
  const remainingInputTokenAmount =
    isMint && inputTokenPrice > 0
      ? Math.max(
          (provideValueUsd - walletCollateralUsedUsd) / inputTokenPrice,
          0
        )
      : parsedPay
  const fundingSourceTokens =
    isMint && useExistingBalances && walletCollateralUsedUsd > 0
      ? heldCollateralBalances.map(({ token }) => token)
      : []
  const fundingSourceVisibleTokens = fundingSourceTokens.slice(0, 3)
  const fundingSourceOverflowCount = Math.max(
    fundingSourceTokens.length - fundingSourceVisibleTokens.length,
    0
  )
  const fundingSourceStackItemCount =
    1 +
    fundingSourceVisibleTokens.length +
    (fundingSourceOverflowCount > 0 ? 1 : 0)
  const fundingSourceStackOffset = 22
  const fundingSourceStackWidth =
    36 + Math.max(fundingSourceStackItemCount - 1, 0) * fundingSourceStackOffset

  // Quote-derived amounts (folio shares = 18 dec; quoteToken in its decimals).
  const sharesAmount = displayQuote
    ? Number(formatUnits(displayQuote.shares, 18))
    : 0
  // Wallet-sourced output token (e.g. USDC/USDT you already hold, when it's a
  // basket collateral) isn't "received" — only count the quote token coming
  // from the DTF redemption + swaps.
  const walletSourcedQuoteToken = (displayQuote?.legs ?? [])
    .filter(
      (leg) =>
        leg.asset.address.toLowerCase() === inputToken.address.toLowerCase()
    )
    .reduce((sum, leg) => sum + leg.balanceUsed, 0n)
  const receivedQuoteTokenAmount = displayQuote
    ? Number(
        formatUnits(
          displayQuote.totalQuoteTokenAmount - walletSourcedQuoteToken,
          inputToken.decimals
        )
      )
    : 0

  // Receive side.
  const receiveAmount = isMint ? sharesAmount : receivedQuoteTokenAmount
  const receiveSymbol = isMint ? indexDTF?.token.symbol : inputToken.symbol
  const receiveAddress = isMint ? indexDTF?.id : inputToken.address
  const receiveUsdValue = isMint
    ? sharesAmount * (indexDTFPrice ?? 0)
    : receiveAmount * inputTokenPrice
  const expectedOutputImpact =
    isMint && provideValueUsd > 0 && receiveUsdValue > 0
      ? (receiveUsdValue - provideValueUsd) / provideValueUsd
      : undefined
  const directInputTokenCollateralAmount = (displayQuote?.legs ?? [])
    .filter(
      (leg) =>
        leg.kind === 'direct' &&
        leg.asset.address.toLowerCase() === inputToken.address.toLowerCase()
    )
    .reduce((sum, leg) => sum + leg.maxQuoteTokenAmount, 0n)
  const availableCollateralByAddress = new Map<string, bigint>()
  if (displayQuote) {
    for (const folioAsset of displayQuote.folioAssets) {
      const address = folioAsset.asset.address.toLowerCase()
      const currentBalance = balanceOf(folioAsset.asset.address)
      const startBalance = dustStartBalances[address] ?? 0n
      const acquiredBalance =
        currentBalance > startBalance ? currentBalance - startBalance : 0n
      const availableBalance = useExistingBalances
        ? currentBalance
        : acquiredBalance +
          (address === inputToken.address.toLowerCase()
            ? directInputTokenCollateralAmount
            : 0n)
      availableCollateralByAddress.set(
        address,
        availableBalance < currentBalance ? availableBalance : currentBalance
      )
    }
  }
  const computedPostFillMintableShares =
    displayQuote && displayQuote.shares > 0n
      ? displayQuote.folioAssets.reduce<bigint | undefined>(
          (minShares, folioAsset) => {
            if (folioAsset.amount === 0n) return minShares

            const available =
              availableCollateralByAddress.get(
                folioAsset.asset.address.toLowerCase()
              ) ?? 0n
            const shares = (available * displayQuote.shares) / folioAsset.amount

            return minShares === undefined || shares < minShares
              ? shares
              : minShares
          },
          undefined
        )
      : undefined
  const postFillMintableShares = finalMintLocked
    ? (finalMintSnapshot?.shares ??
      execution.mintedShares ??
      computedPostFillMintableShares)
    : computedPostFillMintableShares
  const postFillMintableAmount =
    postFillMintableShares !== undefined
      ? Number(formatUnits(postFillMintableShares, 18))
      : undefined
  const leftoverCollateralUsd =
    finalMintLocked && finalMintSnapshot
      ? finalMintSnapshot.leftoverCollateralUsd
      : displayQuote &&
          displayQuote.shares > 0n &&
          postFillMintableShares !== undefined
        ? displayQuote.folioAssets.reduce((total, folioAsset) => {
            const available =
              availableCollateralByAddress.get(
                folioAsset.asset.address.toLowerCase()
              ) ?? 0n
            const required = ceilDiv(
              folioAsset.amount * postFillMintableShares,
              displayQuote.shares
            )
            const leftover = available > required ? available - required : 0n
            const price =
              basketPrices[folioAsset.asset.address.toLowerCase()] ??
              (folioAsset.asset.address.toLowerCase() ===
              inputToken.address.toLowerCase()
                ? inputTokenPrice
                : 0)

            return (
              total +
              Number(formatUnits(leftover, folioAsset.asset.decimals)) * price
            )
          }, 0)
        : 0

  const hasFailedLegs = cowLegStates.some(
    (ls) => ls.status === 'error' || !!ls.leg.error
  )
  const quoteErrors = quote?.errors ?? []
  const readySwapCount = cowLegStates.filter(
    (ls) => ls.status === 'success'
  ).length
  const swapCount = cowLegStates.length
  const collateralSummary = quotesLoading
    ? swapCount > 0
      ? `Fetching ${swapCount} swap quote${swapCount === 1 ? '' : 's'}`
      : 'Fetching swap quotes'
    : swapCount > 0
      ? `${readySwapCount} swap quote${readySwapCount === 1 ? '' : 's'} ready`
      : 'No swaps needed'
  const isError = execution.step === 'error'
  const orderStates = Object.values(execution.ordersByLegId)
  const orderCount = Math.max(swapCount, orderStates.length)
  const noCollateralOrdersNeeded =
    isMint && orderCount === 0 && !!quote?.success && !quotesLoading
  const isExecuting =
    execution.step !== 'idle' &&
    execution.step !== 'complete' &&
    execution.step !== 'error' &&
    // Collaterals collected, paused for the user to trigger the mint — not
    // actively executing.
    execution.step !== 'collateral_ready'
  // Once submitted, the right-hand "quotes" panel reads as live orders.
  const executionStarted =
    isExecuting || isError || Object.keys(execution.ordersByLegId).length > 0
  const filledOrderCount = orderStates.filter(
    (order) => order.phase === 'fulfilled'
  ).length
  const previousFilledOrderCount = useRef(filledOrderCount)
  const countPulseTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const [countPulseActive, setCountPulseActive] = useState(false)
  const previousOrderPhases = useRef<Record<string, string | undefined>>({})
  const fillAnimationTimeouts = useRef<ReturnType<typeof setTimeout>[]>([])
  const [recentlyFilledLegIds, setRecentlyFilledLegIds] = useState<Set<string>>(
    () => new Set()
  )
  const failedOrderCount = orderStates.filter(
    (order) => order.phase === 'failed' || order.retryable
  ).length
  const pendingOrderCount = Math.max(
    orderCount - filledOrderCount - failedOrderCount,
    0
  )
  const activeOrderExpiries = orderStates
    .filter((order) => order.phase !== 'fulfilled' && order.phase !== 'failed')
    .map((order) => order.order?.validTo)
    .map((validTo) =>
      typeof validTo === 'number' ? validTo : Number(validTo ?? 0)
    )
    .filter((validTo) => Number.isFinite(validTo) && validTo > 0)
  const nextOrderExpiry =
    activeOrderExpiries.length > 0
      ? Math.min(...activeOrderExpiries)
      : undefined
  const orderExpirySeconds =
    nextOrderExpiry !== undefined
      ? Math.max(nextOrderExpiry - nowSec, 0)
      : undefined
  const orderExpiryCountdown =
    orderExpirySeconds !== undefined
      ? formatOrderCountdown(orderExpirySeconds)
      : undefined
  const collateralPanelSummaryLabel = executionStarted
    ? orderCount > 0
      ? `${filledOrderCount}/${orderCount} Orders filled`
      : 'Orders'
    : swapCount > 0
      ? `${swapCount} order${swapCount === 1 ? '' : 's'}`
      : 'Orders'

  useEffect(() => {
    if (
      executionStarted &&
      orderCount > 0 &&
      filledOrderCount > previousFilledOrderCount.current
    ) {
      setCountPulseActive(true)
      if (countPulseTimeout.current) {
        clearTimeout(countPulseTimeout.current)
      }
      countPulseTimeout.current = setTimeout(() => {
        setCountPulseActive(false)
      }, 800)
    }

    previousFilledOrderCount.current = filledOrderCount
  }, [executionStarted, filledOrderCount, orderCount])

  useEffect(() => {
    return () => {
      if (countPulseTimeout.current) {
        clearTimeout(countPulseTimeout.current)
      }
    }
  }, [])

  useEffect(() => {
    const newlyFilledLegIds: string[] = []

    for (const order of orderStates) {
      const previousPhase = previousOrderPhases.current[order.legId]

      if (
        executionStarted &&
        order.phase === 'fulfilled' &&
        previousPhase &&
        previousPhase !== 'fulfilled'
      ) {
        newlyFilledLegIds.push(order.legId)
      }

      previousOrderPhases.current[order.legId] = order.phase
    }

    if (newlyFilledLegIds.length === 0) return

    setRecentlyFilledLegIds((current) => {
      const next = new Set(current)
      for (const legId of newlyFilledLegIds) next.add(legId)
      return next
    })

    const timeout = setTimeout(() => {
      setRecentlyFilledLegIds((current) => {
        const next = new Set(current)
        for (const legId of newlyFilledLegIds) next.delete(legId)
        return next
      })
    }, 1800)

    fillAnimationTimeouts.current.push(timeout)
  }, [executionStarted, orderStates])

  useEffect(() => {
    return () => {
      for (const timeout of fillAnimationTimeouts.current) {
        clearTimeout(timeout)
      }
    }
  }, [])

  const collateralPanelSummaryAction = collateralExpanded
    ? executionStarted
      ? 'Hide orders'
      : 'Hide quotes'
    : executionStarted
      ? 'View orders'
      : 'View quotes'
  const collateralPanelSecondaryText =
    executionStarted && orderExpiryCountdown !== undefined
      ? 'Orders expire in'
      : collateralPanelSummaryAction
  const showCollateralPanelChevron =
    !executionStarted || orderExpiryCountdown === undefined
  const collateralProgressDetail = executionStarted
    ? failedOrderCount > 0
      ? `${failedOrderCount} need retry`
      : execution.step === 'collateral_ready' ||
          execution.step === 'finishing' ||
          execution.step === 'waiting_finish'
        ? 'Ready to mint'
        : orderExpirySeconds !== undefined
          ? `Orders expire in ${formatOrderCountdown(orderExpirySeconds)}`
          : pendingOrderCount > 0
            ? `${pendingOrderCount} pending`
            : 'Waiting for orders'
    : undefined
  const showFinalMintAction =
    isMint &&
    (execution.step === 'finishing' || execution.step === 'waiting_finish')
  const collateralReady =
    !isMint ||
    noCollateralOrdersNeeded ||
    (executionStarted &&
      ((orderCount > 0 && filledOrderCount === orderCount) ||
        (orderCount === 0 && !!quote?.success && !quotesLoading)))
  // `collateralReady` is mint-only (collaterals acquired → show the Mint CTA);
  // it's hard-coded `true` for redeem, so guard the redeem-facing flags with
  // `isMint` so redeem still gets its start CTA and existing-collateral toggle.
  const showCollateralAction =
    !showFinalMintAction &&
    !noCollateralOrdersNeeded &&
    (!isMint || !collateralReady)
  const canStartFinalMint =
    isMint && collateralReady && !showFinalMintAction && !isError
  const showReadyMintOutput = isMint && (collateralReady || showFinalMintAction)
  const existingCollateralToggleDisabled =
    isExecuting ||
    executionStarted ||
    mintComplete ||
    (isMint && collateralReady)
  const showExistingCollateralToggle =
    !executionStarted && (isMint ? !isConvertHeld && !collateralReady : true)
  const showEditInputButton = !executionStarted
  const mintTransactionHash =
    execution.finishBatch?.status?.receipts?.find(
      (receipt) => !!receipt.transactionHash
    )?.transactionHash ?? execution.finishBatch?.id
  const mintTransactionExplorerLink =
    mintTransactionHash && /^0x[a-fA-F0-9]{64}$/.test(mintTransactionHash)
      ? getExplorerLink(
          mintTransactionHash,
          chainId,
          ExplorerDataType.TRANSACTION
        )
      : undefined
  const readyMintOutputAmount = postFillMintableAmount ?? receiveAmount
  const outputUsdValue =
    showReadyMintOutput && indexDTFPrice !== undefined
      ? readyMintOutputAmount * indexDTFPrice
      : receiveUsdValue
  const outputVsInputDelta = outputUsdValue - provideValueUsd
  const outputVsInputDeltaLabel = `${outputVsInputDelta >= 0 ? '+' : '-'}$${formatCurrency(
    Math.abs(outputVsInputDelta)
  )}`
  const mintButtonLabel = canStartFinalMint
    ? `Mint ${receiveSymbol}`
    : failedOrderCount
      ? 'Resolve failed orders'
      : executionStarted
        ? pendingOrderCount > 0
          ? 'Waiting for collateral'
          : 'Preparing mint'
        : 'Acquire assets before minting'
  const showFilledImpactMetrics =
    isMint &&
    executionStarted &&
    orderCount > 0 &&
    filledOrderCount === orderCount
  const walletClientMissing = !!account && !walletClient

  const impactValueClassName = (impact: number | undefined) =>
    cn(
      'font-medium',
      impact !== undefined && impact < 0 && 'text-destructive',
      impact !== undefined && impact > 0 && 'text-primary',
      impact !== undefined && impact === 0 && 'text-muted-foreground'
    )

  useEffect(() => {
    if (!executionStarted || activeOrderExpiries.length === 0) return

    const interval = window.setInterval(() => {
      setNowSec(Math.floor(Date.now() / 1000))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [executionStarted, activeOrderExpiries.length])

  // The whole lifecycle runs in place on this screen; only completion advances.
  useEffect(() => {
    if (execution.step === 'complete' && !isMint) {
      setStep('success')
    }
  }, [execution.step, isMint, setStep])

  const handleEdit = () => {
    setFinalMintSnapshot(null)
    execution.reset()
    setStep('configure')
  }

  const handleNewMint = () => {
    setFinalMintSnapshot(null)
    execution.reset()
    setMintAmount('')
    setRedeemAmount('')
    setStep('configure')
  }

  // Resumable: re-running after an error / rejected signature continues from
  // where it stopped without re-doing already-submitted orders.
  const handleRetry = () => {
    if (walletClientMissing) return

    setCollateralExpanded(true)
    void execution.run()
  }

  // Failed/expired orders that can be re-submitted (new CoW orders + signature).
  const retryableLegIds = execution.getRetryableLegIds()
  const handleRetryFailed = () => {
    if (walletClientMissing) return

    setCollateralExpanded(true)
    void execution.retryFailedOrders()
  }

  const handleMint = () => {
    if (walletClientMissing) return

    setFinalMintSnapshot({
      shares: postFillMintableShares,
      leftoverCollateralUsd,
    })
    void execution.finish()
  }

  const handleSubmit = async () => {
    if (walletClientMissing) return

    setFinalMintSnapshot(null)
    setCollateralExpanded(true)
    // Snapshot basket + quote-token balances so we can show leftover dust
    // after the operation (SDK uses sell orders → outputs leave residue).
    if (account && quote) {
      const tokenAddrs = [
        ...quote.folioAssets.map((fa) => fa.asset.address),
        inputToken.address as Address,
      ]
      try {
        const results = await readContracts(wagmiConfig, {
          contracts: tokenAddrs.map((address) => ({
            address,
            abi: erc20Abi,
            functionName: 'balanceOf' as const,
            args: [account as Address] as const,
            chainId,
          })),
        })
        const snapshot: Record<string, bigint> = {}
        tokenAddrs.forEach((addr, i) => {
          const r = results[i]
          snapshot[addr.toLowerCase()] =
            r.status === 'success' ? (r.result as bigint) : 0n
        })
        setDustStart(snapshot)
      } catch {
        setDustStart({})
      }
    }
    void execution.run()
  }

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full lg:h-full">
      <div className="grid w-full gap-0.5 lg:h-full lg:grid-cols-2 lg:items-stretch">
        <div
          className={cn(
            'min-w-0 flex flex-col lg:col-start-1',
            isMint ? 'gap-0' : 'gap-0.5'
          )}
        >
          <div
            className="bg-card rounded-2xl p-2"
            style={{ viewTransitionName: isMint ? 'async-mint-step-1' : '' }}
          >
            <div className="mb-1 px-4 py-3 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium text-base">
                  {mintComplete
                    ? 'Input confirmed'
                    : isMint
                      ? 'Review input amount'
                      : 'Redeem amount'}
                </h3>
                <p className="mt-px text-sm text-muted-foreground font-light">
                  {mintComplete
                    ? 'Used to acquire the required assets.'
                    : isMint
                      ? 'Confirm the value to put toward this mint.'
                      : isConvertHeld
                        ? `Converting basket tokens held in your wallet to ${inputToken.symbol}.`
                        : `Redeeming ${indexDTF?.token.symbol} for ${inputToken.symbol}.`}
                </p>
              </div>
              {showEditInputButton && (
                <button
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground disabled:opacity-50 disabled:pointer-events-none"
                  onClick={handleEdit}
                  disabled={isExecuting}
                  aria-label="Edit input amount"
                >
                  <PenLine size={16} />
                </button>
              )}
            </div>
            <div className="overflow-hidden rounded-xl border border-border/70 bg-transparent">
              <div className="px-4 py-3">
                <div className="mb-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                  <span>You provide</span>
                  {showExistingCollateralToggle && (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={useExistingBalances}
                      className={cn(
                        'flex items-center gap-2 text-sm font-light text-muted-foreground disabled:pointer-events-none disabled:opacity-50',
                        !existingCollateralToggleDisabled &&
                          'hover:text-foreground'
                      )}
                      onClick={() =>
                        setUseExistingBalances(!useExistingBalances)
                      }
                      disabled={existingCollateralToggleDisabled}
                    >
                      <span>
                        Existing collateral · $
                        {formatCurrency(
                          useExistingBalances
                            ? walletCollateralUsedUsd
                            : heldCollateralTotalUsd
                        )}{' '}
                        {useExistingBalances ? 'applied' : 'available'}
                      </span>
                      <span
                        className={cn(
                          'relative h-3.5 w-6 rounded-full bg-muted-foreground/30 transition-colors',
                          useExistingBalances && 'bg-primary'
                        )}
                      >
                        <span
                          className={cn(
                            'absolute left-0.5 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-background transition-transform',
                            useExistingBalances && 'translate-x-2.5'
                          )}
                        />
                      </span>
                    </button>
                  )}
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {isConvertHeld ? (
                      <>
                        <div className="flex h-8 min-w-0 items-center">
                          <span className="text-base font-light leading-8 text-primary">
                            Basket tokens in your wallet
                          </span>
                        </div>
                        <div className="mt-2 text-sm font-light text-muted-foreground">
                          Converted to {inputToken.symbol} — see breakdown
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-8 min-w-0 items-center">
                          <span
                            className={cn(
                              'min-w-0 truncate text-[28px] font-light leading-7 text-primary',
                              exceedsBalance && 'text-destructive'
                            )}
                          >
                            {isMint && useExistingBalances
                              ? `$${formatCurrency(provideValueUsd)}`
                              : isMint
                                ? payAmountStr || '0.00'
                                : payAmountStr || '0'}
                          </span>
                        </div>
                        <div className="mt-2 text-sm font-light text-muted-foreground">
                          {isMint && useExistingBalances
                            ? `${formatCurrency(remainingInputTokenAmount)} ${inputToken.symbol} + $${formatCurrency(walletCollateralUsedUsd)} existing collateral`
                            : isMint
                              ? `$${formatCurrency(provideValueUsd)}`
                              : `${formatTokenAmount(parsedPay)} ${indexDTF?.token.symbol}`}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {!isConvertHeld && (
                      <div className="flex h-8 items-center gap-2">
                        {isMint && useExistingBalances ? (
                          <div
                            className="relative h-9 shrink-0"
                            style={{ width: fundingSourceStackWidth }}
                          >
                            <div
                              className="absolute top-1/2 rounded-full border-2 border-card bg-card"
                              style={{
                                left: 0,
                                zIndex: fundingSourceStackItemCount,
                                transform: 'translateY(-50%)',
                              }}
                            >
                              <TokenLogo
                                address={inputToken.address}
                                symbol={inputToken.symbol}
                                chain={chainId}
                                size="xl"
                              />
                            </div>
                            {fundingSourceVisibleTokens.map((token, i) => (
                              <div
                                key={token.address}
                                className="absolute top-1/2 rounded-full border-2 border-card bg-card"
                                style={{
                                  left: (i + 1) * fundingSourceStackOffset,
                                  zIndex: fundingSourceStackItemCount - i - 1,
                                  transform: 'translateY(-50%)',
                                }}
                              >
                                <TokenLogo
                                  address={token.address}
                                  symbol={token.symbol}
                                  chain={chainId}
                                  size="xl"
                                />
                              </div>
                            ))}
                            {fundingSourceOverflowCount > 0 && (
                              <div
                                className="absolute top-1/2 flex size-8 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium text-muted-foreground"
                                style={{
                                  left:
                                    (fundingSourceVisibleTokens.length + 1) *
                                    fundingSourceStackOffset,
                                  zIndex: fundingSourceStackItemCount + 1,
                                  transform: 'translateY(-50%)',
                                }}
                              >
                                +{fundingSourceOverflowCount}
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <TokenLogoWithChain
                              address={
                                isMint ? inputToken.address : indexDTF?.id
                              }
                              symbol={
                                isMint
                                  ? inputToken.symbol
                                  : indexDTF?.token.symbol
                              }
                              chain={chainId}
                              size="xl"
                              width={28}
                              height={28}
                            />
                            <span className="text-[28px] font-light leading-7 text-muted-foreground">
                              {isMint
                                ? inputToken.symbol
                                : indexDTF?.token.symbol}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {exceedsBalance && (
              <div className="mt-0.5 rounded-xl bg-destructive/10 text-destructive text-sm py-3 px-4">
                Exceeds available balance
              </div>
            )}
          </div>

          {isMint && (
            <div className="pointer-events-none relative z-10 h-0.5">
              <div className="absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-secondary">
                <div className="flex size-8 items-center justify-center rounded-full bg-card text-muted-foreground">
                  {collateralReady ? (
                    <Check size={16} />
                  ) : (
                    <ArrowDown size={16} />
                  )}
                </div>
              </div>
            </div>
          )}

          <div
            className="bg-card rounded-2xl p-2"
            style={{ viewTransitionName: isMint ? 'async-mint-step-2' : '' }}
          >
            <button
              type="button"
              className="group mb-1 flex w-full items-start justify-between gap-4 px-4 py-3 text-left"
              onClick={() => setCollateralExpanded((open) => !open)}
            >
              <div className="min-w-0">
                <h3 className="font-medium text-base">
                  {isMint ? (
                    collateralReady ? (
                      'Collateral acquired'
                    ) : (
                      <>
                        Trade {useExistingBalances ? 'remaining ' : ''}
                        {inputToken.symbol} into collateral
                      </>
                    )
                  ) : (
                    'Sell collateral'
                  )}
                </h3>
                <div className="mt-px text-sm font-light text-muted-foreground">
                  {isMint
                    ? collateralReady
                      ? 'Required assets are ready for minting.'
                      : `Split ${inputToken.symbol} across basket assets.`
                    : collateralSummary}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-right">
                <div className="min-w-0 text-right">
                  <div
                    className={cn(
                      'text-base font-medium leading-6 transition-colors group-hover:text-primary group-focus-visible:text-primary',
                      !executionStarted && 'text-muted-foreground',
                      countPulseActive &&
                        'motion-safe:animate-[async-mint-count-pulse_800ms_ease-out]'
                    )}
                  >
                    {collateralPanelSummaryLabel}
                  </div>
                  <div
                    className={cn(
                      'mt-px inline-flex items-center justify-end gap-1 text-sm font-light leading-5 text-muted-foreground transition-colors group-hover:text-primary group-focus-visible:text-primary',
                      executionStarted &&
                        failedOrderCount > 0 &&
                        'text-destructive'
                    )}
                  >
                    <span>{collateralPanelSecondaryText}</span>
                    {executionStarted && orderExpiryCountdown !== undefined && (
                      <span className="font-medium text-foreground">
                        {orderExpiryCountdown}
                      </span>
                    )}
                    {showCollateralPanelChevron &&
                      (collateralExpanded ? (
                        <ChevronLeft size={16} className="-mr-1" />
                      ) : (
                        <ChevronRight size={16} className="-mr-1" />
                      ))}
                  </div>
                  {executionStarted && collateralProgressDetail ? (
                    <div
                      className={cn(
                        'sr-only',
                        failedOrderCount > 0 && 'text-destructive'
                      )}
                    >
                      {collateralProgressDetail}
                    </div>
                  ) : null}
                </div>
              </div>
            </button>

            {quoteErrors.length > 0 && (
              <div className="mx-4 mb-3 rounded-xl border border-destructive/25 bg-destructive/10 text-destructive px-4 py-2 text-sm">
                {quoteErrors.map((e) => e.message).join(' ')}
              </div>
            )}

            {showCollateralAction && (
              <div className="pb-2">
                {isError && execution.error && (
                  <div className="mb-2 rounded-xl border border-destructive/25 bg-destructive/10 text-destructive px-4 py-2 text-sm">
                    {execution.error.message}
                  </div>
                )}
                {isError ? (
                  <div className="flex flex-col gap-2">
                    <Button
                      size="lg"
                      className="w-full h-[49px] rounded-[12px]"
                      onClick={
                        retryableLegIds.length > 0
                          ? handleRetryFailed
                          : handleRetry
                      }
                    >
                      {retryableLegIds.length > 0
                        ? `Retry ${retryableLegIds.length} failed order${
                            retryableLegIds.length > 1 ? 's' : ''
                          }`
                        : 'Try again'}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full h-[49px] rounded-[12px]"
                      onClick={handleEdit}
                    >
                      Start over
                    </Button>
                  </div>
                ) : (
                  <TransactionButtonContainer chain={chainId}>
                    <Button
                      size="lg"
                      className="w-full h-[49px] rounded-[12px]"
                      disabled={
                        isExecuting ||
                        quotesLoading ||
                        !isValidAmount ||
                        exceedsBalance ||
                        !quote?.success ||
                        quoteErrors.length > 0 ||
                        hasFailedLegs ||
                        walletClientMissing
                      }
                      onClick={handleSubmit}
                    >
                      {isExecuting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          {EXECUTION_BUTTON_LABELS[execution.step] ??
                            'Working…'}
                        </span>
                      ) : quotesLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Fetching quotes...
                        </span>
                      ) : walletClientLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Preparing wallet...
                        </span>
                      ) : walletClientMissing ? (
                        <span className="font-medium">Reconnect wallet</span>
                      ) : (
                        <span className="font-medium">
                          {isMint
                            ? 'Start collateral trades'
                            : 'Prepare redeem'}
                        </span>
                      )}
                    </Button>
                  </TransactionButtonContainer>
                )}
              </div>
            )}

            <div className="mt-2 flex items-center gap-6 px-4 pb-3 text-sm">
              <div className="flex flex-1 items-center justify-between gap-3">
                <span className="text-muted-foreground">
                  {showFilledImpactMetrics ? 'Quoted impact' : 'Price impact'}
                </span>
                <span
                  className={cn(
                    showFilledImpactMetrics
                      ? 'font-medium text-muted-foreground line-through'
                      : impactValueClassName(aggregateImpact)
                  )}
                >
                  {quotesLoading ? (
                    <Skeleton className="h-4 w-12" />
                  ) : aggregateImpact === undefined ? (
                    '-'
                  ) : (
                    formatPriceImpact(aggregateImpact)
                  )}
                </span>
              </div>
              <div className="h-4 w-px shrink-0 bg-border/70" />
              <div className="flex flex-1 items-center justify-between gap-3">
                <span className="text-muted-foreground">
                  {showFilledImpactMetrics ? 'Actual impact' : 'Max slippage'}
                </span>
                {showFilledImpactMetrics ? (
                  <span className={impactValueClassName(actualAggregateImpact)}>
                    {actualAggregateImpact === undefined
                      ? '-'
                      : formatPriceImpact(actualAggregateImpact)}
                  </span>
                ) : (
                  <span className="font-medium">
                    {(Number(slippage) / 100).toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {isMint && (
            <div className="pointer-events-none relative z-10 h-0.5">
              <div className="absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-secondary">
                <div className="flex size-8 items-center justify-center rounded-full bg-card text-muted-foreground">
                  {collateralReady ? (
                    <Check size={16} />
                  ) : (
                    <ArrowDown size={16} />
                  )}
                </div>
              </div>
            </div>
          )}

          <div
            className="bg-card rounded-2xl p-2"
            style={{ viewTransitionName: isMint ? 'async-mint-step-3' : '' }}
          >
            <div className="mb-1 flex items-start justify-between gap-4 px-4 py-3">
              <div>
                <h3 className="font-medium text-base">
                  {mintComplete ? (
                    'Mint completed'
                  ) : isMint ? (
                    <>Mint {receiveSymbol}</>
                  ) : (
                    'Quote review'
                  )}
                </h3>
                <p className="mt-px text-sm text-muted-foreground font-light">
                  {mintComplete
                    ? 'Your DTF has been minted.'
                    : isMint
                      ? 'Use the acquired collateral to mint the DTF.'
                      : 'Inputs are locked while swap quotes are fetched.'}
                </p>
              </div>
              {mintComplete ? (
                <div className="inline-flex h-8 items-center gap-1.5 text-sm text-muted-foreground">
                  {mintTransactionExplorerLink ? (
                    <a
                      href={mintTransactionExplorerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {mintTransactionHash
                        ? shortenString(mintTransactionHash)
                        : null}
                    </a>
                  ) : mintTransactionHash ? (
                    <span className="font-medium text-foreground">
                      {shortenString(mintTransactionHash)}
                    </span>
                  ) : null}
                  {mintTransactionHash && (
                    <Copy
                      value={mintTransactionHash}
                      size={13}
                      className="text-muted-foreground hover:text-foreground"
                    />
                  )}
                </div>
              ) : (
                <button
                  className="rounded-[12px] border border-border/70 bg-transparent h-8 w-8 flex items-center justify-center transition-colors hover:bg-primary hover:text-primary-foreground"
                  onClick={() => quoteQuery.refetch()}
                  disabled={quoteQuery.isFetching || isExecuting}
                >
                  <RefreshCw
                    size={16}
                    className={quoteQuery.isFetching ? 'animate-spin' : ''}
                  />
                </button>
              )}
            </div>

            <div className="rounded-xl border border-border/70 bg-transparent px-4 py-3">
              <div className="text-sm text-muted-foreground mb-3">
                {mintComplete ? (
                  'Minted'
                ) : showReadyMintOutput ? (
                  'Ready to mint'
                ) : isMint ? (
                  <span className="inline-flex items-center gap-1">
                    <span>Estimated output</span>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info
                            size={14}
                            className="cursor-help text-muted-foreground/70"
                          />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[280px]">
                          Based on current collateral quotes. Your final mint
                          amount is calculated from the assets acquired after
                          trades complete.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                ) : (
                  'You receive'
                )}
              </div>
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {quotesLoading ? (
                      <div>
                        <Skeleton className="mb-2 h-8 w-[120px]" />
                        {isMint && <Skeleton className="h-4 w-[96px]" />}
                      </div>
                    ) : (
                      <div className="flex h-8 min-w-0 items-center">
                        <span
                          className={cn(
                            'min-w-0 truncate text-[28px] font-light leading-7',
                            collateralReady ||
                              showFinalMintAction ||
                              mintComplete
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          )}
                        >
                          {isMint
                            ? `${showReadyMintOutput ? '' : '~'}${formatTokenAmount(
                                showReadyMintOutput
                                  ? readyMintOutputAmount
                                  : receiveAmount
                              )}`
                            : `$${formatCurrency(receiveAmount)}`}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <div className="flex items-center gap-2">
                      <TokenLogoWithChain
                        address={receiveAddress}
                        symbol={receiveSymbol}
                        chain={chainId}
                        size="xl"
                        width={28}
                        height={28}
                      />
                      <span className="text-[28px] font-light text-muted-foreground leading-7">
                        {receiveSymbol}
                      </span>
                    </div>
                  </div>
                </div>
                {isMint && !quotesLoading && (
                  <div className="mt-2 flex items-center justify-between gap-4 text-sm font-light text-muted-foreground">
                    <div>
                      {showReadyMintOutput ? '' : '~'}$
                      {formatCurrency(outputUsdValue)}
                      {showReadyMintOutput
                        ? ` (${outputVsInputDeltaLabel} vs original input)`
                        : null}
                      {!showReadyMintOutput &&
                        expectedOutputImpact !== undefined &&
                        ` (${formatPriceImpact(expectedOutputImpact)})`}
                    </div>
                    {showReadyMintOutput && (
                      <div className="flex shrink-0 items-center gap-1 text-right">
                        <span>
                          +${formatCurrency(leftoverCollateralUsd)} leftover
                          collateral
                        </span>
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info
                                size={14}
                                className="cursor-help text-muted-foreground/70"
                              />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[280px]">
                              Leftover collateral is not included in the DTF
                              output value. It may remain because minting uses
                              fixed basket ratios.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {isMint && (
              <div className="pt-2">
                {mintComplete ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-[49px] rounded-[12px]"
                      onClick={handleNewMint}
                    >
                      New mint
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      className="h-[49px] rounded-[12px]"
                    >
                      <Link
                        to={getFolioRoute(
                          indexDTF?.id ?? '',
                          chainId,
                          ROUTES.OVERVIEW
                        )}
                      >
                        View DTF
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <TransactionButtonContainer chain={chainId}>
                    <Button
                      size="lg"
                      className="w-full h-[49px] rounded-[12px]"
                      disabled={
                        !canStartFinalMint ||
                        showFinalMintAction ||
                        walletClientMissing
                      }
                      onClick={handleMint}
                    >
                      {showFinalMintAction ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          {EXECUTION_BUTTON_LABELS[execution.step] ??
                            'Working…'}
                        </span>
                      ) : walletClientLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Preparing wallet...
                        </span>
                      ) : walletClientMissing ? (
                        <span className="font-medium">Reconnect wallet</span>
                      ) : (
                        <span className="font-medium">{mintButtonLabel}</span>
                      )}
                    </Button>
                  </TransactionButtonContainer>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-background rounded-2xl p-2 lg:col-start-2 lg:relative lg:min-h-0 lg:overflow-hidden animate-in fade-in duration-500 transition-none">
          {/* On desktop this fills the column (stretched to the left column's
              height via the grid) without inflating it, so the modal stays the
              height of the form and the orders list scrolls inside. */}
          <div className="contents lg:absolute lg:inset-2 lg:flex lg:flex-col">
            {collateralExpanded && (
              <div className="px-4 py-3 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-base">
                    {mintComplete
                      ? 'Completed orders'
                      : executionStarted
                        ? 'Orders'
                        : 'Collateral swaps'}
                  </h3>
                  <p className="text-sm text-muted-foreground font-light">
                    {executionStarted
                      ? 'Swaps settle via CoW Protocol solvers.'
                      : cowLegStates.length === 0 && !quotesLoading
                        ? 'No swaps are needed for this operation.'
                        : isMint
                          ? 'The basket assets bought with your input.'
                          : 'The basket assets sold for your output.'}
                  </p>
                </div>
              </div>
            )}

            <ScrollArea className="h-[min(620px,calc(100vh-290px))] min-h-[360px] lg:h-auto lg:min-h-0 lg:flex-1">
              <div className="flex min-h-full flex-col gap-1 px-2">
                {!collateralExpanded ? null : initialLoading ? (
                  [0, 1, 2].map((item) => (
                    <Skeleton key={item} className="h-[76px] rounded-[18px]" />
                  ))
                ) : cowLegStates.length > 0 ? (
                  <>
                    {cowLegStates.map((ls) => (
                      <LegRow
                        key={ls.leg.id}
                        leg={ls.leg}
                        inputToken={inputToken}
                        chainId={chainId}
                        executionStep={execution.step}
                        order={execution.ordersByLegId[ls.leg.id]}
                        impact={legImpacts[ls.leg.id]}
                        loading={
                          ls.status === 'pending' || ls.status === 'idle'
                        }
                        fillAnimationActive={recentlyFilledLegIds.has(
                          ls.leg.id
                        )}
                        quoteError={
                          ls.status === 'error'
                            ? ls.leg.error?.message ||
                              ls.error?.message ||
                              'Quote unavailable'
                            : undefined
                        }
                      />
                    ))}
                  </>
                ) : (
                  <div className="flex min-h-[320px] flex-1 items-center justify-center px-4 py-10 text-center">
                    <div className="max-w-[320px]">
                      <h4 className="font-medium text-base">No swaps needed</h4>
                      <p className="mt-1 text-sm text-muted-foreground font-light">
                        You can proceed directly.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuoteSummary
