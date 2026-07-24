import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useOndoLimits } from '@/hooks/use-ondo-limits'
import { useIsDesktop } from '@/hooks/use-media-query'
import { indexDTFAtom, indexDTFBasketSharesAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { ChainId } from '@/utils/chains'
import {
  floorOndoMaxUsd,
  formatOndoTime,
  formatRetryIn,
  getNextTradableSession,
  getNextUsMarketOpen,
  getOndoWeightedMaxUsd,
  isOndoMintingAvailable,
  isOndoMintingUnavailable,
} from '@/utils/dtf-ondo'
import { Trans } from '@lingui/react/macro'
import { useQuote, useZapperModal } from '@reserve-protocol/react-zapper'
import { useAtomValue } from 'jotai'
import { useEffect, useRef, useState, type SyntheticEvent } from 'react'
import { createPortal } from 'react-dom'
import { useTrackIndexDTFClick } from '../../hooks/useTrackIndexDTFPage'
import LargeMintCardBody from './large-mint-prompt-body'
import {
  deriveMintPromptSignals,
  INITIAL_MINT_PROMPT_STATE,
  reduceMintPrompt,
  type MintPromptState,
  type MintPromptVariant,
} from './large-mint-prompt-state'

type LargeMintPromptProps = {
  mode: 'inline' | 'modal' | 'simple'
  chain: number
}

const LargeMintPrompt = ({ mode, chain }: LargeMintPromptProps) => {
  const { data, error } = useQuote()
  const { currentTab, isOpen } = useZapperModal()
  const isDesktop = useIsDesktop()
  const { trackClick } = useTrackIndexDTFClick('overview', 'mint')
  const [state, setState] = useState<MintPromptState>(INITIAL_MINT_PROMPT_STATE)
  const { market, assets } = useOndoLimits()
  const shares = useAtomValue(indexDTFBasketSharesAtom)

  const isInline = mode === 'inline'
  const inputValue = data?.input.value ?? 0
  // The DTF being traded — `data.input.token` is the *spent* token on the buy
  // tab, so the symbol comes from the active DTF instead.
  const symbol = useAtomValue(indexDTFAtom)?.token.symbol ?? ''

  // Flow: input -> quote renders -> raise the strongest applicable Ondo
  // concern: per-transaction cap, or the minting-unavailable premium / dead
  // end. For the modal zapper only while the modal is open.
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
  const { rawCapacity, rawClosedImpact, rawClosedError, isApplicable } =
    deriveMintPromptSignals({
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

  // Latch the notice so it persists across the zapper's periodic refetch
  // (where `error`/`quote` briefly clear) until the user dismisses it, the
  // concern resolves, or the trigger condition drops.
  useEffect(() => {
    setState((prev) =>
      reduceMintPrompt(prev, {
        rawCapacity,
        rawClosedImpact,
        rawClosedError,
        hasValidQuote,
        mintingUnavailable,
        isApplicable,
      })
    )
  }, [
    rawCapacity,
    rawClosedImpact,
    rawClosedError,
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

  const dismiss = () => {
    // Guard against the mobile dialog's onOpenChange re-firing dismiss after the
    // card is already dismissed (state.dismissed flips on the next render).
    if (state.variant && !state.dismissed) {
      trackClick('mint_prompt_dismiss', {
        variant: state.variant,
        tab: currentTab,
      })
    }
    setState((prev) => ({ ...prev, dismissed: true }))
  }
  // These notices target the BSC AI DTFs only (Ondo-backed baskets). Other
  // chains never show the card.
  const show =
    chain === ChainId.BSC && state.variant !== null && !state.dismissed

  // One impression per variant surfaced. The reducer only escalates (never
  // downgrades or flickers on refetch), so a changed variant is a genuinely new
  // concern that earns its own impression. Reset when the card hides so a later
  // re-show tracks again.
  const shownVariantRef = useRef<MintPromptVariant>(null)
  useEffect(() => {
    if (show && state.variant) {
      if (shownVariantRef.current !== state.variant) {
        shownVariantRef.current = state.variant
        trackClick('mint_prompt_shown', {
          variant: state.variant,
          tab: currentTab,
        })
      }
    } else {
      shownVariantRef.current = null
    }
  }, [show, state.variant, currentTab, trackClick])

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
  // closed-impact spells out US market hours and how long until they resume.
  // Show "now" in Eastern Time too, so it lines up with the 9:30–4 ET hours and
  // the countdown (the viewer's own local clock is disconnected from both).
  const currentTimeLabel = new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  // When the market is fully closed, Ondo's nextOpen is authoritative (weekend/
  // holiday aware). When it's open but the DTF's stocks are paused this session,
  // there's no timestamp — fall back to the next regular open (9:30 AM ET).
  const reopenInLabel =
    (market?.isOpen === false ? formatRetryIn(market.nextOpen) : null) ??
    formatRetryIn(getNextUsMarketOpen().toISOString())

  // Keep clicks inside the box from reaching Radix's outside-click handler, so
  // interacting with the card doesn't dismiss the zapper modal behind it.
  const stop = (e: SyntheticEvent) => e.stopPropagation()
  const body = (
    <LargeMintCardBody
      variant={state.variant ?? 'capacity'}
      tab={currentTab}
      symbol={symbol}
      maxAmountLabel={`$${formatCurrency(maxMintUsd ?? 0, 0)}`}
      sessionLabel={sessionLabel}
      nextOpenLabel={nextOpenLabel}
      nextSessionLabel={nextSessionLabel}
      currentTimeLabel={currentTimeLabel}
      reopenInLabel={reopenInLabel}
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
      <div className="pointer-events-none fixed bottom-0 left-1/2 top-0 z-[60] ml-[228px] flex items-center">
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
