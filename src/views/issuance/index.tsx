import { Flex, Text } from '@theme-ui/components'
import { useEthers } from '@usedapp/core'
import { Card, Container } from 'components'
import ContractPlayground from 'components/dev/ContractPlayground'
import TransactionsTable from 'components/transactions/table'
import useTokensBalance from 'hooks/useTokensBalance'
import { useSelector } from 'react-redux'
import { selectCurrentRToken } from 'state/reserve-tokens/reducer'
import Balances from './components/balances'
import Issue from './components/issue'
import Redeem from './components/redeem'

const Issuance = () => {
  const { account } = useEthers()
  const RToken = useSelector(selectCurrentRToken)
  const tokenBalances = useTokensBalance(
    RToken && account
      ? [
          [RToken.rToken.address, RToken.rToken.decimals],
          ...RToken.vault.collaterals.map((collateral): [string, number] => [
            collateral.token.address,
            collateral.token.decimals,
          ]),
        ]
      : []
  )

  // TODO: Connect your wallet placeholder
  if (!account) {
    return (
      <Container pt={4} pb={4}>
        <Card>Please connect your wallet...</Card>
      </Container>
    )
  }

  // TODO: Loading placeholder
  if (!RToken) {
    return <span>Loading....... </span>
  }

  return (
    <Container pt={4} pb={4}>
      <Balances rToken={RToken} mb={3} />
      <Text mb={2} variant="sectionTitle">
        Mint and Redeem
      </Text>
      <Card mb={3}>
        <Flex mx={-2} mb={3}>
          <Issue />
          <Redeem balance={tokenBalances[RToken.rToken.address]} />
        </Flex>
      </Card>
      <Card title="Protocol TXs" mb={3}>
        <TransactionsTable />
      </Card>
      <ContractPlayground />
    </Container>
  )
}

export default Issuance
