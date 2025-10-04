import { Button } from '@/components/ui/button'
import ChainLogo from 'components/icons/ChainLogo'
import StackTokenLogo from 'components/token-logo/StackTokenLogo'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Pool } from 'state/pools/atoms'
import { PROJECT_ICONS } from '../hooks/useEarnTableColumns'

const FeaturedPoolItem = ({ pool }: { pool?: Pool }) => {
  const underlyingTokens = useMemo(
    () =>
      (pool?.underlyingTokens || [])
        .filter((u) => u.symbol !== 'Unknown')
        .map((u, i) => ({ ...u, left: i + 10 })),
    [pool?.underlyingTokens]
  )

  if (!pool)
    return (
      <div className="mx-3">
        <Skeleton height={124} width={320} />
      </div>
    )

  return (
    <div className="flex items-center">
      <div className="relative bg-secondary rounded-md w-[104px] h-32 mx-3 overflow-hidden">
        <div className="w-5 absolute left-1/2 top-[15%] -translate-x-1/2">
          {PROJECT_ICONS[pool.project]}
        </div>
        <StackTokenLogo
          size={128}
          tokens={pool?.underlyingTokens}
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: '10%',
            transform: 'translate(-50%, 50%)',
          }}
        />
      </div>
      <div className="flex flex-col justify-between gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-foreground">Earn up to</p>
          <p className="text-3xl font-bold leading-8">
            {pool.apy.toFixed(2)}% <span className="text-grey">APY</span>
          </p>
          <p className="text-foreground">
            w.{' '}
            {underlyingTokens.map(
              (u, i) =>
                `${u.symbol}${i !== underlyingTokens.length - 1 ? ' & ' : ''}`
            )}
            {' in '}
            {pool.project.substring(0, 1).toUpperCase() +
              pool.project.substring(1)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="w-max"
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
