import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ChainLogo from 'components/icons/ChainLogo'
import StackTokenLogo from 'components/token-logo/StackTokenLogo'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useMemo } from 'react'
import { Pool } from 'state/pools/atoms'
import { PROJECT_ICONS } from '../hooks/useEarnTableColumns'

const FeaturedPoolItem = ({ pool }: { pool?: Pool }) => {
  const underlyingTokens = useMemo(
    () => (pool?.underlyingTokens || []).filter((u) => u.symbol !== 'Unknown'),
    [pool?.underlyingTokens]
  )

  if (!pool)
    return (
      <div className="w-full md:w-auto">
        <Skeleton className="h-[124px] w-full md:w-[320px]" />
      </div>
    )

  return (
    <div className="flex items-center">
      <div className="relative bg-secondary rounded-xl w-[80px] w-[104px] h-24 md:h-32 mr-3 flex-shrink-0 overflow-hidden">
        <div className="w-4 md:w-5 absolute left-1/2 top-[15%] -translate-x-1/2">
          {PROJECT_ICONS[pool.project]}
        </div>
        <div className="absolute left-1/2 bottom-[10%] -translate-x-1/2 translate-y-1/2">
          <StackTokenLogo size={96} tokens={pool?.underlyingTokens} />
        </div>
      </div>
      <div className="flex flex-col justify-between gap-1 md:gap-2 flex-1 min-w-0 mr-2 md:mr-0">
        <div className="flex flex-col gap-0.5 md:gap-1">
          <p className="text-xs md:text-sm text-foreground">Earn up to</p>
          <p className="text-lg md:text-2xl lg:text-3xl font-bold leading-5 md:leading-8">
            {pool.apy.toFixed(2)}%{' '}
            <span className="text-grey text-xs md:text-base">APY</span>
          </p>
          <p className="text-xs md:text-sm text-foreground truncate">
            w.{' '}
            {underlyingTokens.map(
              (u, i) =>
                `${u.symbol}${i !== underlyingTokens.length - 1 ? ' & ' : ''}`
            )}
            {' in '}
            {pool.project.split('-')[0].substring(0, 1).toUpperCase() +
              pool.project.split('-')[0].substring(1)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="w-max text-[10px] md:text-sm h-6 md:h-8 px-2 md:px-4"
            onClick={() => {
              window.open(pool.url, '_blank')
              mixpanel.track('Clicked Featured Pool', {
                Pool: pool.symbol,
                Protocol: pool.project,
              })
            }}
          >
            View
          </Button>
          <ChainLogo chain={pool.chain} fontSize={12} />
        </div>
      </div>
    </div>
  )
}

export default FeaturedPoolItem
