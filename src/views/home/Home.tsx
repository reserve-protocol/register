import { Box } from 'theme-ui'
import CompareTokens from './components/CompareTokens'
import Hero from './components/Hero'
import RegisterAbout from './components/RegisterAbout'

/**
 * Main home screen
 */
const Home = () => (
  <>
    <Hero />
    <CompareTokens />
    <RegisterAbout />
  </>
)

export default Home
