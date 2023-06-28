import { CHAIN_ID, ChainId } from './../../utils/chains'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { Connector } from '@web3-react/types'
import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2'
import { URLS } from 'utils/chains'

export const CONNECTOR_TYPES = {
  metamask: 'metamask',
  walletConnect: 'walletConnect',
  coinbase: 'coinbase',
  network: 'network',
  gnosis: 'gnosis',
}

export type WalletConnector = MetaMask | WalletConnectV2 | CoinbaseWallet

export function getConnectorType(connector: Connector) {
  if (connector instanceof MetaMask) return CONNECTOR_TYPES.metamask
  if (connector instanceof WalletConnectV2) return CONNECTOR_TYPES.walletConnect
  if (connector instanceof CoinbaseWallet) return CONNECTOR_TYPES.coinbase
  if (connector instanceof Network) return CONNECTOR_TYPES.network
  return 'Unknown'
}

export const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
)

export const [network, networkHooks] = initializeConnector<Network>(
  (actions) => new Network({ actions, urlMap: URLS, defaultChainId: CHAIN_ID })
)

export const [walletConnect, walletConnectHooks] =
  initializeConnector<WalletConnectV2>(
    (actions) =>
      new WalletConnectV2({
        actions,
        options: {
          projectId: 'd28805a208cd2a52707fc6fa0d8f3dd5',
          chains: [ChainId.Mainnet],
          showQrModal: true,
        },
      })
  )

export const [coinbaseWallet, coinbaseWalletHooks] =
  initializeConnector<CoinbaseWallet>(
    (actions) =>
      new CoinbaseWallet({
        actions,
        options: {
          url: URLS[1][0],
          appName: 'Register',
        },
      })
  )

const connectors: [Connector, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  [network, networkHooks],
]

// export an array of available connectors
export default connectors
