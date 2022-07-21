import { Container } from 'components'
import { useAtomValue } from 'jotai'
import { selectedRTokenAtom, walletAtom } from 'state/atoms'
import { Divider, Text, Box } from 'theme-ui'
import GeneralOverview from './components/GeneralOverview'
import Portfolio from './components/Portfolio'
import TokenList from './components/TokenList'

const Home = () => {
  const account = useAtomValue(walletAtom)
  const selectedToken = useAtomValue(selectedRTokenAtom)

  return (
    <Container mx={selectedToken ? 0 : 3}>
      {!!account && <Portfolio />}
      <GeneralOverview />
      <Divider my={5} mx={-5} />
      <TokenList />
      <Divider my={5} mx={-5} />
      <Box mb={5}>
        <Text>About app TODO</Text>
      </Box>
    </Container>
  )
}

export default Home
