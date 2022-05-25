import { ChainId, CHAIN_ID } from './chains'

const ETHERSCAN_PREFIXES: { [chainId: number]: string } = {
  [ChainId.Mainnet]: '',
  [ChainId.Hardhat]: '',
}

export enum ExplorerDataType {
  TRANSACTION = 'transaction',
  TOKEN = 'token',
  ADDRESS = 'address',
  BLOCK = 'block',
}

/**
 * Return the explorer link for the given data and data type
 * @param chainId the ID of the chain for which to return the data
 * @param data the data to return a link for
 * @param type the type of the data
 */
export function getExplorerLink(data: string, type: ExplorerDataType): string {
  const prefix = `https://${ETHERSCAN_PREFIXES[CHAIN_ID] ?? ''}etherscan.io`

  switch (type) {
    case ExplorerDataType.TRANSACTION:
      return `${prefix}/tx/${data}`

    case ExplorerDataType.TOKEN:
      return `${prefix}/token/${data}`

    case ExplorerDataType.BLOCK:
      return `${prefix}/block/${data}`

    case ExplorerDataType.ADDRESS:
      return `${prefix}/address/${data}`
    default:
      return `${prefix}`
  }
}
