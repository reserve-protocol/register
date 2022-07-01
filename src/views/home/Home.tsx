import { t, Trans } from '@lingui/macro'
import { Container } from 'components'
import { ContentHead } from 'components/info-box'
import TransactionsTable from 'components/transactions/table'
import { gql } from 'graphql-request'
import { useAtomValue } from 'jotai'
import rtokens from 'rtokens'
import { recordsAtom } from 'state/atoms'
import { Box, Divider, Grid, Text } from 'theme-ui'

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

const getRTokenExchange = gql`
  {
    tokenDayDatas {
      token {
        name
      }
      close
    }
  }
`

const Home = () => {
  const txs = useAtomValue(recordsAtom)

  return (
    <Container>
      <Box mb={5}>
        <Text>
          <Trans>Total Staked RSR + Rtoken Value</Trans>
        </Text>
        <Text
          mt={0}
          pt={0}
          sx={{ fontSize: 6, fontWeight: 400, color: 'boldText' }}
          as="h1"
        >
          $211,052.17
        </Text>
      </Box>
      <Grid columns={[1, 1, 2]} gap={5}>
        <Box>
          <Text variant="sectionTitle">
            <Trans>Your RTokens</Trans>
          </Text>
        </Box>
        <Box>
          <Text variant="sectionTitle">
            <Trans>Your staked RSR positions</Trans>
          </Text>
        </Box>
      </Grid>
      <Divider my={5} mx={-5} />
      <Box>
        <Text
          variant="sectionTitle"
          sx={{ fontSize: 4, color: 'boldText' }}
          mb={5}
        >
          <Trans>General RToken Overview</Trans>
        </Text>
        <Grid columns={[1, 1, 2]} gap={5}>
          <Box>
            <ContentHead
              title={t`RToken stats`}
              subtitle={t`These stats are aggregated across all RTokens on the Reserve Protocol that are supported by this dApp. This also includes anonymized data from the Reserve App API if RTokens are supported by RPay to give insights into total currency usage.`}
            />
          </Box>
          <Box>
            <TransactionsTable
              compact
              card
              maxHeight={420}
              title={t`Recent Transactions`}
              help="TODO"
              data={txs}
            />
          </Box>
        </Grid>
      </Box>
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
