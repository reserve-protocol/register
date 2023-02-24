import { Container } from 'components'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { walletAtom } from 'state/atoms'
import { Divider, Grid } from 'theme-ui'
import About from './components/About'
import TransactionsOverview from './components/GeneralOverview'
import Greet from './components/Greet'
import Portfolio from './components/Portfolio'
import TokenList from './components/TokenList'
import TokenStats from './components/TokenStats'

const VISITED_KEY = 'visited'

const dividerProps = {
  mx: [-1, -5],
  my: [4, 6],
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
      {!!account && <Portfolio />}
      <Grid columns={[1, 1, 1, 2]}>
        <TokenStats mb={[5, 5, 5, 0]} mt={[0, 3]} />
        <TransactionsOverview />
      </Grid>
      <Divider mb={[0, 2]} {...dividerProps} />
      <TokenList mt={[4, 6]} />
      <Divider {...dividerProps} />
      <About />
    </Container>
  )
}

export default Home
