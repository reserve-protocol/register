import { Container } from 'components'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { selectedRTokenAtom, walletAtom } from 'state/atoms'
import { Divider } from 'theme-ui'
import mixpanel from 'mixpanel-browser'
import About from './components/About'
import Greet from './components/Greet'
import Portfolio from './components/Portfolio'
import Stats from './components/Stats'
import TokenList from './components/TokenList'

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
      setToken('')
    }
  }, [])

  return (
    <Container>
      {!account && !visited && <Greet onDismiss={handleDismiss} />}
      {!!account && <Portfolio mt={5} mb={8} />}
      <Stats />
      <Divider mt={[0, 6]} mb={[5, 8]} />
      <TokenList />
      <Divider {...dividerProps} />
      <About />
    </Container>
  )
}

export default Home
