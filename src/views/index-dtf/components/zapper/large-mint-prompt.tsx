import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useOndoLimits } from '@/hooks/use-ondo-limits'
import { useIsDesktop } from '@/hooks/use-media-query'
import { indexDTFAtom, indexDTFBasketSharesAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import {
  floorOndoMaxUsd,
  formatOndoTime,
  getNextTradableSession,
  getOndoWeightedMaxUsd,
  isOndoMintingAvailable,
  isOndoMintingUnavailable,
} from '@/utils/dtf-ondo'
import { Trans } from '@lingui/react/macro'
import { useQuote, useZapperModal } from '@reserve-protocol/react-zapper'
import { useAtomValue } from 'jotai'
import { useEffect, useState, type SyntheticEvent } from 'react'
import { createPortal } from 'react-dom'
import { Address } from 'viem'
import { useTrackIndexDTFClick } from '../../hooks/useTrackIndexDTFPage'
import { getCowSwapUrl } from './cow-swap'
import LargeMintCardBody from './large-mint-prompt-body'
import {
  deriveMintPromptSignals,
  INITIAL_MINT_PROMPT_STATE,
  reduceMintPrompt,
  type MintPromptState,
} from './large-mint-prompt-state'

type LargeMintPromptProps = {
  mode: 'inline' | 'modal' | 'simple'
  dtfAddress: Address
  chain: number
}

const LargeMintPrompt = ({ mode, dtfAddress, chain }: LargeMintPromptProps) => {
  const { data, error } = useQuote()
  const { currentTab, isOpen } = useZapperModal()
  const isDesktop = useIsDesktop()
  const { trackClick } = useTrackIndexDTFClick('overview', 'mint')
  const [state, setState] = useState<MintPromptState>(INITIAL_MINT_PROMPT_STATE)
  const { market, assets } = useOndoLimits()
  const shares = useAtomValue(indexDTFBasketSharesAtom)

  const isInline = mode === 'inline'
  const isBuy = currentTab === 'buy'
  const inputValue = data?.input.value ?? 0
  // The DTF being traded — `data.input.token` is the *spent* token on the buy
  // tab, so the symbol comes from the active DTF instead.
  const symbol = useAtomValue(indexDTFAtom)?.token.symbol ?? ''

  // Flow: input -> quote renders -> raise the strongest applicable concern:
  // Ondo per-transaction cap, minting-unavailable premium or dead end, high
  // price impact, large order, or no route. For the modal zapper only while
  // the modal is open.
  const inContext = isInline || isOpen
  const hasValidQuote = !!data?.quote
  const mintingAvailable = isOndoMintingAvailable(market, assets)
  const mintingUnavailable = isOndoMintingUnavailable(market, assets)
  // Each asset only absorbs its basket weight of a mint, so the binding cap
  // is min(capacityUsd / weight) — floored to a round number so the trigger
  // matches the displayed label.
  const weightedMaxUsd = getOndoWeightedMaxUsd(assets, shares)
  const maxMintUsd =
    weightedMaxUsd === undefined ? undefined : floorOndoMaxUsd(weightedMaxUsd)
  const {
    rawCapacity,
    rawClosedImpact,
    rawClosedError,
    rawImpact,
    rawLarge,
    rawError,
    isApplicable,
  } = deriveMintPromptSignals({
    inContext,
    inputValue,
    hasValidQuote,
    hasQuoteError: !!error,
    source: data?.source,
    truePriceImpact: data?.quote?.truePriceImpact ?? 0,
    mintingAvailable,
    mintingUnavailable,
    maxMintUsd,
  })

  // Latch the suggestion so it persists across the zapper's periodic refetch
  // (where `error`/`quote` briefly clear) until the user dismisses it, the
  // concern resolves, or the trigger condition drops.
  useEffect(() => {
    setState((prev) =>
      reduceMintPrompt(prev, {
        rawCapacity,
        rawClosedImpact,
        rawClosedError,
        rawImpact,
        rawLarge,
        rawError,
        hasValidQuote,
        mintingUnavailable,
        isApplicable,
      })
    )
  }, [
    rawCapacity,
    rawClosedImpact,
    rawClosedError,
    rawImpact,
    rawLarge,
    rawError,
    hasValidQuote,
    mintingUnavailable,
    isApplicable,
  ])

  // A latched variant (or dismissal) from one tab must not leak into the
  // other while the new tab's quote loads. Must stay declared after the
  // reducer effect: on a tab switch both run, and this reset has to win.
  useEffect(() => {
    setState(INITIAL_MINT_PROMPT_STATE)
  }, [currentTab])

  const dismiss = () => setState((prev) => ({ ...prev, dismissed: true }))
  const show = state.variant !== null && !state.dismissed

  // Every raw signal requires a positive input value, so `data` is present
  // whenever the card shows.
  const cowSwapUrl = data
    ? getCowSwapUrl(
        isBuy
          ? {
              chainId: chain,
              sellToken: data.input.token.address,
              buyToken: dtfAddress,
            }
          : {
              chainId: chain,
              sellToken: dtfAddress,
              buyToken: data.quote?.tokenOut,
            }
      )
    : ''
  // The capacity card only shows while the market is open, so the session is
  // always live. Lowercase mid-sentence, matching the closed variants.
  const sessionLabel = market?.session ?? 'regular'
  // Where the closed variants point the user: an exact reopen time while the
  // market is closed; otherwise (open but an asset paused) the next session
  // in which every ondo asset trades. A wrap back to the current session
  // (mid-session halt) means "tomorrow" — the generic fallback copy reads
  // better than naming the session the user is already in.
  const nextOpenLabel =
    market?.isOpen === false ? formatOndoTime(market.nextOpen) : null
  const nextSession =
    market?.isOpen && mintingUnavailable
      ? getNextTradableSession(market.session, assets)
      : undefined
  const nextSessionLabel =
    nextSession && nextSession !== market?.session ? nextSession : null

  // Keep clicks inside the box from reaching Radix's outside-click handler, so
  // the CTA navigates instead of dismissing the zapper modal.
  const stop = (e: SyntheticEvent) => e.stopPropagation()
  const body = (
    <LargeMintCardBody
      variant={state.variant ?? 'large'}
      tab={currentTab}
      symbol={symbol}
      maxAmountLabel={`$${formatCurrency(maxMintUsd ?? 0, 0)}`}
      sessionLabel={sessionLabel}
      nextOpenLabel={nextOpenLabel}
      nextSessionLabel={nextSessionLabel}
      cowSwapUrl={cowSwapUrl}
      onCta={() =>
        trackClick('cowswap_redirect', {
          variant: state.variant,
          tab: currentTab,
        })
      }
      onDismiss={dismiss}
    />
  )

  // Mobile: a centered modal popup.
  if (!isDesktop) {
    return (
      <Dialog
        open={show}
        onOpenChange={(open) => {
          if (!open) dismiss()
        }}
      >
        <DialogContent showClose={false} className="rounded-3xl">
          <DialogTitle className="sr-only">
            <Trans>Trade suggestion</Trans>
          </DialogTitle>
          {body}
        </DialogContent>
      </Dialog>
    )
  }

  if (!show) return null

  // Desktop + modal: box starting exactly where the centered zapper modal ends
  // (modal is `sm:max-w-md` = 448px, so its right edge is at 50% + 224px). A
  // `top-0 bottom-0` flex wrapper centers it vertically without a transform, so
  // the slide-in keyframe (which animates `transform`) doesn't fight it.
  if (!isInline) {
    return createPortal(
      <div className="pointer-events-none fixed bottom-0 left-1/2 top-0 z-50 ml-[228px] flex items-center">
        <div
          onPointerDown={stop}
          onMouseDown={stop}
          className="animate-[large-order-card-slide-out_360ms_ease-out] pointer-events-auto flex w-[260px] flex-col justify-between rounded-3xl rounded-bl-none rounded-tl-none border-2 border-l-0 border-secondary bg-background p-6 text-left"
        >
          {body}
        </div>
      </div>,
      document.body
    )
  }

  // Desktop + inline: box sliding out to the right of the inline zapper.
  return (
    <div className="animate-[large-order-card-slide-out_360ms_ease-out] absolute bottom-4 left-full top-4 z-10 flex w-[260px] flex-col justify-between rounded-3xl rounded-bl-none rounded-tl-none border-2 border-transparent bg-background bg-clip-padding p-6 text-left">
      {body}
    </div>
  )
}

export default LargeMintPrompt
