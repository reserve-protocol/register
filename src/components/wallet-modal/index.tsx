import { useEthers } from '@usedapp/core'
import { Box, Flex, Text } from 'theme-ui'
import styled from '@emotion/styled'
import MetamaskIcon from 'components/icons/logos/Metamask'
import WalletConnectIcon from 'components/icons/logos/WalletConnect'
import FortmaticIcon from 'components/icons/logos/Fortmatic'
import LedgerIcon from 'components/icons/logos/Ledger'
import { Button } from 'components'
import { useState, useEffect, useRef } from 'react'
import Transactions from 'components/transactions'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { injected, walletconnect, fortmatic, ledger } from './connectors'
import Modal from '../modal'

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

  svg {
    font-size: 64px;
  }

  &:hover {
    cursor: pointer;
    border: 1px solid #ccc;
  }
`

const WALLET_VIEW = {
  PENDING: 'PENDING',
  ERROR: 'ERROR',
  SELECTION: 'SELECTION',
}

const WalletSelection = () => {
  const [view, setView] = useState(WALLET_VIEW.SELECTION)
  const { activate } = useEthers()

  const onError = (e: any) => {
    setView(WALLET_VIEW.ERROR)
  }

  // Tries to connect to the specified wallet
  const handleWalletSelection = async (connector: AbstractConnector) => {
    setView(WALLET_VIEW.PENDING)
    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (
      connector instanceof WalletConnectConnector &&
      connector.walletConnectProvider?.wc?.uri
    ) {
      connector.walletConnectProvider = undefined
    }

    activate(connector, onError)
  }

  if (view === WALLET_VIEW.PENDING) {
    return <Box>Pending connection...</Box>
  }

  return (
    <>
      {view === WALLET_VIEW.ERROR && (
        <Box sx={{ textAlign: 'center', color: '#DC3644' }} mb={3}>
          <Text>Oops, something went wrong while connecting to the wallet</Text>
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
        }}
      >
        <WalletButton onClick={() => handleWalletSelection(injected)}>
          <MetamaskIcon /> Metamask
        </WalletButton>
        <WalletButton onClick={() => handleWalletSelection(walletconnect)}>
          <WalletConnectIcon />
          WalletConnect
        </WalletButton>
        <WalletButton onClick={() => handleWalletSelection(fortmatic)}>
          <FortmaticIcon />
          Fortmatic
        </WalletButton>
      </Box>
    </>
  )
}

const Title = styled(Text)`
  display: block;
  font-weight: 500;
`

const UserWallet = ({
  account,
  onChange,
}: {
  account: string
  onChange(): void
}) => (
  <>
    <Box>
      <Title>Connected address</Title>
      <Flex
        mt={2}
        pl={3}
        sx={{ border: '1px solid #ccc', borderRadius: 8, alignItems: 'center' }}
      >
        {account}
        <Button sx={{ marginLeft: 'auto' }} onClick={onChange}>
          Change
        </Button>
      </Flex>
    </Box>
    <Box mt={3}>
      <Title mb={2}>Recent transactions</Title>
      <Transactions />
    </Box>
  </>
)

const WalletModal = ({ onClose }: { onClose(): void }) => {
  const { account, deactivate } = useEthers()
  const prevAccount = useRef(account)

  const handleChangeWallet = () => {
    // prevents walletconnect to connect to previous wallet
    localStorage.removeItem('walletconnect')
    deactivate()
  }

  useEffect(() => {
    if (account && account !== prevAccount.current) {
      onClose()
    }
  }, [account])

  return (
    <Modal
      open
      onClose={onClose}
      title={!account ? 'Wallet connection' : 'Account'}
    >
      {account ? (
        <UserWallet account={account} onChange={handleChangeWallet} />
      ) : (
        <WalletSelection />
      )}
    </Modal>
  )
}

export default WalletModal
