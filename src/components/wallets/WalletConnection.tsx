import styled from '@emotion/styled'
import { Box, BoxProps, Text } from '@theme-ui/components'
import { useEthers } from '@usedapp/core'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import {
  CoinbaseIcon,
  FortmaticIcon,
  MetamaskIcon,
  TrezorIcon,
  WalletConnectIcon,
} from 'components/icons/logos'
import { useState } from 'react'
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
  width: 130px;
  height: 130px;
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
  onConnect?: () => {}
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
  const { activate, deactivate } = useEthers()

  // TODO: Handle connection errors
  // Examples:
  // - Unsupported Chain
  // - User canceled error
  // - Unexpected error
  const handleError = (e: any) => {
    setError('Unexpected error connecting to the wallet')
  }

  // Tries to connect to the specified wallet
  const handleWalletSelection = async (connector: AbstractConnector) => {
    localStorage.removeItem('walletconnect')
    deactivate()
    setConnecting(true)
    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (
      connector instanceof WalletConnectConnector &&
      connector.walletConnectProvider?.wc?.uri
    ) {
      connector.walletConnectProvider = undefined
    }

    activate(connector, handleError)
      .then((result) => {
        // TODO: Send wallet address
        console.log('result', result)
        if (onConnect) {
          onConnect()
        }
      })
      .catch(handleError)
  }

  if (connecting) {
    return <Box {...props}>Connecting...</Box>
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
            <Icon /> {label}
          </WalletButton>
        ))}
      </Box>
    </Box>
  )
}

export default WalletConnection
