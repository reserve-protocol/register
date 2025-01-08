import useTokenList from 'hooks/useTokenList'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import useRTokenPools from 'views/earn/hooks/useRTokenPools'
import { chainsFilterAtom, targetFilterAtom } from './CompareFilters'
import CompareSkeleton from './CompareSkeleton'
import RTokenCard from './RTokenCard'

const YieldDTfList = () => {
  const { list, isLoading } = useTokenList()
  // Load pools to get rtoken earn info
  useRTokenPools()

  const chains = useAtomValue(chainsFilterAtom)
  const targets = useAtomValue(targetFilterAtom)

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

      return true
    })
  }, [list, chains, targets])

  return (
    <>
      {isLoading && !filteredList.length && <CompareSkeleton />}
      {filteredList.map((token) => (
        <RTokenCard key={token.id} token={token} mb={[2, 4]} />
      ))}
    </>
  )
}

export default YieldDTfList
