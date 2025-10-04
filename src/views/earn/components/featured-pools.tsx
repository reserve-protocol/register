import FeaturedPoolItem from './featured-pool-item'
import { useAtomValue } from 'jotai'
import { poolsAtom } from 'state/pools/atoms'
import { useMemo } from 'react'

const FeaturedPools = () => {
  const pools = useAtomValue(poolsAtom)

  const selectedPools = useMemo(() => {
    const handPickedPools = pools
      .sort((a, b) => b.apy - a.apy)
      .slice(0, 3)

    return handPickedPools.length === 3
      ? handPickedPools
      : [undefined, undefined, undefined]
  }, [pools])

  return (
    <div className="bg-secondary p-1 rounded-4xl">
      <div className="bg-card p-2 md:p-6 rounded-3xl">
        <div className="flex flex-col md:flex-row md:flex-wrap justify-start md:justify-between w-full gap-1 md:gap-4">
          {selectedPools.map((pool, index) => (
            <FeaturedPoolItem key={`${pool?.id} ${index}`} pool={pool} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default FeaturedPools
