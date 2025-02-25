import { Box } from 'theme-ui'
import Portfolio from './components/Portfolio'
import RegisterAbout from '@/views/discover/components/yield/components/RegisterAbout'

const PortfolioWrapper = () => {
  return (
    <>
      <Box variant="layout.wrapper" px={[1, 4]} py={[1, 8]}>
        <Portfolio />
      </Box>
      <RegisterAbout />
    </>
  )
}

export default PortfolioWrapper
