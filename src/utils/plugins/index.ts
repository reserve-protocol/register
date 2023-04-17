import { CollateralPlugin, StringMap } from 'types'
import { STAKE_AAVE_ADDRESS } from 'utils/addresses'
import { ChainId, CHAIN_ID } from 'utils/chains'
import goerliPlugins from './goerli'
import mainnetPlugins from './mainnet'

export const collateralPlugins: { [chainId: number]: CollateralPlugin[] } = {
  [ChainId.Mainnet]: mainnetPlugins,
  [ChainId.Goerli]: goerliPlugins,
}

const plugins = collateralPlugins[CHAIN_ID] || []

export const aavePlugins = plugins.filter(
  (p) => p.rewardToken.indexOf(STAKE_AAVE_ADDRESS[CHAIN_ID]) !== -1
)
// Generate a new object with lowerCase symbols for easy getters
export const pluginAddresses = plugins.reduce((acc, plugin) => {
  acc[plugin.symbol.toLowerCase()] = plugin.address
  return acc
}, {} as StringMap)

export default plugins
