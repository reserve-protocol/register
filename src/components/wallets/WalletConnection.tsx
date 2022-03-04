import styled from '@emotion/styled'
import { Box, BoxProps, Text } from '@theme-ui/components'
import { useEthers } from '@usedapp/core'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { Modal } from 'components'
import {
  CoinbaseIcon,
  FortmaticIcon,
  MetamaskIcon,
  TrezorIcon,
  WalletConnectIcon,
} from 'components/icons/logos'
import { useEffect, useState } from 'react'
import {
  fortmatic,
  injected,
  trezor,
  walletconnect,
  walletlink,
} from '../wallet-modal/connectors'

const WALLETS = [
  { icon: MetamaskIcon, label: 'Metamask', connector: injected },
  {
    icon: WalletConnectIcon,
    label: 'WalletConnect',
    connector: walletconnect,
  },
  { icon: FortmaticIcon, label: 'Fortmatic', connector: fortmatic },
  { icon: TrezorIcon, label: 'Trezor', connector: trezor },
  { icon: CoinbaseIcon, label: 'Coinbase', connector: walletlink },
]

const WalletButton = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 8px;
  align-items: center;
  width: 100%;
  border: 1px solid white;
  width: 120px;
  height: 120px;
  padding: 20px;
  margin-right: 20px;
  margin-top: 20px;

  svg {
    font-size: 64px;
  }

  &:hover {
    cursor: pointer;
    border: 1px solid #ccc;
  }
`

interface Props extends BoxProps {
  onConnect?(account: string): void
}

const ErrorBox = ({ error }: { error: string }) => (
  <Box sx={{ textAlign: 'center', color: '#DC3644' }} mb={3}>
    <Text>Oops, something went wrong while connecting to the wallet</Text>
    <br />
    <Text>{error}</Text>
  </Box>
)

const WalletConnection = ({ onConnect, ...props }: Props) => {
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const { activate, deactivate, account } = useEthers()

  // TODO: Handle connection errors
  // Examples:
  // - Unsupported Chain
  // - User canceled error
  // - Unexpected error
  const handleError = (e: any) => {
    console.log('error', e)
    setConnecting(false)
    setError('Unexpected error connecting to the wallet')
  }

  useEffect(() => {
    if (connecting && account) {
      setConnecting(false)
      if (onConnect) {
        onConnect(account)
      }
    }
  }, [connecting, account])

  // Tries to connect to the specified wallet
  const handleWalletSelection = async (connector: AbstractConnector) => {
    localStorage.removeItem('walletconnect')
    deactivate()
    setError('')
    setConnecting(true)
    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (
      connector instanceof WalletConnectConnector &&
      connector.walletConnectProvider?.wc?.uri
    ) {
      connector.walletConnectProvider = undefined
    }

    setTimeout(() => activate(connector, handleError), 1)
  }

  if (connecting) {
    return (
      <Modal {...props} title="Connecting to Wallet">
        Connecting, please follow up your wallet instructions...
      </Modal>
    )
  }

  return (
    <Box {...props}>
      {!!error && <ErrorBox error={error} />}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
          marginTop: -20,
          marginRight: -20,
        }}
      >
        {WALLETS.map(({ icon: Icon, label, connector }) => (
          <WalletButton
            key={label}
            onClick={() => handleWalletSelection(connector)}
          >
            <Icon />
            <Text sx={{ display: 'block', marginTop: 2 }}>{label}</Text>
          </WalletButton>
        ))}
      </Box>
    </Box>
  )
}

export default WalletConnection
