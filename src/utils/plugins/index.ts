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
  AERO_ADDRESS,
  ARB_ADDRESS,
  COMP_ADDRESS,
  CRV_ADDRESS,
  CVX_ADDRESS,
  STAKE_AAVE_ADDRESS,
  STG_ADDRESS,
} from 'utils/addresses'

const unsupportedCollaterals = [
  {
    address: '0x05F164E71C46a8f8FB2ba71550a00eeC9FCd85cd',
    rewardTokens: [
      '0xc18bF46F178F7e90b9CD8b7A8b00Af026D5ce3D3',
      '0x7ef93b20C10E6662931b32Dd9D4b85861eB2E4b8',
    ],
    protocol: 'CONVEX',
    erc20: '0xDbC0cE2321B76D3956412B36e9c0FA9B0fD176E7',
    chainlinkFeed: '0x0000000000000000000000000000000000000001',
    delayUntilDefault: '259200',
    maxTradeVolume: '1000000',
    oracleTimeout: 1,
    targetName: 'ETH',
    version: '3.4.0',
    symbol: 'stkcvxETH+ETH-f',
    decimals: 18,
    underlyingAddress: '0xe8a5677171c87fCB65b76957f2852515B404C7b1',
    underlyingToken: 'ETH+ETH-f',
  },
]

const collateralPlugins: { [chainId: number]: CollateralPlugin[] } = {
  [ChainId.Mainnet]: [
    ...mainnetPlugins,
    ...unsupportedCollaterals,
  ] as CollateralPlugin[],
  [ChainId.Base]: basePlugins as CollateralPlugin[],
  [ChainId.Arbitrum]: arbitrumPlugins as CollateralPlugin[],
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
  [AERO_ADDRESS[ChainId.Base]]: ['AERODROME'],
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
          [plugin.erc20]: plugin,
        }
      }),
    }
  },
  {} as { [chainId: number]: Record<string, CollateralPlugin> }
)

export default collateralPlugins
