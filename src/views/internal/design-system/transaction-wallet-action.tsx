import { Check, CirclePlus, Wallet2 } from 'lucide-react'

import { tooltipSurfaceRecipe } from '@/components/design-system-v1/tooltip-surface'
import { IconButton } from '@/components/icon-button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const TRACK_TOKEN_LABEL = 'Track token in your wallet'

export const TransactionWalletAction = ({
  isTracked,
  onTrack,
}: {
  isTracked: boolean
  onTrack: () => void
}) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton
          aria-pressed={isTracked}
          label={TRACK_TOKEN_LABEL}
          icon={
            isTracked ? (
              <Check
                aria-hidden="true"
                data-testid="transaction-wallet-tracked-glyph"
              />
            ) : (
              <span
                aria-hidden="true"
                data-testid="transaction-wallet-add-glyph"
                className="relative flex size-4 items-center justify-center"
              >
                <Wallet2 className="size-4" strokeWidth={1.5} />
                <CirclePlus
                  className="absolute -bottom-1 -right-1 size-2.5 rounded-full bg-card"
                  strokeWidth={1.5}
                />
              </span>
            )
          }
          size="compact"
          tone="secondary"
          onClick={() => {
            if (!isTracked) onTrack()
          }}
        />
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={8}
        collisionPadding={8}
        className={tooltipSurfaceRecipe}
      >
        {TRACK_TOKEN_LABEL}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)
