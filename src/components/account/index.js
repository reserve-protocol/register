import styled from 'styled-components'
import { useEthers } from '@usedapp/core'

const Container = styled.div`
  
`

const Account = () => {
  const { activateBrowserWallet, account, deactivate } = useEthers()

  const handleConnect = () => {
    activateBrowserWallet(() => {
      // TODO: Error handling
    })
  }

  return (
    <Container>
      hola
      { !account ? <button type="button" onClick={handleConnect}>Connect</button>
        : <button type="button" onClick={deactivate}>Disconnect</button> }
      { account && (
        <>
          <p>
            Account:
            {' '}
            {account}
          </p>
        </>
      ) }
    </Container>
  )
}

export default Account
