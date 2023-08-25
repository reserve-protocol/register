import { CollateralPlugin } from 'types'
import { ChainId } from 'utils/chains'
import goerliPlugins from './goerli'
import baseGoerliPlugins from './baseGoerli'
import mainnetPlugins from './mainnet'

const collateralPlugins: { [chainId: number]: CollateralPlugin[] } = {
  [ChainId.Mainnet]: mainnetPlugins,
  [ChainId.Tenderly]: mainnetPlugins, // Mainnet fork
  [ChainId.Hardhat]: mainnetPlugins, // Mainnet fork
  [ChainId.Goerli]: goerliPlugins,
  [ChainId.BaseGoerli]: baseGoerliPlugins,
}

export default collateralPlugins
