import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import {
  CompositionAsset,
  CompositionProtocol,
  CompositionStrategy,
  indexDTFAssetsAtom,
  indexDTFProtocolsAtom,
  indexDTFStrategiesAtom,
} from '@/state/dtf/atoms'
import { formatPercentage } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { PROJECT_ICONS } from '@/views/earn/hooks/useEarnTableColumns'
import { useAtomValue } from 'jotai'
import { ArrowUpRight } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'
import {
  COLUMN_HEADERS,
  CompositionTab,
} from './yield-index-composition-tabs'

const StrategyRow = ({
  strategy,
  chainId,
}: {
  strategy: CompositionStrategy
  chainId: number
}) => (
  <tr className="h-14">
    <td className="py-4">
      <div className="flex items-center gap-3 whitespace-nowrap">
        <StackTokenLogo
          tokens={strategy.underlyings.map((u) => ({
            symbol: u.symbol,
            address: u.address,
            chain: chainId,
          }))}
          size={24}
          outsource
          reverseStack
        />
        <span className="font-medium">{strategy.name}</span>
        <Link
          to={getExplorerLink(
            strategy.collateralAddress,
            chainId,
            ExplorerDataType.ADDRESS
          )}
          target="_blank"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </td>
    <td className="text-right py-4 px-2">{formatPercentage(strategy.weight)}</td>
    <td className="text-left py-4 pl-6">{strategy.protocols}</td>
    <td className="text-right text-primary py-4">
      {formatPercentage(strategy.estApy)}
    </td>
  </tr>
)

const AssetRow = ({
  asset,
  chainId,
}: {
  asset: CompositionAsset
  chainId: number
}) => (
  <tr className="h-14">
    <td className="py-0">
      <div className="flex items-center gap-3">
        <TokenLogo
          symbol={asset.symbol}
          address={asset.address}
          chain={chainId}
          size="lg"
        />
        <div className="flex flex-col">
          <span className="font-medium">{asset.name}</span>
          <span className="text-xs text-muted-foreground">{asset.symbol}</span>
        </div>
      </div>
    </td>
    <td className="text-right text-primary py-4 px-2">
      {formatPercentage(asset.weight)}
    </td>
    <td className="text-left py-4 pl-6">{asset.type}</td>
    <td className="text-left py-4">{asset.provider}</td>
  </tr>
)

const ProtocolRow = ({ protocol }: { protocol: CompositionProtocol }) => (
  <tr className="h-14">
    <td className="py-4">
      <div className="flex items-center gap-3">
        {PROJECT_ICONS[protocol.project]
          ? React.cloneElement(PROJECT_ICONS[protocol.project], {
              width: 18,
              fontSize: 18,
            })
          : null}
        <span className="font-medium">{protocol.name}</span>
      </div>
    </td>
    <td className="text-right text-primary py-4 px-2">
      {formatPercentage(protocol.exposureShare)}
    </td>
    <td className="text-left py-4 pl-6">{protocol.role}</td>
    <td className="text-left py-4">
      {protocol.usedIn} Strateg{protocol.usedIn === 1 ? 'y' : 'ies'}
    </td>
  </tr>
)

const DesktopBody = ({ activeTab }: { activeTab: CompositionTab }) => {
  const strategies = useAtomValue(indexDTFStrategiesAtom)
  const assets = useAtomValue(indexDTFAssetsAtom)
  const protocols = useAtomValue(indexDTFProtocolsAtom)
  const chainId = useAtomValue(chainIdAtom)

  if (activeTab === 'strategies') {
    return (
      <>
        {strategies?.map((s) => (
          <StrategyRow key={s.collateralAddress} strategy={s} chainId={chainId} />
        ))}
      </>
    )
  }

  if (activeTab === 'assets') {
    return (
      <>
        {assets?.map((a) => (
          <AssetRow key={a.address} asset={a} chainId={chainId} />
        ))}
      </>
    )
  }

  return (
    <>
      {protocols?.map((p) => <ProtocolRow key={p.name} protocol={p} />)}
    </>
  )
}

const CompositionDesktop = ({ activeTab }: { activeTab: CompositionTab }) => {
  const headers = COLUMN_HEADERS[activeTab]

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-muted-foreground">
          <th className="text-left font-normal pb-3 w-[40%]" />
          <th className="text-right font-normal pb-3 px-2 w-[20%]">
            {headers[0]}
          </th>
          <th className="text-left font-normal pb-3 pl-6 w-[25%]">
            {headers[1]}
          </th>
          <th
            className={cn(
              'font-normal pb-3 w-[15%]',
              activeTab === 'strategies' ? 'text-right' : 'text-left'
            )}
          >
            {headers[2]}
          </th>
        </tr>
      </thead>
      <tbody className="text-base">
        <DesktopBody activeTab={activeTab} />
      </tbody>
    </table>
  )
}

export default CompositionDesktop
