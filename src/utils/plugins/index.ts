import { CollateralPlugin } from 'types'
import { ChainId } from 'utils/chains'
// @ts-ignore
import basePlugins from './data/base.json'
// @ts-ignore
import mainnetPlugins from './data/mainnet.json'

const collateralPlugins: { [chainId: number]: CollateralPlugin[] } = {
  [ChainId.Mainnet]: mainnetPlugins,
  [ChainId.Base]: basePlugins,
  [ChainId.Hardhat]: mainnetPlugins, // Mainnet fork
}

export default collateralPlugins
