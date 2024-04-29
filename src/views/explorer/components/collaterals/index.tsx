import { createColumnHelper } from '@tanstack/react-table'
import CollateralAbi from 'abis/CollateralAbi'
import ChainLogo from 'components/icons/ChainLogo'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { ContentHead } from 'components/info-box'
import { Table } from 'components/table'
import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { collateralYieldAtom } from 'state/atoms'
import CollateralYieldUpdater from 'state/updaters/CollateralYieldUpdater'
import { Box, Link, Text } from 'theme-ui'
import { Collateral, CollateralPlugin } from 'types'
import { formatCurrency, formatPercentage, parseDuration } from 'utils'
import { atomWithLoadable } from 'utils/atoms/utils'
import { CHAIN_TAGS, supportedChainList } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import collateralPlugins from 'utils/plugins'
import { formatUnits } from 'viem'
import { erc20ABI, readContracts } from 'wagmi'

interface Plugin extends CollateralPlugin {
  apy: number
  chainId: number
  supply: number
}

const allPluginsAtom = atomWithLoadable(async (get) => {
  const collateralYield = get(collateralYieldAtom)
  const pluginsMap: Plugin[] = supportedChainList.flatMap((chainId) =>
    collateralPlugins[chainId].map((plugin) => ({
      ...plugin,
      apy:
        collateralYield[plugin.symbol.toLowerCase().replace('-vault', '')] ?? 0,
      supply: 0,
      chainId,
    }))
  )

  const supplies = await readContracts({
    allowFailure: false,
    contracts: pluginsMap.map((plugin) => ({
      abi: erc20ABI,
      chainId: plugin.chainId,
      address: plugin.underlyingAddress || plugin.erc20,
      functionName: 'totalSupply',
    })),
  })

  return pluginsMap.map((plugin, index) => ({
    ...plugin,
    supply: formatUnits(supplies[index], plugin.decimals),
  }))
})

// export interface CollateralPlugin {
//   symbol: string // collateral symbol
//   address: Address // collateral plugin address
//   erc20: Address // erc20 contract address for asset
//   decimals: number // 6-18
//   targetName: string // USD / EUR / etc
//   rewardTokens: Address[] // yield token aave / compound wrapped Asset
//   underlyingToken?: string
//   underlyingAddress?: Address
//   collateralToken?: string // Yield bearing token for aave
//   collateralAddress?: Address
//   protocol: ProtocolKey
//   version: string
//   custom?: boolean
//   maxTradeVolume: string
//   oracleTimeout: number
//   chainlinkFeed: Address
//   delayUntilDefault: string
// }

const PluginList = () => {
  const columnHelper = createColumnHelper<Plugin>()
  const columns = useMemo(
    () => [
      columnHelper.accessor('chainId', {
        header: 'Network',
        cell: (data) => (
          <Box variant="layout.verticalAlign">
            <ChainLogo chain={data.getValue()} />
            <Text ml="2">{CHAIN_TAGS[data.getValue()]}</Text>
          </Box>
        ),
      }),
      columnHelper.accessor('symbol', {
        header: 'Collateral',
        cell: (data) => {
          return (
            <Link
              href={getExplorerLink(
                data.row.original.address,
                data.row.original.chainId,
                ExplorerDataType.ADDRESS
              )}
              target="_blank"
              sx={{ color: 'text' }}
              variant="layout.verticalAlign"
            >
              <TokenLogo symbol={data.getValue()} />
              <Text variant="bold" mx="2">
                {data.getValue()}
              </Text>
              <ExternalArrowIcon />
            </Link>
          )
        },
      }),
      columnHelper.accessor('underlyingAddress', {
        header: 'Underlying',
        cell: (data) => {
          const address = data.getValue() || data.row.original.erc20

          return address ? (
            <Link
              href={getExplorerLink(
                address,
                data.row.original.chainId,
                ExplorerDataType.ADDRESS
              )}
              target="_blank"
              sx={{ color: 'text' }}
              variant="layout.verticalAlign"
            >
              <TokenLogo
                symbol={
                  data.row.original.underlyingToken || data.row.original.symbol
                }
              />
              <Text mx="2">
                {data.row.original.underlyingToken || data.row.original.symbol}
              </Text>
              <ExternalArrowIcon />
            </Link>
          ) : (
            <Text>NA</Text>
          )
        },
      }),
      columnHelper.accessor('targetName', {
        header: 'Target',
      }),
      columnHelper.accessor('protocol', {
        header: 'Protocol',
      }),
      columnHelper.accessor('version', {
        header: 'Version',
      }),
      columnHelper.accessor('maxTradeVolume', {
        header: 'Max trade',
        cell: (data) => (
          <Text>
            {formatCurrency(+data.getValue(), 0, {
              notation: 'compact',
              compactDisplay: 'short',
            })}
          </Text>
        ),
      }),
      columnHelper.accessor('delayUntilDefault', {
        header: 'Default delay',
        cell: (data) => <Text>{parseDuration(+data.getValue())}</Text>,
      }),
      columnHelper.accessor('supply', {
        header: 'Supply',
        cell: (data) => (
          <Text>
            {formatCurrency(+data.getValue(), 0, {
              notation: 'compact',
              compactDisplay: 'short',
            })}
          </Text>
        ),
      }),
      columnHelper.accessor('apy', {
        header: 'APY',
        cell: (data) => <Text>{formatPercentage(data.getValue())}</Text>,
      }),
    ],
    [columnHelper]
  )
  const data = useAtomValue(allPluginsAtom) ?? []

  return (
    <Table
      sorting
      sortBy={[{ id: 'apy', desc: true }]}
      data={data}
      columns={columns}
    />
  )
}

const Collaterals = () => {
  return (
    <Box variant="layout.container">
      <CollateralYieldUpdater />
      <ContentHead
        pl={[3, 4]}
        mb={5}
        title={'Collateral plugins'}
        subtitle="List of all protocol available collateral plugins"
      />
      <PluginList />
    </Box>
  )
}

export default Collaterals
