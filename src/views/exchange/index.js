import styled from 'styled-components'
import { useEtherBalance, useEthers } from '@usedapp/core'
import { formatEther } from '@ethersproject/units'
import Account from '../../components/account'

const Container = styled.div`
  
`

const Exchange = () => {
  const { account } = useEthers()
  const etherBalance = useEtherBalance(account)

  return (
    <Container>
      <Account />
      { account && (
        <>
          <p>
            Balance:
            {' '}
            {etherBalance && parseFloat(formatEther(etherBalance)).toFixed(3)}
            {' '}
            ETH
          </p>
        </>
      ) }
    </Container>
  )
}

export default Exchange
