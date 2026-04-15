import { useDeprecatedAddresses } from '@/hooks/use-dtf-status'
import useTokenList from 'hooks/useTokenList'
import { useMemo } from 'react'
import useRTokenPools from 'views/earn/hooks/useRTokenPools'
import RTokenCard from './yield-dtf-card'
import CompareSkeleton from './yield-dtf-skeleton'
import useFilteredYieldDTF from '../../hooks/use-filtered-yield-dtf'

const STABLECOINS = ['eUSD', 'rgUSD']

const DiscoverYieldDTF = ({ stablecoins = false }: { stablecoins?: boolean }) => {
  const { data, isLoading } = useFilteredYieldDTF({ stablecoins: false })
  const deprecatedAddresses = useDeprecatedAddresses()
  // Load pools to get rtoken earn info
  useRTokenPools()

  return (
    <div className="flex flex-col gap-1">
      {isLoading && !data.length && <CompareSkeleton />}
      {data.map((token) => (
        <RTokenCard
          key={token.id}
          token={token}
          deprecated={deprecatedAddresses.has(token.id.toLowerCase())}
        />
      ))}
    </div>
  )
}

export default DiscoverYieldDTF
