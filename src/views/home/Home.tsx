import { Container } from 'components'
import { useAtom, useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { useEffect, useState } from 'react'
import { selectedRTokenAtom, walletAtom } from 'state/atoms'
import { Box, Divider } from 'theme-ui'
import About from './components/About'
import Greet from './components/Greet'
import Portfolio from './components/Portfolio'
import Stats from './components/Stats'
import TokenList from './components/TokenList'
import Announcement from './components/Announcement'
import Hero from './components/Hero'

const VISITED_KEY = 'visited'

const dividerProps = {
  mx: [-1, -3],
  my: [5, 8],
}

/**
 * Main home screen
 */
const Home = () => {
  const account = useAtomValue(walletAtom)
  const [visited, setVisited] = useState(
    !!account || !!localStorage.getItem(VISITED_KEY)
  )
  const [token, setToken] = useAtom(selectedRTokenAtom)

  const handleDismiss = () => {
    setVisited(true)
    localStorage.setItem(VISITED_KEY, 'true')
  }

  useEffect(() => {
    if (account && !visited) {
      handleDismiss()
    }
  }, [account])

  // Unselect rToken if on this view ("back" browser action for example)
  useEffect(() => {
    mixpanel.track('Land on Home Page', {})
    if (token) {
      setToken(null)
    }
  }, [])

  return (
    <Box>
      <Hero />
      <TokenList />
      <About />
    </Box>
  )
}

export default Home
