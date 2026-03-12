import Spinner from '@/components/ui/spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { LiquidityLevel } from '@/utils/liquidity'
import { Droplet } from 'lucide-react'

interface LiquidityBadgeProps {
  level: LiquidityLevel
  priceImpact?: number
  isLoading?: boolean
  error?: string
  tradeDescription?: string
}

const levelConfig: Record<
  LiquidityLevel,
  { label: string; description?: string; className: string }
> = {
  high: {
    label: 'High liquidity',
    className: 'bg-green-500/10 text-green-600',
  },
  medium: {
    label: 'Medium liquidity',
    className: 'bg-yellow-500/10 text-yellow-600',
  },
  low: {
    label: 'Low liquidity',
    className: 'bg-red-500/10 text-red-600',
  },
  insufficient: {
    label: 'Insufficient liquidity',
    description: 'No swap path found. Consider removing this token.',
    className: 'bg-red-500/10 text-red-600',
  },
  error: {
    label: 'Zapper error',
    className: 'bg-red-500/10 text-red-600',
  },
  unknown: {
    label: 'Unknown liquidity',
    className: 'bg-muted-foreground/10 text-muted-foreground',
  },
  failed: {
    label: 'Unknown liquidity',
    description: 'Simulation failed',
    className: 'bg-muted-foreground/10 text-muted-foreground',
  },
}

const LiquidityBadge = ({
  level,
  priceImpact,
  isLoading,
  error,
  tradeDescription,
}: LiquidityBadgeProps) => {
  if (isLoading) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-muted-foreground/10 text-muted-foreground cursor-help">
              <Spinner size={10} />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Checking liquidity...</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const config = levelConfig[level]

  const getTooltipDescription = () => {
    if (error) return error
    if (config.description) return config.description
    if (tradeDescription) return tradeDescription
    if (priceImpact !== undefined) {
      return `${priceImpact.toFixed(2)}% price impact`
    }
    return null
  }

  const description = getTooltipDescription()

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 cursor-help',
              config.className
            )}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Droplet size={10} />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{config.label}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default LiquidityBadge
