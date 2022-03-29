import { gql, useQuery } from '@apollo/client'
import { Box, Divider, Grid, Text } from '@theme-ui/components'
import { useBlockMeta, useEthers } from '@usedapp/core'
import { Container } from 'components'
import TransactionHistory from 'components/transaction-history'
import TransactionManager from 'state/context/TransactionManager'
import { RequiredApprovedTransactionWorker } from 'state/context/TransactionWorker'
import { useAppSelector } from 'state/hooks'
import { selectCurrentRToken } from 'state/reserve-tokens/reducer'
import { ReserveToken } from 'types'
import Balances from './components/balances'
import Stake from './components/stake'
import Unstake from './components/unstake'
import Withdrawals from './components/withdrawals'

const getHistory = gql`
  query GetPendingWithdrawals($userId: String!, $token: String!) {
    entries(
      where: {
        type_in: ["Stake", "Unstake", "Withdrawn"]
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

const Staking = () => {
  // This component is protected by a guard, RToken always exists
  const RToken = useAppSelector(selectCurrentRToken) as ReserveToken
  const { account } = useEthers()
  const { data, loading } = useQuery(getHistory, {
    variables: {
      where: {},
      userId: account?.toLowerCase(),
      token: RToken.insurance!.token.address,
    },
  })

  return (
    <TransactionManager>
      <RequiredApprovedTransactionWorker methods={['stake']} autoCalls />
      <Container pt={4} pb={4}>
        <Grid columns={[2, '2fr 1fr']} gap={4}>
          <Box>
            <Text mb={2} variant="sectionTitle">
              Stake and Withdrawn
            </Text>
            <Grid columns={2} mb={3}>
              <Stake data={RToken} />
              <Unstake data={RToken} />
            </Grid>
          </Box>
          <Box>
            <Balances rToken={RToken} />
            <Text mt={3} mb={2} variant="sectionTitle">
              Withdrawals
            </Text>
            <Withdrawals tokenAddress={RToken.insurance?.token.address ?? ''} />
          </Box>
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

export default Staking
