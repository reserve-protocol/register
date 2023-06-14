import { Container } from 'components'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { walletAtom } from 'state/atoms'
import { Divider, Grid } from 'theme-ui'
import About from './components/About'
import Greet from './components/Greet'
import Portfolio from './components/Portfolio'
import TokenList from './components/TokenList'
import Stats from './components/Stats'

const VISITED_KEY = 'visited'

const dividerProps = {
  mx: [-1, 0],
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

  const handleDismiss = () => {
    setVisited(true)
    localStorage.setItem(VISITED_KEY, 'true')
  }

  useEffect(() => {
    if (account && !visited) {
      handleDismiss()
    }
  }, [account])

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
