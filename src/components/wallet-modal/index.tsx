import { useEthers } from '@usedapp/core'
import { Box } from 'theme-ui'
import styled from '@emotion/styled'
import MetamaskIcon from 'components/icons/logos/Metamask'
import WalletConnectIcon from 'components/icons/logos/WalletConnect'
import FortmaticIcon from 'components/icons/logos/Fortmatic'
import LedgerIcon from 'components/icons/logos/Ledger'
import { injected, walletconnect, fortmatic } from './connectors'
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

// const SupportedChainId = {
//   MAINNET: 1,
//   ROPSTEN: 3,
//   RINKEBY: 4,
//   GOERLI: 5,
//   KOVAN: 42,
//   ARBITRUM_ONE: 42161,
//   ARBITRUM_RINKEBY: 421611,
//   OPTIMISM: 10,
//   OPTIMISTIC_KOVAN: 69,
// }

const onError = (e: any) => {
  console.log('ERROR', e)
}

const WalletModal = ({ onClose }: { onClose(): void }) => {
  const { activate } = useEthers()

  // Tries to connect to the specified wallet
  const handleWalletSelection = async () => {
    await activate(injected, onError)
  }

  return (
    <Modal open onClose={onClose} title="Wallet connection">
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
        }}
      >
        <WalletButton onClick={handleWalletSelection}>
          <MetamaskIcon /> Metamask
        </WalletButton>
        <WalletButton onClick={() => activate(walletconnect)}>
          <WalletConnectIcon />
          WalletConnect
        </WalletButton>
        <WalletButton onClick={() => activate(fortmatic)}>
          <FortmaticIcon />
          Fortmatic
        </WalletButton>
        <WalletButton onClick={() => activate(fortmatic)}>
          <LedgerIcon />
          Ledger
        </WalletButton>
      </Box>
    </Modal>
  )
}

export default WalletModal
