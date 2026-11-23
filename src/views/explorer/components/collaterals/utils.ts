import { formatUnits } from 'viem'

const PROTOCOL_LABELS: Record<string, string> = {
  AAVE: 'Aave',
  AAVEv3: 'Aave V3',
  AERODROME: 'Aerodrome',
  COMP: 'Compound',
  COMPv3: 'Compound V3',
  CONVEX: 'Convex',
  ETHERFI: 'Ether.fi',
  GENERIC: 'Generic',
  MORPHO: 'Morpho',
  MORPHOV2: 'Morpho V2',
  ORIGIN: 'Origin',
  PXETH: 'pxETH',
  SKY: 'Sky',
}

export const getProtocolLabel = (protocol: string) =>
  PROTOCOL_LABELS[protocol] ?? protocol

export type SupplyRead<T> =
  | { status: 'success'; result: T }
  | { status: 'failure' }

// The supply is read from the underlying token when there is one, so it takes that token's decimals, not the plugin's.
export const getSupply = (
  supply: SupplyRead<bigint>,
  decimals: SupplyRead<number>
): number | null =>
  supply.status === 'success' && decimals.status === 'success'
    ? +formatUnits(supply.result, decimals.result)
    : null

type FilterablePlugin = {
  symbol: string
  underlyingToken?: string
  chainId: number
  protocol: string
  targetName: string
}

export type CollateralFilters = {
  search: string
  chains: string[]
  protocols: string[]
  targets: string[]
}

// An empty selection means "all" for every list.
export const filterCollaterals = <T extends FilterablePlugin>(
  plugins: T[],
  { search, chains, protocols, targets }: CollateralFilters
) => {
  const query = search.trim().toLowerCase()

  return plugins.filter(
    (plugin) =>
      (!chains.length || chains.includes(plugin.chainId.toString())) &&
      (!protocols.length || protocols.includes(plugin.protocol)) &&
      (!targets.length || targets.includes(plugin.targetName)) &&
      (!query ||
        plugin.symbol.toLowerCase().includes(query) ||
        !!plugin.underlyingToken?.toLowerCase().includes(query))
  )
}
