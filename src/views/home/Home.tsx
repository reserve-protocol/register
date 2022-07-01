import { t } from '@lingui/macro'
import { Container } from 'components'
import { ContentHead } from 'components/info-box'
import { Box, Divider } from 'theme-ui'
import GeneralOverview from './components/GeneralOverview'
import Portfolio from './components/Portfolio'

const mockTokens: any = [
  { name: 'USD1', price: '$1.00', balance: '0.00', value: '0.00', apy: '0.00' },
  {
    name: 'USD1',
    price: '$1.00',
    balance: '0.00',
    value: '$1,308.38',
    apy: '3.05',
  },
]

const stakingTokens: any = [
  {
    name: 'USD1RSR',
    rate: '1.024700',
    balance: '10,234,400',
    rsrValue: '10,487,190',
    usdValue: '200,743.79',
    apy: '5.45%',
  },
  {
    name: 'USD1RSR',
    rate: '1.013800',
    balance: '0.00',
    rsrValue: '0',
    usdValue: '$0',
    apy: '5.04%',
  },
]

const yourTokensColumns: any = [
  { Header: 'RToken', accessor: 'name' },
  { Header: 'Price', accessor: 'price' },
  { Header: 'Balance', accessor: 'balance' },
  { Header: 'Value', accessor: 'value' },
  { Header: 'APY', accessor: 'apy' },
]

const yourStakingTokensColumns: any = [
  { Header: 'IP Token', accessor: 'name' },
  { Header: 'RSR Rate', accessor: 'rate' },
  { Header: 'Balance', accessor: 'balance' },
  { Header: 'RSR Value', accessor: 'rsrValue' },
  { Header: 'USD Value', accessor: 'usdValue' },
  { Header: 'APY', accessor: 'apy' },
]

const Home = () => {
  return (
    <Container>
      <Portfolio />
      <GeneralOverview />
      <Divider my={5} mx={-5} />
      <Box>
        <ContentHead
          title={t`Compare RTokens`}
          subtitle={t`Including off-chain in-app transactions of RToken in the Reserve App.`}
        />
      </Box>
      <Divider my={5} mx={-5} />
    </Container>
  )
}

export default Home
