import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Connector } from '@web3-react/types'

export const CONNECTOR_TYPES = {
  metamask: 'metamask',
  walletConnect: 'walletConnect',
  coinbase: 'coinbase',
  network: 'network',
  gnosis: 'gnosis',
}

export type WalletConnector = MetaMask

export function getConnectorType(connector: Connector) {
  if (connector instanceof MetaMask) return CONNECTOR_TYPES.metamask
  return 'Unknown'
}

export const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
)

const connectors: [Connector, Web3ReactHooks][] = [[metaMask, metaMaskHooks]]

// export an array of available connectors
export default connectors
