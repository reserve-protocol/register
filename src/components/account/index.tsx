import styled from '@emotion/styled'
import { shortenAddress, useEthers } from '@usedapp/core'
import useENSName from 'hooks/ens/useENSName'
import Blockies from 'react-blockies'
import { useState } from 'react'
import { Button, Text, Box } from '@theme-ui/components'
import WalletModal from '../wallet-modal'

const Container = styled.div`
  display: flex;
  border: 1px solid #77838f;
  justify-content: center;
  align-items: center;
  height: 38px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
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
  const { account } = useEthers()
  const { ENSName } = useENSName(account)
  const [isWalletModalVisible, showWalletModal] = useState(false)

  const handleOpenModal = () => {
    showWalletModal(true)
  }

  return (
    <>
      {!account ? (
        <Button variant="accent" onClick={handleOpenModal}>
          Connect
        </Button>
      ) : (
        <Container onClick={handleOpenModal}>
          <Box mr={2} mt={1}>
            <Blockies scale={3} seed={account || ''} />
          </Box>
          <Text>{ENSName || shortenAddress(account)}</Text>
        </Container>
      )}
      {isWalletModalVisible && (
        <WalletModal onClose={() => showWalletModal(false)} />
      )}
    </>
  )
}

export default Account
