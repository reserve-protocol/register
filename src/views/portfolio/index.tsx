import { Box } from 'theme-ui'
import Portfolio from './components/Portfolio'
import RegisterAbout from 'views/home/components/RegisterAbout'

const PortfolioWrapper = () => {
  return (
    <>
      <Box variant="layout.wrapper" p={[1, 4]} my={6}>
        <Portfolio />
      </Box>
      <RegisterAbout />
    </>
  )
}

export default PortfolioWrapper
