import styled from '@emotion/styled'
import { Box, Button, Text } from '@theme-ui/components'
import { shortenAddress, useEthers } from '@usedapp/core'
import Popup from 'components/popup'
import Separator from 'components/separator'
import WalletList from 'components/wallets/WalletList'
import useENSName from 'hooks/ens/useENSName'
import { useState } from 'react'
import Blockies from 'react-blockies'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from 'state/hooks'
import { selectWallet } from 'state/wallets/reducer'
import { ROUTES } from '../../constants'

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
  const [isVisible, setVisible] = useState(false)
  const currentWallet = useAppSelector(({ wallets }) => wallets.current)

  const { ENSName } = useENSName(currentWallet)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleAddWallet = () => {
    navigate(ROUTES.WALLET)
    setVisible(false)
  }

  const handleWalletChange = (selectedWallet: string) => {
    dispatch(selectWallet(selectedWallet))
  }

  return (
    <>
      {!currentWallet ? (
        <Button variant="accent" onClick={handleAddWallet}>
          Connect
        </Button>
      ) : (
        <Popup
          show={isVisible}
          onDismiss={() => setVisible(false)}
          content={
            <Box p={2}>
              <WalletList onChange={handleWalletChange} />
              <hr />
              <Text
                sx={{ display: 'block', cursor: 'pointer' }}
                onClick={handleAddWallet}
              >
                Track new wallet
              </Text>
            </Box>
          }
        >
          <Container onClick={() => setVisible(!isVisible)}>
            <Box mr={2} mt={1}>
              <Blockies scale={3} seed={currentWallet || ''} />
            </Box>
            <Text>{ENSName || shortenAddress(currentWallet)}</Text>
          </Container>
        </Popup>
      )}
    </>
  )
}

export default Account
