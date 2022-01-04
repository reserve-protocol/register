import styled from '@emotion/styled'
import Jazzicon from '@metamask/jazzicon'
import { shortenAddress, useEthers } from '@usedapp/core'
import useENSName from 'hooks/ens/useENSName'
import { useEffect, useRef, useState } from 'react'
import { Button, Text } from 'theme-ui'
import WalletModal from '../wallet-modal'

const Container = styled.div`
  display: flex;
  border: 1px solid #77838f;
  justify-content: center;
  align-items: center;
  height: 38px;
  padding: 1rem;
  border-radius: 4px;
  cursor: pointer;
`

const StyledIdenticon = styled.div`
  margin-right: 10px;
  margin-top: 4px;
  border-radius: 1.125rem;
`

function Identicon() {
  const ref = useRef<HTMLDivElement>()
  const { account } = useEthers()

  useEffect(() => {
    if (account && ref.current) {
      ref.current.innerHTML = ''
      ref.current.appendChild(Jazzicon(16, parseInt(account.slice(2, 10), 16)))
    }
  }, [account])

  return <StyledIdenticon ref={ref as any} />
}

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
          <Identicon />
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
