import { useAtomValue } from 'jotai'
import { Box, Flex } from 'theme-ui'
import { currentWalletAtom } from '../atoms'
import PortfolioSplash from './PortfolioSplash'
import WalletSelector from './WalletSelector'
import HoldingsOverview from './HoldingsOverview'
import PositionsContainer from './PositionsContainer'
import TrackWalletInput from './TrackWalletInput'

const Portfolio = () => {
  const wallet = useAtomValue(currentWalletAtom)

  if (!wallet) {
    return <PortfolioSplash />
  }

  return (
    <Box>
      <Box
        variant="layout.verticalAlign"
        sx={{ justifyContent: 'space-between', gap: 3 }}
      >
        <WalletSelector />
        <TrackWalletInput
          sx={{
            maxWidth: 200,
          }}
        />
      </Box>
      <HoldingsOverview />
      <PositionsContainer />
    </Box>
  )
}

export default Portfolio
