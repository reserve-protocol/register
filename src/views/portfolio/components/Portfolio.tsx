import { useAtomValue } from 'jotai'
import { Box, Flex } from 'theme-ui'
import { currentWalletAtom } from '../atoms'
import PortfolioSplash from './PortfolioSplash'
import WalletSelector from './WalletSelector'
import HoldingsOverview from './HoldingsOverview'
import PositionsContainer from './PositionsContainer'

const Portfolio = () => {
  const wallet = useAtomValue(currentWalletAtom)
  console.log(wallet)
  if (!wallet) {
    return <PortfolioSplash />
  }

  return (
    <Box>
      <Box variant="layout.verticalAlign">
        <WalletSelector />
      </Box>
      <HoldingsOverview />
      <PositionsContainer />
    </Box>
  )
}

export default Portfolio
