import { atom } from 'jotai'
import { chainIdAtom, rTokenAssetsAtom, rTokenAtom } from 'state/atoms'
import { CollateralPlugin, ProtocolKey, StringMap } from 'types'
import collateralPlugins from 'utils/plugins'

const protocolLabels: StringMap = {
  AAVE: 'Aave V2 Tokens',
  AAVEv3: 'Aave V3 Tokens',
  MORPHO: 'Morpho (Aave) Tokens',
  COMP: 'Compound V2 Tokens',
  FLUX: 'FLUX Tokens',
  COMPv3: 'Compound V3 Tokens',
  CONVEX: 'Curve Convex LP Tokens',
  CURVE: 'Curve LP Tokens',
  SDR: 'Savings DAI',
  STARGATE: 'Stargate Tokens',
  USDM: 'Mountain Protocol',
}

// TODO: Remove when this collaterals are swapped from current listed RTokens
const removedCollaterals: Record<string, CollateralPlugin> = {
  wcusdbcv3: {
    address: '0xd3025304C6487FC5c39010bEA0B46cc0690ab229',
    rewardTokens: ['0x277FD5f51fE53a9B3707a0383bF930B149C74ABf'],
    protocol: 'COMPv3',
    erc20: '0xa8d818C719c1034E731Feba2088F4F011D44ACB3',
    chainlinkFeed: '0x7e860098F58bBFC8648a4311b374B1D669a2bc6B',
    delayUntilDefault: '86400',
    maxTradeVolume: '1000000',
    oracleTimeout: 86460,
    targetName: 'USD',
    version: '3.0.1',
    symbol: 'wcUSDbCv3',
    decimals: 6,
    underlyingAddress: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf',
    underlyingToken: 'cUSDbCv3',
  },
  'mrp-aUSDC': {
    address: '0x2304E98cD1E2F0fd3b4E30A1Bc6E9594dE2ea9b7',
    rewardTokens: [],
    protocol: 'MORPHO',
    erc20: '0x7f7B77e49d5b30445f222764a794AFE14af062eB',
    chainlinkFeed: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
    delayUntilDefault: '86400',
    maxTradeVolume: '1000000',
    oracleTimeout: 86460,
    targetName: 'USD',
    version: '3.0.0',
    symbol: 'mrp-aUSDC',
    decimals: 15,
    underlyingAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    underlyingToken: 'USDC',
    collateralAddress: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
    collateralToken: 'aUSDC',
  },
  saBasUSDbC: {
    address: '0x1DdB7dfdC5D26FE1f2aD02d9972f12481346Ae9b',
    rewardTokens: [],
    protocol: 'AAVEv3',
    erc20: '0x308447562442Cc43978f8274fA722C9C14BafF8b',
    chainlinkFeed: '0x7e860098F58bBFC8648a4311b374B1D669a2bc6B',
    delayUntilDefault: '86400',
    maxTradeVolume: '1000000',
    oracleTimeout: 86460,
    targetName: 'USD',
    version: '3.0.0',
    symbol: 'saBasUSDbC',
    decimals: 6,
    underlyingAddress: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    underlyingToken: 'USDbC',
    collateralAddress: '0x0a1d576f3eFeF75b330424287a95A366e8281D54',
    collateralToken: 'aBasUSDbC',
  },
  wsgUSDbC: {
    address: '0x15395aCCbF8c6b28671fe41624D599624709a2D6',
    rewardTokens: ['0xf37adF141BD754e9C9E645de88bB28B5e4a6Db96'],
    protocol: 'STARGATE',
    erc20: '0x073F98792ef4c00bB5f11B1F64f13cB25Cde0d8D',
    chainlinkFeed: '0x7e860098F58bBFC8648a4311b374B1D669a2bc6B',
    delayUntilDefault: '86400',
    maxTradeVolume: '1000000',
    oracleTimeout: 86460,
    targetName: 'USD',
    version: '3.0.0',
    symbol: 'wsgUSDbC',
    decimals: 6,
    underlyingAddress: '0x4c80E24119CFB836cdF0a6b53dc23F04F7e652CA',
    underlyingToken: 'S*USDbC',
  },
}

// Just true or false for now, if you want to display all collaterals = false
export const pluginsDisplayModeAtom = atom(true)
export const isWrappingAtom = atom(true)

// Filter collaterals and create a map base on symbol
const wrapableCollateralsAtom = atom((get) => {
  const chainId = get(chainIdAtom)
  const plugins: { [x: string]: CollateralPlugin } = {}

  for (const c of collateralPlugins[chainId]) {
    if (c.protocol !== 'GENERIC') {
      plugins[c.symbol] = c
    }
  }

  return plugins
})

// Filter and map collateral tokens with plugins for wrapping
export const collateralsPerRTokenAtom = atom<CollateralPlugin[]>((get) => {
  const rToken = get(rTokenAtom)
  const assets = get(rTokenAssetsAtom)
  const plugins = get(wrapableCollateralsAtom)
  const rTokenPlugins: CollateralPlugin[] = []

  if (!rToken || !assets) {
    return rTokenPlugins
  }

  // TODO: USDC+ on mainnet, remove when old flux plugins are swapped from the basket
  if (rToken.address === '0xFc0B1EEf20e4c68B3DCF36c4537Cfa7Ce46CA70b') {
    rTokenPlugins.push({
      address: '0x1FFA5955D64Ee32cB1BF7104167b81bb085b0c8d',
      erc20: '0x6D05CB2CB647B58189FA16f81784C05B4bcd4fe9',
      chainlinkFeed: '0x',
      delayUntilDefault: '86400',
      maxTradeVolume: '1000000',
      oracleTimeout: 3660,
      targetName: 'USD',
      version: '3.0.0',
      symbol: 'fUSDC-VAULT',
      decimals: 18,
      protocol: 'FLUX',
      underlyingAddress: '0x465a5a630482f3abD6d3b84B39B29b07214d19e5',
      underlyingToken: 'fUSDC',
      rewardTokens: [],
    })
  }

  return rToken.collaterals.reduce((acc, collateral) => {
    const plugin =
      plugins[collateral.symbol] || removedCollaterals[collateral.symbol]

    // check if rToken is on the plugin list
    if (plugin) {
      // Extend the plugin info
      // Only addresses for asset/erc20 could be different and are taken from the collateral
      acc.push({
        ...plugin,
        address: assets[collateral.address].address,
        erc20: collateral.address,
      })
    }

    return acc
  }, rTokenPlugins)
})

export const collateralsByProtocolAtom = atom((get) => {
  const plugins = get(pluginsDisplayModeAtom)
    ? get(collateralsPerRTokenAtom)
    : Object.values(get(wrapableCollateralsAtom))

  return plugins.reduce<{ [x: string]: CollateralPlugin[] }>((acc, plugin) => {
    if (acc[protocolLabels[plugin.protocol]]) {
      acc[protocolLabels[plugin.protocol]].push(plugin)
    } else {
      acc[protocolLabels[plugin.protocol]] = [plugin]
    }

    return acc
  }, {})
})
