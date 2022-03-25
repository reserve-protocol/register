import { gql, useQuery, useSubscription } from '@apollo/client'
import { Box, Grid, Text, Divider, Card } from '@theme-ui/components'
import { useContractCall, useEthers } from '@usedapp/core'
import { StRSR, StRSRInterface } from 'abis'
import { Container } from 'components'
import TransactionHistory from 'components/transaction-history'
import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import { useContract } from 'hooks/useContract'
import TransactionManager from 'state/context/TransactionManager'
import { RequiredApprovedTransactionWorker } from 'state/context/TransactionWorker'
import { useAppSelector } from 'state/hooks'
import { selectCurrentRToken } from 'state/reserve-tokens/reducer'
import { ReserveToken } from 'types'
import Balances from './components/balances'
import Stake from './components/stake'
import Unstake from './components/unstake'

const GET_PENDING_WITHDRAWALS = gql`
  subscription GetPendingWithdrawals($userId: String!) {
    entries(where: { type: "Unstake", status: Pending, user: $userId }) {
      id
      type
      amount
      stAmount
      availableAt
      transaction {
        id
      }
      user {
        id
      }
    }
  }
`
const Staking = () => {
  // This component is protected by a guard, RToken always exists
  const RToken = useAppSelector(selectCurrentRToken) as ReserveToken
  const { account } = useEthers()
  const { data, loading } = useSubscription(GET_PENDING_WITHDRAWALS, {
    variables: {
      orderBy: 'availableAt',
      where: {},
      userId: account?.toLowerCase(),
    },
  })

  const entries = data?.entries ?? []

  // TODO: Move this to a hook
  let pending = BigNumber.from(0)

  for (const entry of entries) {
    pending = pending.add(BigNumber.from(entry.amount))
  }

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
            <Card>
              <Text>Pending: {formatEther(pending.toString())} RSR</Text>
            </Card>
          </Box>
        </Grid>
        <Divider mt={4} mb={4} sx={{ borderColor: '#DFDFDF' }} />
        <Text mb={3} variant="sectionTitle">
          Transactions
        </Text>
        <TransactionHistory history={entries} />
      </Container>
    </TransactionManager>
  )
}

export default Staking
