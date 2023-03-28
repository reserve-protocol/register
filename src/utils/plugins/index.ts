import { CollateralPlugin, StringMap } from 'types'
import { ChainId, CHAIN_ID } from 'utils/chains'
import goerliPlugins from './goerli'
import mainnetPlugins from './mainnet'

export const collateralPlugins: { [chainId: number]: CollateralPlugin[] } = {
  [ChainId.Mainnet]: mainnetPlugins,
  [ChainId.Goerli]: goerliPlugins,
}

const plugins = collateralPlugins[CHAIN_ID] || []

// Generate a new object with lowerCase symbols for easy getters
export const pluginAddresses = plugins.reduce((acc, plugin) => {
  acc[plugin.symbol.toLowerCase()] = plugin.address
  return acc
}, {} as StringMap)

export default plugins
