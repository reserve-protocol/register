import { CollateralPlugin, ProtocolKey, StringMap } from 'types'
import { ChainId } from 'utils/chains'
// @ts-ignore
import basePlugins from './data/base.json'
// @ts-ignore
import arbitrumPlugins from './data/arbitrum.json'
// @ts-ignore
import mainnetPlugins from './data/mainnet.json'
import { Address } from 'viem'
import {
  ARB_ADDRESS,
  COMP_ADDRESS,
  CRV_ADDRESS,
  CVX_ADDRESS,
  STAKE_AAVE_ADDRESS,
  STG_ADDRESS,
} from 'utils/addresses'

const collateralPlugins: { [chainId: number]: CollateralPlugin[] } = {
  [ChainId.Mainnet]: mainnetPlugins,
  [ChainId.Base]: basePlugins,
  [ChainId.Arbitrum]: arbitrumPlugins,
}

export const rewardsByProtocol: { [x: Address]: ProtocolKey[] } = {
  [STAKE_AAVE_ADDRESS[ChainId.Mainnet]]: ['AAVE', 'AAVEv3'],
  [COMP_ADDRESS[ChainId.Mainnet]]: ['COMP', 'COMPv3'],
  [CRV_ADDRESS[ChainId.Mainnet]]: ['CURVE', 'CONVEX'],
  [CVX_ADDRESS[ChainId.Mainnet]]: ['CONVEX'],
  [COMP_ADDRESS[ChainId.Base]]: ['COMP', 'COMPv3'],
  [STG_ADDRESS[ChainId.Base]]: ['STARGATE'],
  [ARB_ADDRESS[ChainId.Arbitrum]]: ['AAVEv3'],
  [COMP_ADDRESS[ChainId.Arbitrum]]: ['COMPv3'],
}

const collateralToProtocol = (acc: StringMap, curr: CollateralPlugin) => {
  return {
    ...acc,
    [curr.symbol]: curr.protocol,
  }
}

export const collateralsProtocolMap: {
  [chainId: number]: { [x: string]: ProtocolKey }
} = {
  [ChainId.Mainnet]: collateralPlugins[ChainId.Mainnet].reduce(
    collateralToProtocol,
    {}
  ),
  [ChainId.Base]: collateralPlugins[ChainId.Base].reduce(
    collateralToProtocol,
    {}
  ),
  [ChainId.Arbitrum]: collateralPlugins[ChainId.Arbitrum].reduce(
    collateralToProtocol,
    {}
  ),
}

export const collateralsMap = Object.keys(collateralPlugins).reduce(
  (acc, chain) => {
    const chainId = Number(chain)
    if (!acc[chainId]) {
      acc[chainId] = {}
    }

    return {
      ...acc,
      [chain]: collateralPlugins[chainId].reduce((acc, plugin) => {
        return {
          ...acc,
          [plugin.address]: plugin,
        }
      }),
    }
  },
  {} as { [chainId: number]: Record<string, CollateralPlugin> }
)

export default collateralPlugins
