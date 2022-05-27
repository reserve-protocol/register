import styled from '@emotion/styled'
import { Box, Button, Text } from 'theme-ui'
import Popup from 'components/popup'
import WalletList from 'components/wallets/WalletList'
import useENSName from 'hooks/ens/useENSName'
import { useAtom } from 'jotai'
import { useState } from 'react'
import Blockies from 'react-blockies'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { selectedAccountAtom } from 'state/atoms'
import { shortenAddress } from 'utils'
import { ROUTES } from 'utils/constants'

const Container = styled(Box)`
  display: flex;
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
  const [currentWallet, setCurrentAccount] = useAtom(selectedAccountAtom)
  // TODO: Maybe unnecessary
  const { ENSName } = useENSName(currentWallet)
  const navigate = useNavigate()

  const handleAddWallet = () => {
    navigate(ROUTES.WALLET)
    setVisible(false)
  }

  const handleWalletChange = (selectedWallet: string) => {
    setCurrentAccount(selectedWallet)
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
            <Text sx={{ display: ['none', 'inherit', 'inherit'] }} pr={2}>
              {ENSName || shortenAddress(currentWallet)}
            </Text>
            {isVisible ? <ChevronUp /> : <ChevronDown />}
          </Container>
        </Popup>
      )}
    </>
  )
}

export default Account
