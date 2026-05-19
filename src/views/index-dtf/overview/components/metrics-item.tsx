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

const MetricsItem = ({
  label,
  value,
  icon,
  valueHover,
  help,
  link,
  loading,
}: {
  label: string
  value: string
  icon: ReactNode
  valueHover?: string
  help?: string
  link?: string
  loading?: boolean
}) => {
  return (
    <div className="px-4 py-2 sm:px-5 sm:py-5 flex items-center gap-1 justify-between">
      <div className="flex items-center gap-1">
        <div className="p-2 w-8 h-8">{icon}</div>
        {label}
      </div>
      {loading ? (
        <Skeleton className="w-24 h-6" />
      ) : (
        <div className="flex items-center gap-1">
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
