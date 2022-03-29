import { gql, useQuery } from '@apollo/client'
import { Box, Divider, Grid, Text } from '@theme-ui/components'
import { useEthers } from '@usedapp/core'
import { Container } from 'components'
import TransactionHistory from 'components/transaction-history'
import TransactionManager from 'state/context/TransactionManager'
import { RequiredApprovedTransactionWorker } from 'state/context/TransactionWorker'
import { useAppSelector } from 'state/hooks'
import { selectCurrentRToken } from 'state/reserve-tokens/reducer'
import { ReserveToken } from 'types'
import Balances from './components/balances'
import Issue from './components/issue'
import Redeem from './components/redeem'

// TODO: make this query generic
const getHistory = gql`
  query GetIssuancesHistory($userId: String!, $token: String!) {
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
  const RToken = useAppSelector(selectCurrentRToken) as ReserveToken
  const { account } = useEthers()
  const { data, loading } = useQuery(getHistory, {
    variables: {
      where: {},
      userId: account?.toLocaleLowerCase(),
      token: RToken.token.address.toLowerCase(),
    },
  })
  const balance =
    useAppSelector(
      ({ reserveTokens }) => reserveTokens.balances[RToken.token.address]
    ) || 0

  return (
    <TransactionManager>
      <RequiredApprovedTransactionWorker
        methods={['issue', 'redeem']}
        autoCalls
      />
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
    </TransactionManager>
  )
}

export default Issuance
