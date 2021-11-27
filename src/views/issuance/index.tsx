import { Flex, Text } from '@theme-ui/components'
import { useEthers } from '@usedapp/core'
import { Card, Container } from 'components'
import TransactionsTable from 'components/transactions/table'
import useTokensBalance from 'hooks/useTokensBalance'
import { useSelector } from 'react-redux'
import { selectCurrentRToken } from 'state/reserve-tokens/reducer'
import Issue from './components/issue'

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
      <Text sx={{ fontSize: 4, display: 'block' }} mb={2}>
        Your Balances
      </Text>
      <Card title="Issue and Redemption" mb={3}>
        <Flex mx={-2} mb={3}>
          <Issue />
          {/* <Redeem address={RToken.address} /> */}
        </Flex>
      </Card>
      <Card title="Protocol TXs" mb={3}>
        <TransactionsTable />
      </Card>
    </Container>
  )
}

export default Issuance
