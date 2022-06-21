import styled from '@emotion/styled'
import { useWeb3React } from '@web3-react/core'
import WalletIcon from 'components/icons/WalletIcon'
import useENSName from 'hooks/ens/useENSName'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { selectedAccountAtom } from 'state/atoms'
import { Box, Button, Text } from 'theme-ui'
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
  const { account } = useWeb3React()
  // TODO: Maybe unnecessary
  const { ENSName } = useENSName(account)
  const navigate = useNavigate()

  const handleAddWallet = () => {
    navigate(ROUTES.WALLET)
    setVisible(false)
  }

  return (
    <>
      {!account ? (
        <Button variant="accent" onClick={handleAddWallet}>
          Connect
        </Button>
      ) : (
        <Container onClick={() => setVisible(!isVisible)}>
          <WalletIcon />
          <Text sx={{ display: ['none', 'inherit', 'inherit'] }} ml={2} pr={2}>
            {ENSName || shortenAddress(account)}
          </Text>
          {isVisible ? <ChevronUp /> : <ChevronDown />}
        </Container>
      )}
    </>
  )
}

export default Account
