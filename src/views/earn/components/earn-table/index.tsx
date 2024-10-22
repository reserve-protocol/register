import { Box } from 'theme-ui'
import useRTokenPools from 'views/earn/hooks/useRTokenPools'

const EarnTable = () => {
  const { isLoading } = useRTokenPools()

  return <Box variant="layout.wrapper"></Box>
}

export default EarnTable
