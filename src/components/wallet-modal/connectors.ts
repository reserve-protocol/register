import { ChainId } from '@usedapp/core'
import { FortmaticConnector } from '@web3-react/fortmatic-connector'
import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { TrezorConnector } from '@web3-react/trezor-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { CHAIN_ID } from '../../constants'

// TODO: Update node URLs
const keys = {
  RPC_URL: 'http://localhost:8545',
  FORTMATIC_API_KEY: 'pk_test_A6260FCBAA2EBDFB',
  MAGIC_API_KEY: 'pk_test_398B82F5F0E88874',
  PORTIS_DAPP_ID: 'e9be171c-2b7f-4ff0-8db9-327707511ee2',
}

const POLLING_INTERVAL = 12000

export const injected = new InjectedConnector({
  supportedChainIds: [ChainId.Mainnet, CHAIN_ID],
})

export const network = new NetworkConnector({
  urls: { [ChainId.Mainnet]: keys.RPC_URL },
  defaultChainId: ChainId.Mainnet,
})

export const walletconnect = new WalletConnectConnector({
  rpc: { [ChainId.Mainnet]: keys.RPC_URL },
  qrcode: true,
  pollingInterval: POLLING_INTERVAL,
})

export const fortmatic = new FortmaticConnector({
  apiKey: 'pk_test_29814A316CEDFCF7',
  chainId: ChainId.Mainnet,
})

export const walletlink = new WalletLinkConnector({
  url: keys.RPC_URL,
  appName: 'reserve explorer',
  supportedChainIds: [ChainId.Mainnet],
})

export const trezor = new TrezorConnector({
  chainId: ChainId.Mainnet,
  url: keys.RPC_URL,
  pollingInterval: POLLING_INTERVAL,
  // TODO: Update with real information
  manifestEmail: 'dummy@abc.xyz',
  manifestAppUrl: 'http://localhost:1234',
})
