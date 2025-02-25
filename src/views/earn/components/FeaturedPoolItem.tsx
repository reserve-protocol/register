import { Button } from 'components'
import ChainLogo from 'components/icons/ChainLogo'
import StackTokenLogo from 'components/token-logo/StackTokenLogo'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Pool } from 'state/pools/atoms'
import { Box, Text } from 'theme-ui'
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
      <Box mx={3}>
        <Skeleton height={124} width={320} />
      </Box>
    )

  return (
    <Box variant="layout.verticalAlign">
      <Box
        sx={{
          position: 'relative',
          background: 'contentBackground',
          borderRadius: '6px',
          width: 104,
          height: 128,
          mx: 3,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: 20,
            position: 'absolute',
            left: '50%',
            top: '15%',
            transform: 'translateX(-50%)',
          }}
        >
          {PROJECT_ICONS[pool.project]}
        </Box>
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
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Text>Earn up to</Text>
          <Text sx={{ fontSize: 5, fontWeight: 'bold', lineHeight: '32px' }}>
            {pool.apy.toFixed(2)}% <Text color="grey">APY</Text>
          </Text>
          <Text>
            w.{' '}
            {underlyingTokens.map(
              (u, i) =>
                `${u.symbol}${i !== underlyingTokens.length - 1 ? ' & ' : ''}`
            )}
            {' in '}
            {pool.project.substring(0, 1).toUpperCase() +
              pool.project.substring(1)}
          </Text>
        </Box>
        <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
          <Button
            small
            sx={{ width: 'max-content' }}
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
        </Box>
      </Box>
    </Box>
  )
}

export default FeaturedPoolItem
