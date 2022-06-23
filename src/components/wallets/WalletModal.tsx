import { t, Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import SelectedIcon from 'components/icons/SelectedIcon'
import Modal from 'components/modal'
import { useState } from 'react'
import { ChevronRight } from 'react-feather'
import { Box, Flex, Image, Spinner, Text } from 'theme-ui'
import { CHAIN_ID } from 'utils/chains'
import {
  coinbaseWallet,
  CONNECTOR_TYPES,
  getConnectorType,
  metaMask,
  walletConnect,
  WalletConnector,
  gnosisSafe,
} from './connectors'
import coinbaseLogo from './imgs/coinbase.png'
import metamaskLogo from './imgs/metamask.png'
import walletconnectLogo from './imgs/walletconnect.png'

interface Props {
  onClose(): void
}

const wallets = [
  {
    icon: metamaskLogo,
    label: 'MetaMask',
    type: CONNECTOR_TYPES.metamask,
    connector: metaMask,
  },
  {
    icon: walletconnectLogo,
    label: 'WalletConnect',
    connector: walletConnect,
    type: CONNECTOR_TYPES.walletConnect,
  },
  {
    icon: coinbaseLogo,
    type: CONNECTOR_TYPES.coinbase,
    label: 'Coinbase Wallet',
    connector: coinbaseWallet,
  },
  {
    icon: coinbaseLogo,
    type: CONNECTOR_TYPES.coinbase,
    label: 'Gnosis Safe',
    connector: gnosisSafe,
  },
]

const WalletModal = ({ onClose }: Props) => {
  const { connector: currentConnector, account } = useWeb3React()
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')

  // TODO: Handle connection errors
  // Examples:
  // - Unsupported Chain
  // - User canceled error
  // - Unexpected error
  const handleError = (e: any) => {
    console.log('error', e)
    setConnecting(false)
    setError(t`Unexpected error connecting to the wallet`)
  }

  const handleSelection = (connector: WalletConnector) => {
    localStorage.removeItem('walletconnect')
    setConnecting(true)
    connector.activate(CHAIN_ID).then(onClose).catch(handleError)
  }

  return (
    <Modal
      title={!connecting ? t`Connect your wallet` : ''}
      style={{ width: 400 }}
      onClose={onClose}
    >
      <Box>
        {connecting ? (
          <Flex
            sx={{
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 120,
            }}
          >
            <Spinner size={24} />
            <Text mt={3}>
              <Trans>Connecting...</Trans>
            </Text>
          </Flex>
        ) : (
          <>
            {wallets.map(({ icon, label, type, connector }) => (
              <Box
                sx={{ cursor: 'pointer' }}
                key={label}
                onClick={() => handleSelection(connector)}
                variant="layout.verticalAlign"
                py={2}
              >
                <Image height={24} width={24} src={icon} />
                <Text ml={3} sx={{ fontSize: 3 }}>
                  {label}
                </Text>
                <Box mx="auto" />
                {getConnectorType(currentConnector) === type && account ? (
                  <SelectedIcon />
                ) : (
                  <ChevronRight
                    color="var(--theme-ui-colors-secondaryText)"
                    size={18}
                  />
                )}
              </Box>
            ))}
            <Box mt={5} sx={{ textAlign: 'center', fontSize: 1 }}>
              <Text>
                <Trans>
                  By connecting a wallet, you agree to LC Labs’ Terms of Service
                  and acknowledge that you have read and understand the LC Labs
                  Register Disclaimer.
                </Trans>
              </Text>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  )
}

export default WalletModal
