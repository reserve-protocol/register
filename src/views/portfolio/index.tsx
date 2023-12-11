import { Box } from 'theme-ui'
import Portfolio from './components/Portfolio'

const PortfolioWrapper = () => {
  return (
    <Box variant="layout.wrapper" p={[1, 4]} my={6}>
      <Portfolio />
    </Box>
  )
}

export default PortfolioWrapper
