import { Card, Container } from 'components'
import { Text, Flex } from '@theme-ui/components'
import TransactionManager from 'state/context/TransactionManager'
import { RequiredApprovedTransactionWorker } from 'state/context/TransactionWorker'
import { useAppSelector } from 'state/hooks'
import {
  selectCurrentRToken,
  IReserveToken,
} from 'state/reserve-tokens/reducer'
import TransactionHistory from 'components/transaction-history'
import Stake from './components/stake'
import Unstake from './components/unstake'
import PendingUnstake from './components/pending-unstake'

const Staking = () => {
  // This component is protected by a guard, RToken always exists
  const RToken = useAppSelector(selectCurrentRToken) as IReserveToken

  return (
    <TransactionManager>
      <RequiredApprovedTransactionWorker method="stake" autoCalls />
      <Container pt={4} pb={4}>
        <Text mb={2} variant="sectionTitle">
          Stake and Withdrawn
        </Text>
        <Card mb={3}>
          <Flex mx={-2}>
            <Stake data={RToken} />
            <Unstake data={RToken} />
          </Flex>
        </Card>
        <TransactionHistory />
        <PendingUnstake mt={3} />
      </Container>
    </TransactionManager>
  )
}

export default Staking
