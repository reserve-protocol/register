import { useEffect, useRef, useState } from 'react'
import styled from '@emotion/styled'
import { shortenAddress, useEthers } from '@usedapp/core'
import { Text, Button } from 'theme-ui'
import Jazzicon from '@metamask/jazzicon'
import WalletModal from '../wallet-modal'

const Container = styled.div`
  display: flex;
  border: 1px solid #f5f5f5;
  justify-content: center;
  align-items: center;
  height: 38px;
  padding: 1rem;
  border-radius: 8px;
`

const StyledIdenticon = styled.div`
  padding-right: 10px;
  padding-top: 4px;
  border-radius: 1.125rem;
  background-color: black;
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
  const { account, activateBrowserWallet } = useEthers()
  const [isWalletModalVisible, showWalletModal] = useState(false)

  const handleConnect = () => {
    // activateBrowserWallet(() => {
    //   // TODO: Error handling
    // })
    showWalletModal(true)
  }

  if (!account) {
    return (
      <>
        <Button onClick={handleConnect}>Connect</Button>
        {isWalletModalVisible && (
          <WalletModal onClose={() => showWalletModal(false)} />
        )}
      </>
    )
  }

  return (
    <Container>
      <Identicon />
      <Text>{shortenAddress(account)}</Text>
    </Container>
  )
}

export default Account
