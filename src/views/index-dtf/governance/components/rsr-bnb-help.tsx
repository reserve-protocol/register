import { Link } from '@/components/ui/link'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { ChainId } from '@/utils/chains'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { ArrowUpRightIcon } from 'lucide-react'

const RSRBNBHelp = ({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) => {
  const chainId = useAtomValue(chainIdAtom)

  if (chainId !== ChainId.BSC) return null

  return (
    <Link
      className={cn(
        'flex flex-col justify-start items-start gap-2 w-full',
        className
      )}
      target="_blank"
      href="https://x.com/reserveprotocol/status/1991311026974036379?s=46&t=PSRhUIOkR4MrrAAJE14IIw"
    >
      <div
        className={cn(
          'group flex w-full items-center justify-between rounded-xl text-left',
          compact ? 'gap-2' : 'gap-3'
        )}
      >
        <h3
          className={cn(
            'font-medium transition-colors group-hover:text-primary',
            compact
              ? 'text-sm dark:text-muted-foreground'
              : 'text-base dark:text-muted-foreground'
          )}
        >
          <span className="sm:hidden">
            <Trans>Bridge RSR to BSC</Trans>
          </span>
          <span className="hidden sm:inline">
            <Trans>Have RSR on another chain? Bridge to BSC</Trans>
          </span>
        </h3>
        {/* WHY: the whole row is already a link — a nested button would add a
            second focusable control; this is a purely visual affordance. */}
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-border text-foreground transition-colors',
            compact
              ? 'h-7 w-7'
              : 'h-8 w-8 group-hover:bg-primary group-hover:text-primary-foreground'
          )}
        >
          <ArrowUpRightIcon size={compact ? 14 : 16} />
        </span>
      </div>
    </Link>
  )
}

export default RSRBNBHelp
