import { CHAIN_ID } from './../../utils/chains'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { URLS } from 'utils/chains'

export const CONNECTOR_TYPES = {
  metamask: 'metamask',
  walletConnect: 'walletConnect',
  coinbase: 'coinbase',
  network: 'network',
  gnosis: 'gnosis',
}

export type WalletConnector =
  | MetaMask
  | WalletConnect
  | CoinbaseWallet

export function getConnectorType(connector: Connector) {
  if (connector instanceof MetaMask) return CONNECTOR_TYPES.metamask
  if (connector instanceof WalletConnect) return CONNECTOR_TYPES.walletConnect
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
  initializeConnector<WalletConnect>(
    (actions) =>
      new WalletConnect({
        actions,
        options: {
          rpc: URLS,
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
