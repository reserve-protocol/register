import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom, useStore } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'
import { Address, formatUnits } from 'viem'
import { getCowswapQuote } from '../../async-swaps/hooks/useQuote'
import { useGlobalProtocolKit } from '../../async-swaps/providers/GlobalProtocolKitProvider'
import {
  ASYNC_MINT_BUFFER,
  ASYNC_MINT_CONVERGENCE_UTILIZATION,
  ASYNC_MINT_MARGINAL_THRESHOLD,
  ASYNC_MINT_MAX_ITERATIONS,
  collateralAllocationAtom,
  effectiveMintSharesAtom,
  FeasibleSnapshot,
  folioDetailsAtom,
  inputTokenAtom,
  INITIAL_ITERATION_STATE,
  IterationRound,
  IterationState,
  iterationStateAtom,
  mintAmountAtom,
  mintQuotesAtom,
  mintSharesAtom,
  quotesTimestampAtom,
  resetIterationAtom,
  tokenPricesAtom,
} from '../atoms'
import { QuoteResult } from '../types'
import {
  applyGreedyClamp,
  detectConvergence,
  measureImpactPerToken,
  predictShrinkageTarget,
  sumQuotedCostBaseUnits,
} from '../utils'

// Per-round CoWSwap fetch. Lives outside useMintQuotes so the orchestrator
// can call it imperatively with a freshly-derived allocation, bypassing
// React/useQuery render timing.
async function fetchQuotesForAllocation({
  allocation,
  sellToken,
  walletAddress,
  orderBookApi,
}: {
  allocation: ReturnType<typeof Object.entries>
  sellToken: Address
  walletAddress: Address
  orderBookApi: any
}): Promise<Record<Address, QuoteResult>> {
  const results: Record<Address, QuoteResult> = {}

  await Promise.all(
    (allocation as [string, { fromSwap: bigint }][]).map(
      async ([tokenAddress, alloc]) => {
        if (alloc.fromSwap <= 0n) return
        try {
          const quote = await getCowswapQuote({
            sellToken,
            buyToken: tokenAddress as Address,
            amount: alloc.fromSwap,
            address: walletAddress,
            operation: 'mint',
            orderBookApi,
          })

          if (quote) {
            results[tokenAddress as Address] = { success: true, data: quote }
          } else {
            results[tokenAddress as Address] = {
              success: false,
              error: 'Quote returned null',
            }
          }
        } catch (error) {
          results[tokenAddress as Address] = {
            success: false,
            error: String(error),
          }
        }
      }
    )
  )

  return results
}

