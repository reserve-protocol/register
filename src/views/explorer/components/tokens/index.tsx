import useTokenList from 'hooks/useTokenList'
import Skeleton from 'react-loading-skeleton'
import { Box } from 'theme-ui'
import ExplorerRTokenCard from './components/ExplorerRTokenCard'

const ExploreTokens = () => {
  const { list, isLoading } = useTokenList()

  return (
    <Box mt={5}>
      {isLoading && <Skeleton count={10} />}
      {!isLoading &&
        list &&
        list.map((token) => (
          <ExplorerRTokenCard key={token.id} token={token} mb={[2, 4]} />
        ))}
    </Box>
  )
}

export default ExploreTokens
