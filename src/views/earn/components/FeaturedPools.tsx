import { Box } from 'theme-ui'
import FeaturedPoolItem from './FeaturedPoolItem'
import { useAtomValue } from 'jotai'
import { poolsAtom } from 'state/pools/atoms'
import { useMemo } from 'react'

const FeaturedPools = () => {
  const pools = useAtomValue(poolsAtom)

  const top3Pools = useMemo(() => {
    const topPools = pools.sort((a, b) => b.apy - a.apy).slice(0, 3)
    return topPools.length === 3 ? topPools : [undefined, undefined, undefined]
  }, [pools])

  return (
    <Box variant="layout.wrapper">
      <Box
        variant="layout.centered"
        sx={{
          justifyContent: 'center',
          background: 'cardAlternative',
          pl: 2,
          pr: 4,
          py: [5, 4],
          borderRadius: '14px',
          border: '3px solid',
          borderColor: 'contentBackground',
        }}
        mt={[1, 7]}
        mx={[0, 3]}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: ['column', 'row'],
            justifyContent: ['start', 'space-between'],
            width: '100%',
            gap: 4,
          }}
        >
          {top3Pools.map((pool, index) => (
            <FeaturedPoolItem key={`${pool?.id} ${index}`} pool={pool} />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default FeaturedPools
