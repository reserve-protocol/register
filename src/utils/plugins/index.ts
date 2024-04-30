import { CollateralPlugin, ProtocolKey, StringMap } from 'types'
import { ChainId } from 'utils/chains'
// @ts-ignore
import basePlugins from './data/base.json'
// @ts-ignore
import mainnetPlugins from './data/mainnet.json'
import { Address } from 'viem'
import {
  COMP_ADDRESS,
  CRV_ADDRESS,
  CVX_ADDRESS,
  STAKE_AAVE_ADDRESS,
  STG_ADDRESS,
} from 'utils/addresses'

const collateralPlugins: { [chainId: number]: CollateralPlugin[] } = {
  [ChainId.Mainnet]: mainnetPlugins,
  [ChainId.Base]: basePlugins,
  [ChainId.Hardhat]: mainnetPlugins, // Mainnet fork
}

export const rewardsByProtocol: { [x: Address]: ProtocolKey[] } = {
  [STAKE_AAVE_ADDRESS[ChainId.Mainnet]]: ['AAVE', 'AAVEv3'],
  [COMP_ADDRESS[ChainId.Mainnet]]: ['COMP', 'COMPv3'],
  [CRV_ADDRESS[ChainId.Mainnet]]: ['CURVE', 'CONVEX'],
  [CVX_ADDRESS[ChainId.Mainnet]]: ['CONVEX'],
  [COMP_ADDRESS[ChainId.Base]]: ['COMP', 'COMPv3'],
  [STG_ADDRESS[ChainId.Base]]: ['STARGATE'],
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
}

export default collateralPlugins
