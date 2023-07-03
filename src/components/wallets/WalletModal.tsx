import { t, Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import SelectedIcon from 'components/icons/SelectedIcon'
import Modal from 'components/modal'
import { useAtomValue, useSetAtom } from 'jotai'
import { useState } from 'react'
import { ChevronRight } from 'react-feather'
import { chainIdAtom, isWalletModalVisibleAtom } from 'state/atoms'
import { Box, Flex, Image, Spinner, Text, Divider } from 'theme-ui'
import {
  coinbaseWallet,
  CONNECTOR_TYPES,
  getConnectorType,
  metaMask,
  walletConnect,
} from './connectors'
import coinbaseLogo from './imgs/coinbase.png'
import metamaskLogo from './imgs/metamask.png'
import walletconnectLogo from './imgs/walletconnect.png'

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
  // {
  //   icon: coinbaseLogo,
  //   type: CONNECTOR_TYPES.coinbase,
  //   label: 'Gnosis Safe',
  //   connector: gnosisSafe,
  // },
]

const WalletModal = () => {
  const { connector: currentConnector, account } = useWeb3React()
  const [connecting, setConnecting] = useState(false)
  const chainId = useAtomValue(chainIdAtom)
  const setWalletModalVisible = useSetAtom(isWalletModalVisibleAtom)
  const [error, setError] = useState('')

  const onClose = () => setWalletModalVisible(false)

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

  const handleSelection = async (connectorIndex: number) => {
    setConnecting(true)
    if (currentConnector.deactivate) {
      try {
        await currentConnector.deactivate()
      } catch (error) {
        console.log('error deactivating wallet', error)
      }
    }

    setTimeout(
      () => {
        wallets[connectorIndex].connector
          .activate(chainId)
          .then(onClose)
          .catch(handleError)
      },
      currentConnector.deactivate ? 1000 : 0
    )
  }

  return (
    <Modal
      title={!connecting ? t`Connect your wallet` : ''}
      style={{ maxWidth: 400 }}
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
            {wallets.map(({ icon, label, type, connector }, index) => (
              <Box
                sx={{ cursor: 'pointer' }}
                key={label}
                onClick={() => handleSelection(index)}
                variant="layout.verticalAlign"
                py={3}
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
            <Divider mx={-4} my={2} sx={{ borderColor: 'darkBorder' }} />
            <Box mt={4} sx={{ textAlign: 'center', fontSize: 1 }}>
              <Text variant="legend">
                <Trans>
                  Wallets are provided by External Providers and by selecting
                  you agree to Terms of those Providers. Your access to the
                  wallet might be reliant on the External Provider being
                  operational.
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
