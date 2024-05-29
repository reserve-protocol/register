import useTokenList from 'hooks/useTokenList'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import useRTokenPools from 'views/earn/hooks/useRTokenPools'
import { chainsFilterAtom } from './CompareFilters'
import CompareSkeleton from './CompareSkeleton'
import RTokenCard from './RTokenCard'

const RTokenList = () => {
  const { list, isLoading } = useTokenList()
  // Load pools to get rtoken earn info
  useRTokenPools()

  const chains = useAtomValue(chainsFilterAtom)

  const filteredList = useMemo(() => {
    return list.filter((token) => {
      if (!chains.length || !chains.includes(token.chain.toString())) {
        return false
      }
      return true
    })
  }, [list, chains])

  return (
    <>
      {isLoading && !filteredList.length && <CompareSkeleton />}
      {filteredList.map((token) => (
        <RTokenCard key={token.id} token={token} mb={[2, 4]} />
      ))}
    </>
  )
}

export default RTokenList
