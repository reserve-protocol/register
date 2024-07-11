import { Box } from 'theme-ui'
import Portfolio from './components/Portfolio'
import RegisterAbout from 'views/compare/components/RegisterAbout'
import PortfolioUpdater from './Updater'

const PortfolioWrapper = () => {
  return (
    <>
      <Box variant="layout.wrapper" px={[1, 4]} pt={[1, 6]}>
        <Portfolio />
      </Box>
      <RegisterAbout />
      <PortfolioUpdater />
    </>
  )
}

export default PortfolioWrapper
