import { Box } from 'theme-ui'
import Portfolio from './components/Portfolio'
import RegisterAbout from 'views/compare/components/RegisterAbout'
import PortfolioUpdater from './Updater'
import _Portfolio from './components/_Portfolio'

const PortfolioWrapper = () => {
  return (
    <>
      <Box variant="layout.wrapper" px={[1, 4]} pt={[1, 6]}>
        <Portfolio />
        <_Portfolio />
      </Box>
      <RegisterAbout />
      <PortfolioUpdater />
    </>
  )
}

export default PortfolioWrapper
