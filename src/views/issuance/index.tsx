import { useEthers } from '@usedapp/core'
import { Button, Card, Container } from 'components'
import useRToken from 'hooks/useRToken'
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
  const { chainId } = useEthers()
  const RTOKEN_ADDRESS = getAddress(chainId, 'RTOKEN')
  const [state, loading] = useRToken(RTOKEN_ADDRESS)
  const contract: IRToken | null = useContract(RTOKEN_ADDRESS, RTokenAbi, true)

  if (loading) {
    return null
  }

  const handleAct = () => {
    if (contract) {
      contract.act()
    }
  }

  return (
    <Container pt={4} pb={4}>
      <Overview data={state} />
      <Card title="Issue and Redemption" mb={3}>
        <Flex mx={-2} mb={3}>
          <Issue rToken={state} />
          <Redeem address={state.address} balance={state.balance || 0} />
        </Flex>
        <Button onClick={handleAct}>Act</Button>
      </Card>
    </Container>
  )
}

export default Issuance
