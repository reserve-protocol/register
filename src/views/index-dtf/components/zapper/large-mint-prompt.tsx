import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useIsDesktop } from '@/hooks/use-media-query'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { getFolioRoute } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { useQuote, useZapperModal } from '@reserve-protocol/react-zapper'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { X } from 'lucide-react'
import { useEffect, useState, type SyntheticEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Address } from 'viem'
import { useTrackIndexDTFClick } from '../../hooks/useTrackIndexDTFPage'
import {
  INITIAL_MINT_PROMPT_STATE,
  reduceMintPrompt,
  type MintPromptState,
} from './large-mint-prompt-state'

// Show the "Automated Mint" suggestion once the user's buy input is this large.
export const LARGE_MINT_MIN_INPUT = 50_000
export const ERROR_MINT_MIN_INPUT = 100
const MIN_INPUT_LABEL = '$50K'

type CardBodyProps = {
  variant: 'large' | 'error'
  symbol: string
  mintRoute: string
  onCompare: () => void
  onDismiss: () => void
}

// Presentational card body (badge, dismiss, title, description, CTA). Shared by
// every presentation (desktop side-box, modal-attached box, mobile popup).
const LargeMintCardBody = ({
  variant,
  symbol,
  mintRoute,
  onCompare,
  onDismiss,
}: CardBodyProps) => {
  const { t } = useLingui()
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="mb-3 inline-flex h-6 items-center rounded-full border border-warning/30 bg-warning/10 px-2.5 text-[11px] font-medium text-warning">
          {variant === 'large' ? (
            <Trans>Over {MIN_INPUT_LABEL}</Trans>
          ) : (
            <Trans>No route found</Trans>
          )}
        </div>
        <button
          type="button"
          className="mb-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={onDismiss}
          aria-label={t`Dismiss Automated Mint suggestion`}
        >
          <X size={14} />
        </button>
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">
          <Trans>Try Minting</Trans>
        </div>
        <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
          <Trans>
            Automated minting may be a better way to buy {symbol}. We will help
            split your order into multiple trades before minting.
          </Trans>
        </p>
        <Link
          to={mintRoute}
          onClick={onCompare}
          className="mt-4 inline-flex h-8 items-center justify-center rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground no-underline transition-colors hover:bg-primary/90"
          aria-label={t`Try Automated Mint`}
        >
          <Trans>Try Automated Mint</Trans>
        </Link>
      </div>
    </>
  )
}

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

  const isInline = mode === 'inline'
  const inputValue = data?.input.value ?? 0
  // The DTF being bought — `data.input.token` is the *spent* token on the buy tab,
  // so the symbol comes from the active DTF instead.
  const symbol = useAtomValue(indexDTFAtom)?.token.symbol ?? ''

  // Flow: buy input -> quote renders -> if large, suggest Automated Mint; if the
  // zapper can't find a route, suggest it too. Gated to the buy (mint) tab; for
  // the modal zapper only while the modal is open.
  const isBuyContext = currentTab === 'buy' && (isInline || isOpen)
  const hasValidQuote = !!data?.quote
  const rawLarge =
    isBuyContext && hasValidQuote && inputValue >= LARGE_MINT_MIN_INPUT
  const rawError = isBuyContext && !!error && inputValue >= ERROR_MINT_MIN_INPUT
  const isApplicable = isBuyContext && inputValue >= ERROR_MINT_MIN_INPUT

  // Latch the suggestion so it persists across the zapper's periodic refetch (where
  // `error`/`quote` briefly clear) until the user dismisses it or a valid quote resolves.
  useEffect(() => {
    setState((prev) =>
      reduceMintPrompt(prev, { rawLarge, rawError, hasValidQuote, isApplicable })
    )
  }, [rawLarge, rawError, hasValidQuote, isApplicable])

  const dismiss = () => setState((prev) => ({ ...prev, dismissed: true }))
  const show = state.variant !== null && !state.dismissed

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
      variant={state.variant === 'error' ? 'error' : 'large'}
      symbol={symbol}
      mintRoute={mintRoute}
      onCompare={() => trackClick('compare_automated_mint')}
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
            <Trans>Automated Mint suggestion</Trans>
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
