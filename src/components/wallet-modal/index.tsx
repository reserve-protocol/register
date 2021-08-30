import { useEthers } from '@usedapp/core'
import { Modal } from '@shopify/polaris'
import { injected, walletconnect, fortmatic } from './connectors'

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

const WalletModal = () => {
  const { activate } = useEthers()

  // Tries to connect to the specified wallet
  const handleWalletSelection = () => {
    activate(injected)
  }

  return (
    <Modal open onClose={() => {}} title="Wallet connection">
      <button type="button" onClick={handleWalletSelection}>
        Connect to metamask
      </button>
      <button type="button" onClick={() => activate(walletconnect)}>
        Connect using wallet connector
      </button>
      <button type="button" onClick={() => activate(fortmatic)}>
        Connect using fortmatic
      </button>
    </Modal>
  )
}

export default WalletModal
