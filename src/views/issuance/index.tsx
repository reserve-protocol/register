import { useEthers } from '@usedapp/core'
import { Button, Card, Container } from 'components'
import { Text } from '@theme-ui/components'
import TransactionsTable from 'components/transactions/table'
import { useSelector } from 'react-redux'
import { selectCurrentRToken } from 'state/reserve-tokens/reducer'

const Issuance = () => {
  const { account } = useEthers()
  const RToken = useSelector(selectCurrentRToken)

  if (!account) {
    return (
      <Container pt={4} pb={4}>
        <Card>Please connect your wallet...</Card>
      </Container>
    )
  }

  if (!RToken) {
    return <span>Loading....... </span>
  }

  return (
    <Container pt={4} pb={4}>
      <Text sx={{ fontSize: 4, display: 'block' }} mb={2}>
        Your Balances
      </Text>
      {/* 
      <Card title="Issue and Redemption" mb={3}>
        <Flex mx={-2} mb={3}>
          <Issue />
          <Redeem address={RToken.address} />
        </Flex>
        <Button onClick={handleAct}>Act</Button>
      </Card>
      <Factory />
      <Card title="Protocol TXs" mb={3}>
        <TransactionsTable />
      </Card> */}
    </Container>
  )
}

export default Issuance
