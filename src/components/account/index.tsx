import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import WalletIcon from 'components/icons/WalletIcon'
import WalletModal from 'components/wallets/WalletModal'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Box, Button, Text } from 'theme-ui'
import { shortenAddress } from 'utils'

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
  const { ENSName, account } = useWeb3React()

  return (
    <>
      {!account ? (
        <Button variant="accent" onClick={() => setVisible(true)}>
          <Trans>Connect</Trans>
        </Button>
      ) : (
        <Container onClick={() => setVisible(true)}>
          <WalletIcon />
          <Text sx={{ display: ['none', 'inherit', 'inherit'] }} ml={2} pr={2}>
            {ENSName || shortenAddress(account)}
          </Text>
          {isVisible ? <ChevronUp /> : <ChevronDown />}
        </Container>
      )}
      {isVisible && <WalletModal onClose={() => setVisible(false)} />}
    </>
  )
}

export default Account
