import { Grid, Text, Box, Card, Button, Flex } from 'theme-ui'
import { useWeb3React } from '@web3-react/core'
import { Container } from 'components'
import { Table } from 'components/table'
import useBlockNumber from 'hooks/useBlockNumber'
import useQuery from 'hooks/useQuery'
import { gql } from 'graphql-request'
import { useAtomValue } from 'jotai'
import { rTokenAtom } from 'state/atoms'
import toast from 'react-hot-toast'
import { Check, X } from 'react-feather'
import Notification from 'components/notification'

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
  // const data = useQuery(getRTokenExchange)
  // const reserveToken = useAtomValue(rTokenAtom)

  const handleClick = () => {
    toast((t) => (
      <Notification
        title="Transaction complete"
        subtitle="USD+ now in your wallet"
        toastId={t.id}
        icon={<Check />}
      />
    ))
  }

  return (
    <Container>
      <Button onClick={handleClick}>Test</Button>
    </Container>
  )
}

export default Home

/**
<Text sx={{ fontSize: 6, fontWeight: 100 }}>$ 123,123.00</Text>
<Grid columns={2} mt={4} width={620}>
  <Box>
    <Text mb={3} variant="sectionTitle">
      Your RTokens
    </Text>
    <Table columns={yourTokensColumns} data={mockTokens} />
  </Box>
  <Box>
    <Text mb={3} variant="sectionTitle">
      Your IP Tokens
    </Text>
    <Table columns={yourStakingTokensColumns} data={stakingTokens} />
  </Box>
</Grid>
<Box></Box>
*/
