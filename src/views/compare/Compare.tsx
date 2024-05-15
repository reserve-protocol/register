import { Box } from 'theme-ui'
import CompareTokens from './components/CompareTokens'
import RegisterAbout from './components/RegisterAbout'

/**
 * Main Compare screen
 */
const Compare = () => (
  <Box sx={{ position: 'relative' }}>
    <CompareTokens />
    <RegisterAbout />
  </Box>
)

export default Compare
