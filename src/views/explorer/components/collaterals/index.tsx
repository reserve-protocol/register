import { Button } from '@/components/ui/button'
import YieldDTFDeployHero from '@/components/yield-dtf-deploy-hero'
import { msg } from '@lingui/core/macro'
import type { MessageDescriptor } from '@lingui/core'
import { Plural, Trans, useLingui } from '@lingui/react/macro'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import CollateralYieldUpdater from 'state/updaters/CollateralYieldUpdater'
import { formatPercentage, parseDuration } from 'utils'
import { REGISTER_FEEDBACK, supportedChainList } from 'utils/constants'
import MultiselectDropdrown from '../MultiselectDropdown'
import ChainFilter from '../filters/ChainFilter'
import {
  ExplorerCard,
  ExplorerHeader,
  ExplorerSubtitle,
  ExplorerToolbar,
} from '../kit/explorer-layout'
import ExplorerTable from '../kit/explorer-table'
import { PillLabel, PillValue, SelectPill } from '../kit/filter-pill'
import SearchField from '../kit/search-field'
import { allPluginsAtom, type Plugin } from './atoms'
import CollateralItem, {
  AddressLink,
  CollateralName,
  compact,
  getUnderlying,
} from './collateral-item'
import { filterCollaterals, getProtocolLabel } from './utils'

const SORTS = {
  apy: msg`APY`,
  supply: msg`Supply`,
} satisfies Record<string, MessageDescriptor>

type SortKey = keyof typeof SORTS

const Collaterals = () => {
  const { t } = useLingui()
  const plugins = useAtomValue(allPluginsAtom) as Plugin[] | undefined
  const [search, setSearch] = useState('')
  const [chains, setChains] = useState(() =>
    supportedChainList.map((chain) => chain.toString())
  )
  const [protocols, setProtocols] = useState<string[]>([])
  const [targets, setTargets] = useState<string[]>([])
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'apy', desc: true },
  ])

  const data = useMemo(
    () => filterCollaterals(plugins ?? [], { search, chains, protocols, targets }),
    [plugins, search, chains, protocols, targets]
  )

  const options = useMemo(() => {
    const unique = (values: string[]) => [...new Set(values)].sort()
    return {
      protocols: unique((plugins ?? []).map((plugin) => plugin.protocol)).map(
        (protocol) => ({
          label: getProtocolLabel(protocol),
          value: protocol,
          icon: null,
        })
      ),
      targets: unique((plugins ?? []).map((plugin) => plugin.targetName)).map(
        (target) => ({ label: target, value: target, icon: null })
      ),
    }
  }, [plugins])

  const columns = useMemo<ColumnDef<Plugin>[]>(
    () => [
      {
        id: 'symbol',
        header: t`Collateral`,
        accessorFn: (plugin) => plugin.symbol,
        cell: ({ row }) => <CollateralName plugin={row.original} size={30} />,
      },
      {
        id: 'underlying',
        header: t`Underlying`,
        accessorFn: (plugin) => getUnderlying(plugin).symbol,
        cell: ({ row }) => (
          <AddressLink
            address={getUnderlying(row.original).address}
            chainId={row.original.chainId}
          >
            {getUnderlying(row.original).symbol}
          </AddressLink>
        ),
      },
      {
        id: 'protocol',
        header: t`Protocol`,
        accessorFn: (plugin) => getProtocolLabel(plugin.protocol),
      },
      {
        id: 'target',
        header: t`Target`,
        accessorFn: (plugin) => plugin.targetName,
        cell: ({ row }) => (
          <span
            className="block max-w-[220px] truncate text-legend"
            title={row.original.targetName}
          >
            {row.original.targetName}
          </span>
        ),
      },
      {
        id: 'apy',
        header: 'APY',
        accessorFn: (plugin) => plugin.apy,
        meta: { className: 'text-right' },
        cell: ({ row }) => formatPercentage(row.original.apy),
      },
      {
        id: 'supply',
        header: t`Supply`,
        accessorFn: (plugin) => plugin.supply,
        meta: { className: 'text-right' },
        cell: ({ row }) => compact(row.original.supply),
      },
      {
        id: 'maxTrade',
        header: t`Max trade`,
        accessorFn: (plugin) => +plugin.maxTradeVolume,
        meta: { className: 'text-right' },
        cell: ({ row }) => compact(+row.original.maxTradeVolume),
      },
      {
        id: 'delay',
        header: t`Delay`,
        accessorFn: (plugin) => +plugin.delayUntilDefault,
        meta: { className: 'whitespace-nowrap' },
        cell: ({ row }) => parseDuration(+row.original.delayUntilDefault),
      },
      {
        id: 'version',
        header: t`Version`,
        accessorFn: (plugin) => plugin.version,
        cell: ({ row }) => (
          <span className="text-legend">{row.original.version}</span>
        ),
      },
    ],
    [t]
  )

  const allOrCount = (selected: string[]) =>
    selected.length ? t`${selected.length} selected` : t`All`

  return (
    <>
      <CollateralYieldUpdater />
      <ExplorerHeader
        title={<Trans>Collaterals</Trans>}
        subtitle={
          plugins && (
            <ExplorerSubtitle
              value={
                <Plural value={data.length} one="# plugin" other="# plugins" />
              }
            />
          )
        }
      >
        <Button
          variant="accent"
          className="rounded-full font-semibold"
          onClick={() => window.open(REGISTER_FEEDBACK, '_blank')}
        >
          <Trans>Request plugin</Trans>
        </Button>
      </ExplorerHeader>
      <ExplorerCard>
        <ExplorerToolbar>
          <SearchField
            label={t`Search collaterals`}
            placeholder={t`Search collateral`}
            value={search}
            onChange={setSearch}
          />
          <ChainFilter selected={chains} onChange={setChains} />
          <MultiselectDropdrown
            options={options.protocols}
            selected={protocols}
            onChange={setProtocols}
            allOption
          >
            <PillLabel>
              <Trans>Protocol</Trans>
            </PillLabel>
            <PillValue>{allOrCount(protocols)}</PillValue>
          </MultiselectDropdrown>
          <MultiselectDropdrown
            options={options.targets}
            selected={targets}
            onChange={setTargets}
            allOption
          >
            <PillLabel>
              <Trans>Target</Trans>
            </PillLabel>
            <PillValue>{allOrCount(targets)}</PillValue>
          </MultiselectDropdrown>
          <SelectPill
            className="sm:hidden"
            label={<Trans>Sort</Trans>}
            value={(sorting[0]?.id in SORTS ? sorting[0].id : 'apy') as SortKey}
            options={(Object.keys(SORTS) as SortKey[]).map((key) => ({
              value: key,
              label: t(SORTS[key]),
            }))}
            onChange={(id) => setSorting([{ id, desc: true }])}
            highlighted
          />
        </ExplorerToolbar>
        <ExplorerTable
          data={data}
          columns={columns}
          getRowId={(plugin) => `${plugin.chainId}-${plugin.address}`}
          renderItem={(plugin) => <CollateralItem plugin={plugin} />}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={!plugins}
          emptyLabel={<Trans>No collaterals match these filters</Trans>}
        />
      </ExplorerCard>
      <YieldDTFDeployHero className="mx-3 sm:mx-0" />
    </>
  )
}

export default Collaterals
