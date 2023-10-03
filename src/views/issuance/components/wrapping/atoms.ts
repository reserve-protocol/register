import { atom } from 'jotai'
import { chainIdAtom, rTokenAssetsAtom, rTokenAtom } from 'state/atoms'
import { CollateralPlugin, ProtocolKey, StringMap } from 'types'
import collateralPlugins from 'utils/plugins'

const protocolLabels: StringMap = {
  AAVE: 'Aave V2 Tokens',
  MORPHO: 'Morpho (Aave) Tokens',
  COMP: 'Compound V2 Tokens',
  FLUX: 'FLUX Tokens',
  COMPv3: 'Compound V3 Tokens',
  CONVEX: 'Curve Convex LP Tokens',
  CURVE: 'Curve LP Tokens',
  SDR: 'Savings DAI',
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
    // check if rToken is on the plugin list
    if (plugins[collateral.symbol]) {
      // Extend the plugin info
      // Only addresses for asset/erc20 could be different and are taken from the collateral
      acc.push({
        ...plugins[collateral.symbol],
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
