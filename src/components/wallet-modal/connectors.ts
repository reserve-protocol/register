import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { TrezorConnector } from '@web3-react/trezor-connector'
import { FortmaticConnector } from '@web3-react/fortmatic-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'

// TODO: Update node URLs
const keys = {
  RPC_URL_1: 'https://mainnet.infura.io/v3/84842078b09946638c03157f83405213',
  RPC_URL_3: 'https://rinkeby.infura.io/v3/84842078b09946638c03157f83405213',
  FORTMATIC_API_KEY: 'pk_test_A6260FCBAA2EBDFB',
  MAGIC_API_KEY: 'pk_test_398B82F5F0E88874',
  PORTIS_DAPP_ID: 'e9be171c-2b7f-4ff0-8db9-327707511ee2',
}

const POLLING_INTERVAL = 12000
const RPC_URLS = {
  1: keys.RPC_URL_1,
  3: keys.RPC_URL_3,
}

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 31337],
})

export const network = new NetworkConnector({
  urls: { 1: RPC_URLS[1], 3: RPC_URLS[3] },
  defaultChainId: 1,
})

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1], 3: RPC_URLS[3] },
  qrcode: true,
  pollingInterval: POLLING_INTERVAL,
})

export const fortmatic = new FortmaticConnector({
  apiKey: 'pk_test_29814A316CEDFCF7',
  chainId: 1,
})

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appName: 'reserve explorer',
  supportedChainIds: [1, 3, 31337],
})

export const trezor = new TrezorConnector({
  chainId: 1,
  url: RPC_URLS[1],
  pollingInterval: POLLING_INTERVAL,
  // TODO: Update with real information
  manifestEmail: 'dummy@abc.xyz',
  manifestAppUrl: 'http://localhost:1234',
})
