import { ChainId } from './chains'

export const ETHERSCAN_NAMES: { [chainId: number]: string } = {
  [ChainId.Mainnet]: 'etherscan',
  [ChainId.Base]: 'basescan',
  [ChainId.Arbitrum]: 'arbiscan',
}

const ETHERSCAN_PREFIXES: { [chainId: number]: string } = {
  [ChainId.Mainnet]:
    import.meta.env.VITE_MAINNET_EXPLORER ??
    `${ETHERSCAN_NAMES[ChainId.Mainnet]}.io`,
  [ChainId.Base]: `${ETHERSCAN_NAMES[ChainId.Base]}.org`,
  [ChainId.Arbitrum]: `${ETHERSCAN_NAMES[ChainId.Arbitrum]}.io`,
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
export function getExplorerLink(
  data: string,
  chainId: number,
  type: ExplorerDataType
): string {
  const prefix = `https://${ETHERSCAN_PREFIXES[chainId] ?? 'etherscan.io'}`

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
