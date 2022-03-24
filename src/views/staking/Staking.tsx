import { gql, useQuery } from '@apollo/client'
import { Box, Grid, Text, Divider } from '@theme-ui/components'
import { useContractCall, useEthers } from '@usedapp/core'
import { StRSR, StRSRInterface } from 'abis'
import { Container } from 'components'
import TransactionHistory from 'components/transaction-history'
import { useContract } from 'hooks/useContract'
import TransactionManager from 'state/context/TransactionManager'
import { RequiredApprovedTransactionWorker } from 'state/context/TransactionWorker'
import { useAppSelector } from 'state/hooks'
import { selectCurrentRToken } from 'state/reserve-tokens/reducer'
import { ReserveToken } from 'types'
import Balances from './components/balances'
import PendingUnstake from './components/pending-unstake'
import Stake from './components/stake'
import Unstake from './components/unstake'

const GET_TX_HISTORY = gql`
  query GetStakingHistory($userId: String!) {
    entries(
      user: $userId
      where: { type_in: ["Stake", "Unstake"] }
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
  const stRSR = useContract(RToken.insurance?.token.address ?? '', StRSR)
  const withdrawals = useContractCall({
    abi: StRSRInterface,
    method: 'withdrawals',
    address: RToken.insurance?.token.address ?? '',
    args: [account, 0],
  })
  const { data, loading } = useQuery(GET_TX_HISTORY, {
    variables: {
      where: {},
      userId: account,
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
          <Balances rToken={RToken} />
        </Grid>
        <Divider mt={4} mb={4} sx={{ borderColor: '#DFDFDF' }} />
        <Text mb={3} variant="sectionTitle">
          Transactions
        </Text>
        <TransactionHistory
          history={data && data.entries ? data.entries : []}
        />
      </Container>
    </TransactionManager>
  )
}

export default Staking
