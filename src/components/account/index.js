import { useState } from 'react'
import styled from 'styled-components'
import { Button } from '@shopify/polaris'
import { useEthers } from '@usedapp/core'
import WalletModal from '../wallet-modal'
import { Flex, Text } from 'rebass'

const Container = styled.div`
  display: flex;
  border: 1px solid #ccc;
  border-left: none;
  height: 38px;
  
  ${Text} {
    padding: 0px 10px;
    align-self: center;

    div {
      align-self: center;
    }
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
  const { account, deactivate, activateBrowserWallet } = useEthers()
  const [isWalletModalVisible, showWalletModal] = useState(false)

  const handleConnect = () => {
    activateBrowserWallet(() => {
      // TODO: Error handling
    })
    // showWalletModal(true)
  }

  if (!account) {
    return (
      <>
        <Button onClick={handleConnect}>Connect</Button>
        { isWalletModalVisible && <WalletModal /> }
      </>
    )
  }

  return (
    <Flex alignItems="center">
      <Button style={{ borderRadius: 8 }} type="button" onClick={deactivate}>Disconnect</Button>
      <Container>
        <Text>{account}</Text>
      </Container>
    </Flex>
  )
}

export default Account
