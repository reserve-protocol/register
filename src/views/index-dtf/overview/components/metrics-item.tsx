import Help from '@/components/ui/help'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ArrowUpRight } from 'lucide-react'
import { ReactNode } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const MetricsItem = ({
  label,
  value,
  icon,
  valueHover,
  help,
  link,
  loading,
  className,
  testId,
}: {
  label: ReactNode
  value: string
  icon: ReactNode
  valueHover?: string
  help?: string
  link?: string
  loading?: boolean
  className?: string
  testId?: string
}) => {
  return (
    <div
      className={cn(
        'px-4 py-2 sm:px-5 sm:py-5 flex items-center gap-1 justify-between',
        className
      )}
    >
      <div className="flex items-center gap-4 text-muted-foreground sm:gap-1">
        <div className="flex h-4 w-4 shrink-0 items-center justify-center [&_svg]:text-muted-foreground sm:h-8 sm:w-8 sm:p-2">
          {icon}
        </div>
        {label}
      </div>
      {loading ? (
        <span data-testid={testId ? `${testId}-loading` : undefined}>
          <Skeleton className="w-24 h-6" />
        </span>
      ) : (
        <div className="flex items-center gap-1" data-testid={testId}>
          {valueHover ? (
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger className="text-ellipsis overflow-hidden whitespace-nowrap max-w-[160px] sm:max-w-[150px] lg:max-w-[180px]">
                  {value}
                </TooltipTrigger>
                <TooltipContent side="top">{valueHover || ''}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            value
          )}
          {help && (
            <Help content={help} size={16} className="text-muted-foreground" />
          )}
          {link && (
            <Link to={link} target="_blank">
              <ArrowUpRight size={16} className="text-muted-foreground" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default MetricsItem
