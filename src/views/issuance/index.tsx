import { gql, useQuery } from '@apollo/client'
import { Flex, Text } from '@theme-ui/components'
import { useEthers } from '@usedapp/core'
import { Card, Container } from 'components'
import TransactionHistory from 'components/transaction-history'
import useTokensBalance from 'hooks/useTokensBalance'
import TransactionManager from 'state/context/TransactionManager'
import { RequiredApprovedTransactionWorker } from 'state/context/TransactionWorker'
import { useAppSelector } from 'state/hooks'
import {
  IReserveToken,
  selectCurrentRToken,
} from 'state/reserve-tokens/reducer'
import Balances from './components/balances'
import Issue from './components/issue'
import PendingIssuances from './components/pending'
import Redeem from './components/redeem'

const getTokenAddresses = (reserveToken: IReserveToken): [string, number][] => [
  [reserveToken.token.address, reserveToken.token.decimals],
  ...reserveToken.vault.collaterals.map((collateral): [string, number] => [
    collateral.token.address,
    collateral.token.decimals,
  ]),
]

const GET_TX_HISTORY = gql`
  query GetIssuancesHistory($userId: String!) {
    entries(
      user: $userId
      where: { type_in: ["Issuance", "Redemption"] }
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
  // This component is protected by a guard, RToken always exists
  const { account } = useEthers()
  const { data, loading } = useQuery(GET_TX_HISTORY, {
    variables: {
      where: {},
      userId: account,
    },
  })
  const RToken = useAppSelector(selectCurrentRToken) as IReserveToken
  const tokenBalances = useTokensBalance(getTokenAddresses(RToken))

  return (
    <TransactionManager>
      <RequiredApprovedTransactionWorker method="issue" autoCalls />
      <Container pt={4} pb={4}>
        <Balances rToken={RToken} mb={3} />
        <Text mb={2} variant="sectionTitle">
          Mint and Redeem
        </Text>
        <Card mb={3}>
          <Flex mx={-2}>
            <Issue data={RToken} />
            <Redeem
              data={RToken}
              balance={tokenBalances[RToken.token.address]}
            />
          </Flex>
        </Card>
        <TransactionHistory
          history={data && data.entries ? data.entries : []}
        />
        <PendingIssuances mt={3} />
      </Container>
    </TransactionManager>
  )
}

export default Issuance
