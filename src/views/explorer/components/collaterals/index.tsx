import { createColumnHelper } from '@tanstack/react-table'
import { Button } from 'components'
import BasketCubeIcon from 'components/icons/BasketCubeIcon'
import ChainLogo from 'components/icons/ChainLogo'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { Table } from 'components/table'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { collateralYieldAtom } from 'state/atoms'
import CollateralYieldUpdater from 'state/updaters/CollateralYieldUpdater'
import { Box, Flex, Link, Text } from 'theme-ui'
import { CollateralPlugin } from 'types'
import { formatCurrency, formatPercentage, parseDuration } from 'utils'
import { atomWithLoadable } from 'utils/atoms/utils'
import {
  CHAIN_TAGS,
  DISCORD_INVITE,
  REGISTER_FEEDBACK,
  supportedChainList,
} from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import collateralPlugins from 'utils/plugins'
import { formatUnits } from 'viem'
import DeployHero from 'views/compare/components/DeployHero'
import { readContracts } from 'wagmi/actions'
import { erc20Abi } from 'viem'
import { wagmiConfig } from 'state/chain'
import { AvailableChain } from 'utils/chains'

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
        collateralYield[chainId]?.[
          plugin.symbol.toLowerCase().replace('-vault', '')
        ] ?? 0,
      supply: 0,
      chainId,
    }))
  )

  const supplies = await readContracts(wagmiConfig, {
    allowFailure: false,
    contracts: pluginsMap.map((plugin) => ({
      abi: erc20Abi,
      chainId: plugin.chainId as AvailableChain,
      address: plugin.underlyingAddress || plugin.erc20,
      functionName: 'totalSupply',
    })),
  })

  return pluginsMap.map((plugin, index) => ({
    ...plugin,
    supply: formatUnits(supplies[index] as bigint, plugin.decimals),
  }))
})

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
      sx={{ borderRadius: '0 0 20px 20px' }}
      compact
      data={data}
      columns={columns}
    />
  )
}

const Collaterals = () => {
  return (
    <Box my={[3, 5]} mx={[2, 3]}>
      <CollateralYieldUpdater />
      <Box
        variant="layout.verticalAlign"
        sx={{ gap: 2, flexWrap: 'wrap' }}
        mb={[3, 5]}
      >
        <BasketCubeIcon fontSize={32} />
        <Text as="h2" variant="title" mr="auto" sx={{ fontSize: 4 }}>
          Available Collaterals
        </Text>
        <Flex sx={{ gap: 2, ml: 2, display: ['none', 'flex'] }}>
          <Button
            small
            variant="bordered"
            onClick={() => window.open(REGISTER_FEEDBACK, '_blank')}
          >
            Request plugin
          </Button>
          <Button
            small
            variant="bordered"
            onClick={() => window.open(DISCORD_INVITE, '_blank')}
          >
            Discuss on discord
          </Button>
        </Flex>
      </Box>
      <PluginList />
      <DeployHero mt={4} />
    </Box>
  )
}

export default Collaterals
