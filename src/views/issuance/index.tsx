import { useEthers } from '@usedapp/core'
import { Button, Card, Container } from 'components'
import useRToken from 'hooks/useRToken'
import { useSelector } from 'react-redux'
import { selectCurrentRToken } from 'state/reserve-tokens/reducer'
import { Flex } from 'theme-ui'
import RTokenAbi from '../../abis/RToken.json'
import { RToken as IRToken } from '../../abis/types'
import Transactions from '../../components/transactions'
import { getAddress } from '../../constants/addresses'
import { useContract } from '../../hooks/useContract'
import Issue from './components/issue'
import Overview from './components/overview'
import Redeem from './components/redeem'

const Issuance = () => {
  const { account } = useEthers()
  const RToken = useSelector(selectCurrentRToken)
  const contract: IRToken | null = useContract(
    RToken?.address ?? '',
    RTokenAbi,
    true
  )

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

  const handleAct = () => {
    if (contract) {
      contract.act()
    }
  }

  return (
    <Container pt={4} pb={4}>
      <Overview data={RToken} />
      <Card title="Issue and Redemption" mb={3}>
        <Flex mx={-2} mb={3}>
          <Issue />
          <Redeem address={RToken.address} />
        </Flex>
        <Button onClick={handleAct}>Act</Button>
      </Card>
    </Container>
  )
}

export default Issuance
