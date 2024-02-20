import { Box } from 'theme-ui'
import Portfolio from './components/Portfolio'
import RegisterAbout from 'views/home/components/RegisterAbout'

const PortfolioWrapper = () => {
  return (
    <>
      <Box
        variant="layout.wrapper"
        px={[1, 4]}
        py={[1, 8]}
        sx={{ borderTop: '1px solid', borderColor: 'border' }}
      >
        <Portfolio />
      </Box>
      <RegisterAbout />
    </>
  )
}

export default PortfolioWrapper
