import FeaturedPoolItem from './featured-pool-item'
import { useAtomValue } from 'jotai'
import { poolsAtom } from 'state/pools/atoms'
import { useMemo } from 'react'

const FeaturedPools = () => {
  const pools = useAtomValue(poolsAtom)

  const selectedPools = useMemo(() => {
    const handPickedPools = pools
      .filter((pool) => pool.symbol !== 'RSR-WETH')
      .sort((a, b) => b.apy - a.apy)
      .slice(0, 3)

    return handPickedPools.length === 3
      ? handPickedPools
      : [undefined, undefined, undefined]
  }, [pools])

  return (
    <div className="bg-secondary p-1 rounded-4xl">
      <div className="bg-card p-2  rounded-3xl">
        <div className="flex flex-row flex-wrap sm:flex-nowrap justify-start sm:justify-center lg:justify-between w-full gap-1 md:gap-4 [&>*:last-child]:hidden lg:[&>*:last-child]:flex">
          {selectedPools.map((pool, index) => (
            <FeaturedPoolItem key={`${pool?.id} ${index}`} pool={pool} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default FeaturedPools
