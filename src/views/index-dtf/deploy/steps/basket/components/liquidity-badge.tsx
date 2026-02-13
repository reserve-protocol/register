import Spinner from '@/components/ui/spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Droplet } from 'lucide-react'
import { LiquidityLevel } from '../atoms'
import { useAtomValue } from 'jotai'
import { liquiditySimulationAmountAtom } from '../atoms'
import { getLiquidityCheckTokenSymbol } from '../hooks/use-liquidity-check'

interface LiquidityBadgeProps {
  level: LiquidityLevel
  priceImpact?: number
  tokenSymbol?: string
  chainId: number
  isLoading?: boolean
  error?: string
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

const formatAmount = (amount: number): string => {
  return amount >= 1000 ? `$${amount / 1000}k` : `$${amount}`
}

const LiquidityBadge = ({
  level,
  priceImpact,
  tokenSymbol,
  chainId,
  isLoading,
  error,
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

  const simulationAmount = useAtomValue(liquiditySimulationAmountAtom)
  const config = levelConfig[level]
  const inputTokenSymbol = getLiquidityCheckTokenSymbol(chainId)
  const amountLabel = formatAmount(simulationAmount)

  const getTooltipDescription = () => {
    if (error) {
      return error
    }
    if (config.description) {
      return config.description
    }
    if (priceImpact !== undefined && tokenSymbol) {
      return `${priceImpact.toFixed(2)}% price impact swapping ${amountLabel} ${inputTokenSymbol} for ${tokenSymbol}`
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
