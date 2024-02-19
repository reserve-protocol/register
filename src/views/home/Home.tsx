import { Box, useColorMode } from 'theme-ui'
import CompareTokens from './components/CompareTokens'
import Hero from './components/Hero'
import RegisterAbout from './components/RegisterAbout'

const HeroBackground = () => {
  const [colorMode, setColorMode] = useColorMode()
  const url =
    colorMode === 'dark'
      ? '/imgs/bg-compare-dark.webp'
      : '/imgs/bg-compare-light.webp'

  return (
    <Box
      sx={{
        width: '100vw',
        height: '460px',
        top: 0,
        zIndex: -1,
        position: 'absolute',
        background: `url(${url}) no-repeat`,
        backgroundSize: 'cover',
        borderBottom: '3px solid',
        borderColor: 'borderFocused',
      }}
    />
  )
}

/**
 * Main home screen
 */
const Home = () => (
  <Box sx={{ position: 'relative' }}>
    <HeroBackground />
    <Hero />
    <CompareTokens />
    <RegisterAbout />
  </Box>
)

export default Home
