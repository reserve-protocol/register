import { Card, Container } from 'components'
import { Text, Flex } from '@theme-ui/components'
import TransactionManager from 'state/context/TransactionManager'
import { RequiredApprovedTransactionWorker } from 'state/context/TransactionWorker'
import { useAppSelector } from 'state/hooks'
import { selectCurrentRToken } from 'state/reserve-tokens/reducer'
import TransactionHistory from 'components/transaction-history'
import { gql, useQuery } from '@apollo/client'
import { useEthers } from '@usedapp/core'
import { ReserveToken } from 'types'
import Stake from './components/stake'
import Unstake from './components/unstake'
import PendingUnstake from './components/pending-unstake'
import Balances from './components/balances'

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
        <Balances rToken={RToken} />
        <Text mb={2} mt={3} variant="sectionTitle">
          Stake and Withdrawn
        </Text>
        <Card mb={3}>
          <Flex mx={-2}>
            <Stake data={RToken} />
            <Unstake data={RToken} />
          </Flex>
        </Card>
        <TransactionHistory
          history={data && data.entries ? data.entries : []}
        />
        <PendingUnstake mt={3} />
      </Container>
    </TransactionManager>
  )
}

export default Staking
