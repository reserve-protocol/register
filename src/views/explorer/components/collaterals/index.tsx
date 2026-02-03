import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import BasketCubeIcon from 'components/icons/BasketCubeIcon'
import ChainLogo from 'components/icons/ChainLogo'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { Table } from '@/components/ui/legacy-table'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { collateralYieldAtom } from 'state/atoms'
import CollateralYieldUpdater from 'state/updaters/CollateralYieldUpdater'
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
import DeployHero from '@/views/discover/components/yield/components/DeployHero'
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
          <div className="flex items-center">
            <ChainLogo chain={data.getValue()} />
            {/* <span className="ml-2">{CHAIN_TAGS[data.getValue()]}</span> */}
          </div>
        ),
      }),
      columnHelper.accessor('symbol', {
        header: 'Collateral',
        cell: (data) => {
          return (
            <a
              href={getExplorerLink(
                data.row.original.address,
                data.row.original.chainId,
                ExplorerDataType.ADDRESS
              )}
              target="_blank"
              className="flex items-center text-foreground"
            >
              <TokenLogo symbol={data.getValue()} />
              <span className="font-bold mx-2">{data.getValue()}</span>
              <ExternalArrowIcon />
            </a>
          )
        },
      }),
      columnHelper.accessor('underlyingAddress', {
        header: 'Underlying',
        cell: (data) => {
          const address = data.getValue() || data.row.original.erc20

          return address ? (
            <a
              href={getExplorerLink(
                address,
                data.row.original.chainId,
                ExplorerDataType.ADDRESS
              )}
              target="_blank"
              className="flex items-center text-foreground"
            >
              <TokenLogo
                symbol={
                  data.row.original.underlyingToken || data.row.original.symbol
                }
              />
              <span className="mx-2">
                {data.row.original.underlyingToken || data.row.original.symbol}
              </span>
              <ExternalArrowIcon />
            </a>
          ) : (
            <span>NA</span>
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
          <span>
            {formatCurrency(+data.getValue(), 0, {
              notation: 'compact',
              compactDisplay: 'short',
            })}
          </span>
        ),
      }),
      columnHelper.accessor('delayUntilDefault', {
        header: 'Default delay',
        cell: (data) => <span>{parseDuration(+data.getValue())}</span>,
      }),
      columnHelper.accessor('supply', {
        header: 'Supply',
        cell: (data) => (
          <span>
            {formatCurrency(+data.getValue(), 0, {
              notation: 'compact',
              compactDisplay: 'short',
            })}
          </span>
        ),
      }),
      columnHelper.accessor('apy', {
        header: 'APY',
        cell: (data) => <span>{formatPercentage(data.getValue())}</span>,
      }),
    ],
    [columnHelper]
  )
  const data = useAtomValue(allPluginsAtom) ?? []

  return (
    <Table
      sorting
      className='border-2 pt-0 border-secondary'
      sortBy={[{ id: 'apy', desc: true }]}
      data={data}
      columns={columns}
    />
  )
}

const Collaterals = () => {
  return (
    <div className="my-4 md:my-8 mx-2 md:mx-4">
      <CollateralYieldUpdater />
      <div className="flex items-center gap-2 pl-5 flex-wrap mb-4 md:mb-8">
        <BasketCubeIcon fontSize={32} />
        <h2 className="mr-auto text-xl font-medium">Available Collaterals</h2>
        <div className="hidden md:flex gap-2 ml-2">
          <Button
            size="sm"
            variant="outline"
            className="border-2"
            onClick={() => window.open(REGISTER_FEEDBACK, '_blank')}
          >
            Request plugin
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-2"
            onClick={() => window.open(DISCORD_INVITE, '_blank')}
          >
            Discuss on discord
          </Button>
        </div>
      </div>
      <PluginList />
      <DeployHero className="mt-6" />
    </div>
  )
}

export default Collaterals
