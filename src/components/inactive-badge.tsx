import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Trans } from '@lingui/react/macro'

const InactiveBadge = ({ className }: { className?: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span
        className={cn(
          'w-fit text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 cursor-help',
          className
        )}
      >
        <Trans>Inactive</Trans>
      </span>
    </TooltipTrigger>
    <TooltipContent className="max-w-xs">
      <Trans>
        This DTF is inactive. New issuance and governance proposals are
        disabled, but holders can still redeem their tokens and stakers can
        unstake.
      </Trans>
    </TooltipContent>
  </Tooltip>
)

export default InactiveBadge
