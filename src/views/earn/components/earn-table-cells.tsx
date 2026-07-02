import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPercentage } from '@/utils'
import { ArrowRight } from 'lucide-react'

export const EarnGovernanceTokenCell = ({
  symbol,
  address,
  chainId,
  secondarySymbol,
  logoSrc,
}: {
  symbol: string
  address?: string
  chainId: number
  secondarySymbol: string
  logoSrc?: string
}) => (
  <div className="flex min-w-0 items-center gap-3">
    <div className="relative flex-shrink-0">
      <TokenLogo
        symbol={symbol}
        address={address}
        chain={chainId}
        src={logoSrc}
        size="xl"
      />
      <ChainLogo
        chain={chainId}
        className="absolute -bottom-1 -right-1 rounded-md border-2 border-card bg-card"
      />
    </div>

    <div className="flex min-w-0 flex-col justify-center gap-1 pt-0.5">
      <span className="font-semibold leading-tight">{symbol}</span>
      <div className="flex items-center gap-1 text-sm leading-tight text-legend">
        <ArrowRight size={14} className="hidden sm:block" />
        <span className="w-20 truncate sm:w-auto">{secondarySymbol}</span>
      </div>
    </div>
  </div>
)

export const EarnGovernanceTokenSkeleton = ({
  symbolWidth = 'w-16',
}: {
  symbolWidth?: string
}) => (
  <div className="flex items-center gap-3">
    <div className="relative flex-shrink-0">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="absolute -bottom-1 -right-1 h-4 w-4 rounded-md border-2 border-card bg-card" />
    </div>
    <div className="flex flex-col gap-1">
      <Skeleton className={`h-4 ${symbolWidth}`} />
      <div className="flex items-center gap-1">
        <Skeleton className="hidden sm:block h-3 w-3" />
        <Skeleton className="h-3 w-20 sm:w-24" />
      </div>
    </div>
  </div>
)

export const EarnMetricCtaCell = ({
  value,
  label,
}: {
  value: number
  label: string
}) => (
  <div className="flex items-center justify-end gap-2 text-primary font-semibold whitespace-nowrap">
    {formatPercentage(value)} <span className="hidden md:inline">{label}</span>
    <ArrowRight size={16} strokeWidth={1.5} />
  </div>
)

export const EarnMetricCtaSkeleton = () => (
  <div className="flex items-center justify-end gap-2">
    <Skeleton className="h-4 w-12" />
    <Skeleton className="hidden md:inline h-4 w-8" />
    <Skeleton className="h-4 w-4" />
  </div>
)
