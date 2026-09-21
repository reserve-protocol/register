import { Bookmark } from 'lucide-react'

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
            <Bookmark
              aria-hidden="true"
              data-testid={
                isTracked
                  ? 'transaction-wallet-tracked-glyph'
                  : 'transaction-wallet-add-glyph'
              }
              className={isTracked ? 'fill-current' : undefined}
            />
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