export function useQuoteIteration() {
  const store = useStore()
  const mintAmount = useAtomValue(mintAmountAtom)
  const state = useAtomValue(iterationStateAtom)
  const setEffectiveShares = useSetAtom(effectiveMintSharesAtom)
  const setIterationState = useSetAtom(iterationStateAtom)
  const setMintQuotes = useSetAtom(mintQuotesAtom)
  const setQuotesTimestamp = useSetAtom(quotesTimestampAtom)
  const resetIteration = useSetAtom(resetIterationAtom)
  const { orderBookApi } = useGlobalProtocolKit()
  const abortRef = useRef<AbortController | null>(null)

  // Auto-reset when the user changes the input amount. Iteration becomes
  // meaningless once the budget changes; the next runIteration() call
  // rebuilds from the new seed.
  useEffect(() => {
    abortRef.current?.abort()
    resetIteration()
  }, [mintAmount, resetIteration])

  const runIteration = useCallback(async () => {
    abortRef.current?.abort()
    const abort = new AbortController()
    abortRef.current = abort

    const walletAddress = store.get(walletAtom)
    const inputToken = store.get(inputTokenAtom)
    const folioDetails = store.get(folioDetailsAtom)
    const basket = store.get(indexDTFBasketAtom)
    const amountStr = store.get(mintAmountAtom)
    const seedShares = store.get(mintSharesAtom)
    const amountFloat = Number(amountStr)

    // Pre-checks — if anything's missing, bail without changing state.
    if (
      !walletAddress ||
      !orderBookApi ||
      !folioDetails ||
      !basket ||
      seedShares <= 0n ||
      !isFinite(amountFloat) ||
      amountFloat < 1
    ) {
      return
    }

    // The algorithm targets `adjustedBudgetUsd` (input minus buffer) — that's
    // the sweet spot where the buffer remains intact. `totalBudgetUsd` is the
    // hard cap: any cost above this would actually fail at mint time.
    const adjustedBudgetUsd = amountFloat * (1 - ASYNC_MINT_BUFFER)
    const totalBudgetUsd = amountFloat
    const tokenDecimals: Record<Address, number> = {}
    for (const token of basket) {
      tokenDecimals[token.address.toLowerCase() as Address] = token.decimals
    }

    // Seed the iteration. activeMintSharesAtom = seedShares since override>0.
    setEffectiveShares(seedShares)
    setIterationState({
      ...INITIAL_ITERATION_STATE,
      status: 'iterating',
      round: 0,
      maxRounds: ASYNC_MINT_MAX_ITERATIONS,
    })

    // Two tracks of "best so far":
    //  • bestFitsBuffer = cost ≤ adjustedBudget — ideal, buffer untouched
    //  • bestFitsTotal  = cost ≤ totalBudget — acceptable (ate buffer) fallback
    let bestFitsBuffer: FeasibleSnapshot | null = null
    let bestFitsTotal: FeasibleSnapshot | null = null
    const history: IterationRound[] = []
    let perTokenImpacts: Record<Address, number> = {}
    let prevShares = seedShares
    let lastQuotes: Record<Address, QuoteResult> = {}

    for (let round = 0; round < ASYNC_MINT_MAX_ITERATIONS; round++) {
      if (abort.signal.aborted) return

      // Read allocation AFTER the latest setEffectiveShares so derived atoms
      // recompute against the fresh override.
      const allocation = store.get(collateralAllocationAtom)
      const referencePrices = store.get(tokenPricesAtom)

      const allocEntries = Object.entries(allocation).filter(
        ([_, a]) => a.fromSwap > 0n
      )

      // No swaps needed — wallet-only mint. Nothing to iterate over.
      if (allocEntries.length === 0) {
        setIterationState({
          status: 'converged',
          round,
          maxRounds: ASYNC_MINT_MAX_ITERATIONS,
          history,
          bestFeasible: null,
          perTokenImpacts: {},
        })
        return
      }

      let quotes = await fetchQuotesForAllocation({
        allocation: allocEntries,
        sellToken: inputToken.address as Address,
        walletAddress: walletAddress as Address,
        orderBookApi,
      })

      if (abort.signal.aborted) return

      let costSummary = sumQuotedCostBaseUnits({ quotes, allocation })

      // One inline retry for failed quotes before giving up the round.
      if (!costSummary.allSucceeded && costSummary.failedAddresses.length > 0) {
        const retryEntries = allocEntries.filter(([addr]) =>
          costSummary.failedAddresses.includes(
            addr.toLowerCase() as Address
          )
        )
        const retried = await fetchQuotesForAllocation({
          allocation: retryEntries,
          sellToken: inputToken.address as Address,
          walletAddress: walletAddress as Address,
          orderBookApi,
        })
        if (abort.signal.aborted) return
        quotes = { ...quotes, ...retried }
        costSummary = sumQuotedCostBaseUnits({ quotes, allocation })
      }

      lastQuotes = quotes

      // Hard fail: still missing quotes after retry. Restore the best
      // snapshot we have (buffer-feasible preferred; otherwise total-feasible).
      if (!costSummary.allSucceeded) {
        const fallback = bestFitsBuffer ?? bestFitsTotal
        if (fallback) {
          setMintQuotes(fallback.quotes)
          setQuotesTimestamp(Date.now())
          setEffectiveShares(fallback.shares)
          setIterationState({
            status: 'failed',
            round,
            maxRounds: ASYNC_MINT_MAX_ITERATIONS,
            history,
            bestFeasible: fallback,
            perTokenImpacts,
            error: `Quote failed for ${costSummary.failedAddresses.length} token(s); using last feasible round.`,
          })
        } else {
          setMintQuotes(quotes)
          setQuotesTimestamp(Date.now())
          setIterationState({
            status: 'failed',
            round,
            maxRounds: ASYNC_MINT_MAX_ITERATIONS,
            history,
            bestFeasible: null,
            perTokenImpacts,
            error: `Quote failed for ${costSummary.failedAddresses.length} token(s).`,
          })
        }
        return
      }

      const measurement = measureImpactPerToken({
        quotes,
        allocation,
        referencePrices,
        inputTokenDecimals: inputToken.decimals,
        tokenDecimals,
      })

      const costUsd = measurement.totalCostUsd
      perTokenImpacts = measurement.impacts

      const convergence = detectConvergence({
        costUsd,
        adjustedBudgetUsd,
        prevShares,
        newShares: prevShares, // same — we evaluate the round we just ran
        minUtilization: ASYNC_MINT_CONVERGENCE_UTILIZATION,
        marginalThreshold: ASYNC_MINT_MARGINAL_THRESHOLD,
      })

      const roundRecord: IterationRound = {
        round,
        shares: prevShares,
        costBaseUnits: costSummary.totalBaseUnits,
        costUsd,
        utilization: convergence.utilization,
        feasible: convergence.feasible,
        allSucceeded: costSummary.allSucceeded,
        impacts: measurement.impacts,
      }
      history.push(roundRecord)

      const snapshot: FeasibleSnapshot = {
        shares: prevShares,
        costBaseUnits: costSummary.totalBaseUnits,
        costUsd,
        utilization: convergence.utilization,
        quotes,
      }

      // Within ideal buffer — best case.
      if (convergence.feasible) {
        if (
          !bestFitsBuffer ||
          snapshot.utilization > bestFitsBuffer.utilization
        ) {
          bestFitsBuffer = snapshot
        }
      }

      // Within the hard total cap (any cost ≤ total input). Always tracked
      // as a fallback for the over_buffer case.
      if (costUsd <= totalBudgetUsd) {
        if (
          !bestFitsTotal ||
          snapshot.utilization > bestFitsTotal.utilization
        ) {
          bestFitsTotal = snapshot
        }
      }

      // Converged feasible — commit and exit.
      if (convergence.converged) {
        setMintQuotes(quotes)
        setQuotesTimestamp(Date.now())
        setEffectiveShares(prevShares)
        setIterationState({
          status: 'converged',
          round,
          maxRounds: ASYNC_MINT_MAX_ITERATIONS,
          history,
          bestFeasible: bestFitsBuffer,
          perTokenImpacts,
        })
        return
      }

      // Last round — exit loop and handle finalization below.
      if (round === ASYNC_MINT_MAX_ITERATIONS - 1) break

      // Predict the next S using the quadratic model, clamp by greedy for
      // feasibility safety.
      const predicted = predictShrinkageTarget({
        prevShares,
        totalReferenceUsd: measurement.totalReferenceUsd,
        totalImpactWeightedUsd: measurement.totalImpactWeightedUsd,
        unreferencedCostUsd: measurement.unreferencedCostUsd,
        targetBudgetUsd: adjustedBudgetUsd,
      })

      const nextShares = applyGreedyClamp({
        predicted,
        prevShares,
        prevCostUsd: costUsd,
        targetBudgetUsd: adjustedBudgetUsd,
      })

      // Degenerate: clamp returned 0 (model broken or budget impossible).
      if (nextShares <= 0n) break

      // NOTE: we used to break here on a small marginal delta, but that
      // bailed out before letting the greedy clamp do its job — the next
      // round at greedyShares is GUARANTEED feasible by CoWSwap's convexity
      // even when the predicted shrinkage looks tiny. Always run the
      // follow-up round so the user gets the feasible quotes they need.

      setIterationState((prev) => ({
        ...prev,
        round: round + 1,
        history,
        perTokenImpacts,
      }))

      setEffectiveShares(nextShares)
      prevShares = nextShares
    }

    if (abort.signal.aborted) return

    // Finalize. Preference order:
    //  1. bestFitsBuffer  → converged (≥98% util) or capped (lower util)
    //  2. bestFitsTotal   → over_buffer warning (ate buffer, still within total)
    //  3. neither         → infeasible (would exceed total budget)
    if (bestFitsBuffer) {
      setMintQuotes(bestFitsBuffer.quotes)
      setQuotesTimestamp(Date.now())
      setEffectiveShares(bestFitsBuffer.shares)
      const status: IterationState['status'] =
        bestFitsBuffer.utilization >= ASYNC_MINT_CONVERGENCE_UTILIZATION
          ? 'converged'
          : 'capped'
      setIterationState({
        status,
        round: history.length - 1,
        maxRounds: ASYNC_MINT_MAX_ITERATIONS,
        history,
        bestFeasible: bestFitsBuffer,
        perTokenImpacts,
      })
    } else if (bestFitsTotal) {
      // Ate into the buffer but the mint will still go through.
      setMintQuotes(bestFitsTotal.quotes)
      setQuotesTimestamp(Date.now())
      setEffectiveShares(bestFitsTotal.shares)
      setIterationState({
        status: 'over_buffer',
        round: history.length - 1,
        maxRounds: ASYNC_MINT_MAX_ITERATIONS,
        history,
        bestFeasible: bestFitsTotal,
        perTokenImpacts,
      })
    } else {
      // Cost exceeds the user's total input even after iteration — infeasible.
      setMintQuotes(lastQuotes)
      setQuotesTimestamp(Date.now())
      const attempts = history.length
      setIterationState({
        status: 'infeasible',
        round: history.length - 1,
        maxRounds: ASYNC_MINT_MAX_ITERATIONS,
        history,
        bestFeasible: null,
        perTokenImpacts,
        error: `Cost exceeds your total budget after ${attempts} attempt${
          attempts === 1 ? '' : 's'
        }. Lower the amount or try again.`,
      })
    }
  }, [
    store,
    orderBookApi,
    setEffectiveShares,
    setIterationState,
    setMintQuotes,
    setQuotesTimestamp,
  ])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { runIteration, cancel, state }
}
