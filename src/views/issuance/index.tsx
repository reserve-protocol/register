import { Box, Divider, Grid, Text } from 'theme-ui'
import { useWeb3React } from '@web3-react/core'
import { Container } from 'components'
import TransactionHistory from 'components/transaction-history'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { balancesAtom, rTokenAtom } from 'state/atoms'
import { ReserveToken } from 'types'
import Balances from './components/balances'
import Issue from './components/issue'
import Redeem from './components/redeem'

// TODO: make this query generic
const getHistory = gql`
    entries(
      where: {
        type_in: ["Issuance", "Redemption"]
        user: $userId
        token: $token
      }
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      type
      amount
      createdAt
      transaction {
        id
      }
    }
  }
`

const Issuance = () => {
  const RToken = useAtomValue(rTokenAtom) as ReserveToken
  const { account } = useWeb3React()
  const { data } = useQuery(getHistory, {
    userId: account?.toLocaleLowerCase(),
    token: RToken.token.address.toLowerCase(),
  })

  const balance = useAtomValue(balancesAtom)[RToken.token.address]

  return (
    <Container pb={4}>
      <Grid columns={[2, '2fr 1fr']} gap={4}>
        <Box>
          <Text mb={3} variant="sectionTitle">
            Mint & Redeem {RToken.token.symbol}
          </Text>
          <Grid columns={2}>
            <Issue data={RToken} />
            <Redeem data={RToken} max={balance} />
          </Grid>
        </Box>
        <Balances rToken={RToken} />
      </Grid>
      <Divider mt={4} mb={4} sx={{ borderColor: '#DFDFDF' }} />
      <Text mb={3} variant="sectionTitle">
        Transactions
      </Text>
      <TransactionHistory history={data?.entries ?? []} />
    </Container>
  )
}

export default Issuance
