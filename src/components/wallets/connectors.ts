import { CHAINS, URLS, CHAIN_ID } from 'utils/chains'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { Network } from '@web3-react/network'
import { MetaMask } from '@web3-react/metamask'
import { WalletConnect } from '@web3-react/walletconnect'

const chains: number[] = Object.keys(CHAINS).map((chainId) => Number(chainId))

export const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask(actions, true)
)

export const [network, networkHooks] = initializeConnector<Network>(
  (actions) => new Network(actions, URLS, true, CHAIN_ID),
  chains
)

export const [walletConnect, walletConnectHooks] =
  initializeConnector<WalletConnect>(
    (actions) =>
      new WalletConnect(actions, {
        rpc: URLS,
      }),
    chains
  )

export const [coinbaseWallet, coinbaseWalletHooks] =
  initializeConnector<CoinbaseWallet>(
    (actions) =>
      new CoinbaseWallet(actions, {
        url: URLS[1][0],
        appName: 'Register',
      })
  )

export type Connector = [
  MetaMask | WalletConnect | CoinbaseWallet | Network,
  Web3ReactHooks
]

const connectors: Connector[] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  [network, networkHooks],
]

// export an array of available connectors
export default connectors
