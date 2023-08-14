import { CollateralPlugin } from 'types'
import { ChainId } from 'utils/chains'
import goerliPlugins from './goerli'
import mainnetPlugins from './mainnet'

const collateralPlugins: { [chainId: number]: CollateralPlugin[] } = {
  [ChainId.Mainnet]: mainnetPlugins,
  [ChainId.Tenderly]: mainnetPlugins,
  [ChainId.Goerli]: goerliPlugins,
}

export default collateralPlugins
