import useTokenList from 'hooks/useTokenList'
import useRTokenPools from 'views/earn/hooks/useRTokenPools'
import CompareSkeleton from './CompareSkeleton'
import RTokenCard from './RTokenCard'

const RTokenList = () => {
  const { list, isLoading } = useTokenList()
  // Load pools to get rtoken earn info
  useRTokenPools()

  return (
    <>
      {isLoading && !list.length && <CompareSkeleton />}
      {list.map((token) => (
        <RTokenCard key={token.id} token={token} mb={4} />
      ))}
    </>
  )
}

export default RTokenList
