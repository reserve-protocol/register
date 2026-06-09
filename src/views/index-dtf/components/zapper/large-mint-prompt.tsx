import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useIsDesktop } from '@/hooks/use-media-query'
import { getFolioRoute } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { useQuote, useZapperModal } from '@reserve-protocol/react-zapper'
import { X } from 'lucide-react'
import { useEffect, useState, type SyntheticEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Address } from 'viem'
import { useTrackIndexDTFClick } from '../../hooks/useTrackIndexDTFPage'

// Show the "Automated Mint" suggestion once the user's buy input is this large.
export const LARGE_MINT_MIN_INPUT = 50_000
export const ERROR_MINT_MIN_INPUT = 100
const MIN_INPUT_LABEL = '$50K'

type CardBodyProps = {
  inputSymbol: string
  mintRoute: string
  onCompare: () => void
  onDismiss: () => void
}

// Presentational card body (badge, dismiss, title, description, CTA). Shared by
// every presentation (desktop side-box, modal-attached box, mobile popup).
const LargeMintCardBody = ({
  inputSymbol,
  mintRoute,
  onCompare,
  onDismiss,
}: CardBodyProps) => (
  <>
    <div className="flex items-center justify-between gap-3">
      <div className="mb-3 inline-flex h-6 items-center rounded-full border border-warning/30 bg-warning/10 px-2.5 text-[11px] font-medium text-warning">
        Over {MIN_INPUT_LABEL}
      </div>
      <button
        type="button"
        className="mb-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={onDismiss}
        aria-label="Dismiss Automated Mint suggestion"
      >
        <X size={14} />
      </button>
    </div>
    <div className="min-w-0">
      <div className="text-sm font-semibold text-foreground">
        Large orders may benefit from Automated Mint
      </div>
      <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
        Your {inputSymbol} input is over {MIN_INPUT_LABEL}. Automated Mint may
        find a better route by splitting it across the basket before minting.
      </p>
      <Link
        to={mintRoute}
        onClick={onCompare}
        className="mt-4 inline-flex h-8 items-center justify-center rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground no-underline transition-colors hover:bg-primary/90"
        aria-label="Try Automated Mint"
      >
        Try Automated Mint
      </Link>
    </div>
  </>
)

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
  const [dismissed, setDismissed] = useState(false)

  const isInline = mode === 'inline'
  const inputValue = data?.input.value ?? 0
  const inputSymbol = data?.input.token.symbol ?? ''

  // Flow: buy input -> quote renders -> if large, suggest Automated Mint. Gated
  // to the buy (mint) tab; for the modal zapper only while the modal is open.
  const isLarge =
    currentTab === 'buy' &&
    !!data?.quote &&
    inputValue >= LARGE_MINT_MIN_INPUT &&
    (isInline || isOpen)

  const errorCondition = error && inputValue >= ERROR_MINT_MIN_INPUT

  useEffect(() => {
    if (!(isLarge || errorCondition)) setDismissed(false)
  }, [isLarge])

  const show = !!(isLarge || errorCondition) && !dismissed

  const mintRoute = getFolioRoute(
    dtfAddress,
    chain,
    ROUTES.ISSUANCE + '/automated'
  )
  // Keep clicks inside the box from reaching Radix's outside-click handler, so
  // the CTA navigates instead of dismissing the zapper modal.
  const stop = (e: SyntheticEvent) => e.stopPropagation()
  const body = (
    <LargeMintCardBody
      inputSymbol={inputSymbol}
      mintRoute={mintRoute}
      onCompare={() => trackClick('compare_automated_mint')}
      onDismiss={() => setDismissed(true)}
    />
  )

  // Mobile: a centered modal popup.
  if (!isDesktop) {
    return (
      <Dialog
        open={show}
        onOpenChange={(open) => {
          if (!open) setDismissed(true)
        }}
      >
        <DialogContent showClose={false} className="rounded-3xl">
          <DialogTitle className="sr-only">
            Automated Mint suggestion
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
