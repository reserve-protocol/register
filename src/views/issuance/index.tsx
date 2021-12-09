import { Flex, Text } from '@theme-ui/components'
import { useEthers } from '@usedapp/core'
import { Card, Container } from 'components'
import ContractPlayground from 'components/dev/ContractPlayground'
import TransactionHistory from 'components/transaction-history'
import useTokensBalance from 'hooks/useTokensBalance'
import TransactionManager from 'state/context/TransactionManager'
import { useAppSelector } from 'state/hooks'
import {
  IReserveToken,
  selectCurrentRToken,
} from 'state/reserve-tokens/reducer'
import Balances from './components/balances'
import Issue from './components/issue'
import Redeem from './components/redeem'

const getTokenAddresses = (reserveToken: IReserveToken): [string, number][] => [
  [reserveToken.token.address, reserveToken.token.decimals],
  ...reserveToken.vault.collaterals.map((collateral): [string, number] => [
    collateral.token.address,
    collateral.token.decimals,
  ]),
]

const Issuance = () => {
  const { account } = useEthers()
  // This component is protected by a guard, RToken always exists
  const RToken = useAppSelector(selectCurrentRToken) as IReserveToken
  const tokenBalances = useTokensBalance(getTokenAddresses(RToken))

  const handleIssuance = (amount: number) => {}

  return (
    <TransactionManager>
      <Container pt={4} pb={4}>
        <Balances rToken={RToken} mb={3} />
        <Text mb={2} variant="sectionTitle">
          Mint and Redeem
        </Text>
        <Card mb={3}>
          <Flex mx={-2}>
            <Issue data={RToken} onIssue={handleIssuance} />
            <Redeem balance={tokenBalances[RToken.token.address]} />
          </Flex>
        </Card>
        <TransactionHistory />
        <ContractPlayground />
      </Container>
    </TransactionManager>
  )
}

export default Issuance
