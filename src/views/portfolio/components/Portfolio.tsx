import { useAtomValue } from 'jotai'
import { Box } from 'theme-ui'
import { currentWalletAtom } from '../atoms'
import PortfolioSplash from './PortfolioSplash'

const Portfolio = () => {
  const wallet = useAtomValue(currentWalletAtom)

  if (!wallet) {
    return <PortfolioSplash />
  }

  return <Box>portfolio</Box>
}

export default Portfolio
