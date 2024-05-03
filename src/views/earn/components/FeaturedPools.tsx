import { Box } from 'theme-ui'
import FeaturedPoolItem from './FeaturedPoolItem'
import { useAtomValue } from 'jotai'
import { poolsAtom } from 'state/pools/atoms'
import { useMemo } from 'react'

const SELECTED_POOLS = [
  '219a3ece-18a6-43e7-8917-e1124498ebe8',
  '57d5dc30-8ade-4f40-87d2-6065297d0705',
  '0112f957-4369-490f-882f-018c0e0fdf9b',
]

const FeaturedPools = () => {
  const pools = useAtomValue(poolsAtom)

  const selectedPools = useMemo(() => {
    const handPickedPools = pools
      .filter(({ id }) => SELECTED_POOLS.includes(id))
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
