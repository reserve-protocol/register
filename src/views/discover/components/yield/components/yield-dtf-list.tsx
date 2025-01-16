import useTokenList from 'hooks/useTokenList'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import useRTokenPools from 'views/earn/hooks/useRTokenPools'
import CompareFilters, {
  chainsFilterAtom,
  searchFilterAtom,
  targetFilterAtom,
} from './CompareFilters'
import CompareSkeleton from './CompareSkeleton'
import RTokenCard from './RTokenCard'

const YieldDTfList = () => {
  const { list, isLoading } = useTokenList()
  // Load pools to get rtoken earn info
  useRTokenPools()

  const chains = useAtomValue(chainsFilterAtom)
  const targets = useAtomValue(targetFilterAtom)
  const search = useAtomValue(searchFilterAtom)

  const filteredList = useMemo(() => {
    return list.filter((token) => {
      if (!chains.length || !chains.includes(token.chain.toString())) {
        return false
      }

      if (
        !targets.length ||
        !targets.find((t) => token.targetUnits.includes(t))
      ) {
        return false
      }

      if (search) {
        const searchLower = search.toLowerCase()
        const nameMatch = token.name.toLowerCase().includes(searchLower)
        const symbolMatch = token.symbol.toLowerCase().includes(searchLower)
        const collateralMatch = token.collaterals?.some((collateral) =>
          collateral.symbol.toLowerCase().includes(searchLower)
        )

        if (!nameMatch && !symbolMatch && !collateralMatch) {
          return false
        }
      }

      return true
    })
  }, [list, chains, targets, search])

  return (
    <div className="flex flex-col gap-1 p-1 rounded-[20px] bg-secondary">
      <CompareFilters />
      {isLoading && !filteredList.length && <CompareSkeleton />}
      {filteredList.map((token) => (
        <RTokenCard key={token.id} token={token} mb={[2, 4]} />
      ))}
    </div>
  )
}

export default YieldDTfList
