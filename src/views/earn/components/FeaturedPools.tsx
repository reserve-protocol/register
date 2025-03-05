import { Box } from 'theme-ui'
import FeaturedPoolItem from './FeaturedPoolItem'
import { useAtomValue } from 'jotai'
import { poolsAtom } from 'state/pools/atoms'
import { useMemo } from 'react'

const FEATURED_POOLS = [
  '219a3ece-18a6-43e7-8917-e1124498ebe8',
  '5f83ac83-753a-4382-869f-38c4e1658a36',
  '0112f957-4369-490f-882f-018c0e0fdf9b',
]

const FeaturedPools = () => {
  const pools = useAtomValue(poolsAtom)

  const selectedPools = useMemo(() => {
    const handPickedPools = pools
      .filter(({ id }) => FEATURED_POOLS.includes(id))
      .sort((a, b) => b.apy - a.apy)
    return handPickedPools.length === 3
      ? handPickedPools
      : [undefined, undefined, undefined]
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
          borderRadius: '24px',
          border: '4px solid',
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
            gap: 4,
          }}
        >
          {selectedPools.map((pool, index) => (
            <FeaturedPoolItem key={`${pool?.id} ${index}`} pool={pool} />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default FeaturedPools
