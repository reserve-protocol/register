import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const InactiveBadge = ({ className }: { className?: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span
        className={cn(
          'w-fit text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 cursor-help',
          className
        )}
      >
        Inactive
      </span>
    </TooltipTrigger>
    <TooltipContent className="max-w-xs">
      This DTF is inactive. New issuance and governance proposals are disabled,
      but holders can still redeem their tokens and stakers can unstake.
    </TooltipContent>
  </Tooltip>
)

export default InactiveBadge
