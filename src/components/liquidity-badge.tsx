import { forwardRef } from 'react'
import Spinner from '@/components/ui/spinner'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { LiquidityLevel } from '@/utils/liquidity'
import { SwapLeg } from '@/utils/zapper'
import { formatCurrency } from '@/utils'
import {
  ExplorerDataType,
  getExplorerLink,
} from '@/utils/getExplorerLink'
import { ArrowRight, ArrowUpRight, Droplet } from 'lucide-react'

interface LiquidityBadgeProps {
  level: LiquidityLevel
  priceImpact?: number
  isLoading?: boolean
  error?: string
  tradeDescription?: string
  swapPath?: SwapLeg[]
  chainId?: number
  symbolMap?: Record<string, string>
  onRetry?: () => void
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

const totalImpactColor = (impact: number) => {
  if (impact <= 0) return 'text-green-600'
  if (impact <= 3) return 'text-yellow-600'
  return 'text-red-600'
}

const legDeltaColor = (input: number, output: number) =>
  output >= input ? 'text-green-600' : 'text-red-600'

const formatPercent = (value: number) => {
  const abs = Math.abs(value)
  const decimals = abs < 0.01 ? 4 : abs < 0.1 ? 3 : 2
  return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

const resolveSymbol = (
  address: string | undefined,
  symbolMap: Record<string, string>
) => {
  if (!address) return '?'
  return symbolMap[address.toLowerCase()] ?? `${address.slice(0, 6)}...${address.slice(-4)}`
}

const SwapPathContent = ({
  swapPath,
  priceImpact,
  chainId,
  symbolMap,
  tradeDescription,
}: {
  swapPath: SwapLeg[]
  priceImpact?: number
  chainId: number
  symbolMap: Record<string, string>
  tradeDescription?: string
}) => (
  <div className="flex flex-col gap-2">
    {tradeDescription && (
      <p className="text-xs text-muted-foreground">{tradeDescription}</p>
    )}
    <p className="text-xs font-medium">Potential swap route</p>
    <div className="flex flex-col gap-1.5">
      {swapPath.map((leg, i) => {
        const poolAddress = leg.address?.[0]
        const from = resolveSymbol(leg.inputToken?.[0], symbolMap)
        const to = resolveSymbol(leg.outputToken?.[0], symbolMap)
        return (
          <div key={i} className="flex flex-col gap-0.5">
            {poolAddress && (
              <a
                href={getExplorerLink(
                  poolAddress,
                  chainId,
                  ExplorerDataType.ADDRESS
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-xs font-medium hover:text-primary"
              >
                {poolAddress.slice(0, 6)}...{poolAddress.slice(-4)}
                <ArrowUpRight size={10} strokeWidth={1.5} />
              </a>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{from}</span>
              <ArrowRight size={10} />
              <span>{to}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">
                ${formatCurrency(leg.input)}
              </span>
              <ArrowRight size={10} className="text-muted-foreground" />
              <span className="text-muted-foreground">
                ${formatCurrency(leg.output)}
              </span>
              <span className={cn('ml-auto', legDeltaColor(leg.input, leg.output))}>
                {formatPercent(leg.input === 0 ? 0 : ((leg.output - leg.input) / leg.input) * 100)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
    {priceImpact !== undefined && (
      <>
        <hr className="border-border" />
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Total impact</span>
          <span className={cn('font-medium', totalImpactColor(priceImpact))}>
            {formatPercent(priceImpact)}
          </span>
        </div>
      </>
    )}
    <p className="text-[10px] text-muted-foreground leading-tight">
      Simulated route. Actual auction path may differ.
    </p>
  </div>
)

const Badge = forwardRef<
  HTMLSpanElement,
  { className: string } & React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 cursor-pointer',
      className
    )}
    {...props}
  >
    <Droplet size={10} />
  </span>
))

const LiquidityBadge = ({
  level,
  priceImpact,
  isLoading,
  error,
  tradeDescription,
  swapPath,
  chainId,
  symbolMap,
  onRetry,
}: LiquidityBadgeProps) => {
  if (isLoading) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-muted-foreground/10 text-muted-foreground cursor-pointer">
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

  if (swapPath?.length) {
    return (
      <HoverCard openDelay={0} closeDelay={200}>
        <HoverCardTrigger asChild>
          <Badge
            className={config.className}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onRetry}
          />
        </HoverCardTrigger>
        <HoverCardContent className="w-[300px] rounded-3xl border-2 border-secondary p-3">
          <SwapPathContent swapPath={swapPath} priceImpact={priceImpact} chainId={chainId ?? 1} symbolMap={symbolMap ?? {}} tradeDescription={tradeDescription} />
        </HoverCardContent>
      </HoverCard>
    )
  }

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
          <Badge
            className={config.className}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onRetry}
          />
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
