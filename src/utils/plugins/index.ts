import { CollateralPlugin } from 'types'
import { ChainId, CHAIN_ID } from 'utils/chains'
import goerliPlugins from './goerli'
import mainnetPlugins from './mainnet'

const collateralPlugins: { [chainId: number]: CollateralPlugin[] } = {
  [ChainId.Mainnet]: mainnetPlugins,
  [ChainId.Goerli]: goerliPlugins,
}

export default collateralPlugins[CHAIN_ID] || []
