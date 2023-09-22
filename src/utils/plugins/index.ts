import { CollateralPlugin } from 'types'
import { ChainId } from 'utils/chains'
// @ts-ignore
import baseGoerliPlugins from './data/basegoerli.json'
// @ts-ignore
import mainnetPlugins from './data/mainnet.json'

const collateralPlugins: { [chainId: number]: CollateralPlugin[] } = {
  [ChainId.Mainnet]: mainnetPlugins,
  [ChainId.Tenderly]: mainnetPlugins, // Mainnet fork
  [ChainId.Hardhat]: mainnetPlugins, // Mainnet fork
  [ChainId.BaseGoerli]: baseGoerliPlugins,
}

export default collateralPlugins
