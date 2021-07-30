import styled from 'styled-components'
import { useEthers } from '@usedapp/core'

const Container = styled.div`
  display: flex;
  border: 1px solid #ccc;
  border-radius: 10px;
  height: 38px;
  
  p {
    padding: 0px 10px;
    align-self: center;
  }
`

/**
 * Account
 *
 * Handles metamask* account interaction
 *
 * @returns {JSX.Element}
 * @constructor
 */
const Account = () => {
  const { activateBrowserWallet, account, deactivate } = useEthers()

  const handleConnect = () => {
    activateBrowserWallet(() => {
      // TODO: Error handling
    })
  }

  if (!account) {
    return <button type="button" onClick={handleConnect}>Connect your account</button>
  }

  return (
    <Container>
      <button type="button" onClick={deactivate}>Disconnect your account</button>
      <p>
        {account}
      </p>
    </Container>
  )
}

export default Account
