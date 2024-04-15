import { Box } from 'theme-ui'
import FeaturedPoolItem from './FeaturedPoolItem'
import { useAtomValue } from 'jotai'
import { poolsAtom } from 'state/pools/atoms'
import { useMemo } from 'react'

const FeaturedPools = () => {
  const pools = useAtomValue(poolsAtom)

  const top3Pools = useMemo(
    () => pools.sort((a, b) => b.apy - a.apy).slice(0, 3),
    [pools]
  )

  return (
    <Box
      variant="layout.centered"
      sx={{
        justifyContent: 'center',
        background: 'cardAlternative',
        px: [2, 5],
        py: [5, 4],
        borderRadius: '14px',
        border: '3px solid',
        borderColor: 'contentBackground',
      }}
      mt={[1, 7]}
      mx={[0, 4]}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: ['column', 'row'],
          justifyContent: ['start', 'space-between'],
          width: '100%',
          px: [1, 5],
          gap: 4,
        }}
      >
        {top3Pools.map((pool) => (
          <FeaturedPoolItem key={pool.id} pool={pool} />
        ))}
      </Box>
    </Box>
  )
}

export default FeaturedPools
