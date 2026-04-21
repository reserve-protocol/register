import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { chainIdAtom } from '@/state/atoms'
import {
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
import { CompositionTab } from './yield-index-composition-tabs'

const MobileStrategies = () => {
  const strategies = useAtomValue(indexDTFStrategiesAtom)
  const chainId = useAtomValue(chainIdAtom)
  if (!strategies) return null

  return (
    <div className="flex flex-col divide-y divide-secondary">
      {strategies.map((s) => (
        <div
          key={s.collateralAddress}
          className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0"
        >
          <div className="flex items-center gap-2">
            <StackTokenLogo
              tokens={s.underlyings.map((u) => ({
                symbol: u.symbol,
                address: u.address,
                chain: chainId,
              }))}
              size={24}
              outsource
              reverseStack
            />
            <span className="font-medium flex-1">{s.name}</span>
            <Link
              to={getExplorerLink(
                s.collateralAddress,
                chainId,
                ExplorerDataType.ADDRESS
              )}
              target="_blank"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <span className="text-sm text-muted-foreground">{s.protocols}</span>
          <span className="text-sm">
            {formatPercentage(s.weight)} allocation ·{' '}
            <span className="text-primary">{formatPercentage(s.estApy)}</span>{' '}
            Est. APY
          </span>
        </div>
      ))}
    </div>
  )
}

const MobileAssets = () => {
  const assets = useAtomValue(indexDTFAssetsAtom)
  const chainId = useAtomValue(chainIdAtom)
  if (!assets) return null

  return (
    <div className="flex flex-col divide-y divide-secondary">
      {assets.map((a) => (
        <div
          key={a.address}
          className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0"
        >
          <div className="flex items-center gap-2">
            <TokenLogo
              symbol={a.symbol}
              address={a.address}
              chain={chainId}
              size="lg"
            />
            <div className="flex flex-col flex-1">
              <span className="font-medium">{a.name}</span>
              <span className="text-xs text-muted-foreground">{a.symbol}</span>
            </div>
          </div>
          <span className="text-sm">
            {formatPercentage(a.weight)} exposure · {a.type}
            {a.provider !== '-' && ` by ${a.provider}`}
          </span>
        </div>
      ))}
    </div>
  )
}

const MobileProtocols = () => {
  const protocols = useAtomValue(indexDTFProtocolsAtom)
  if (!protocols) return null

  return (
    <div className="flex flex-col divide-y divide-secondary">
      {protocols.map((p) => (
        <div
          key={p.name}
          className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0"
        >
          <div className="flex items-center gap-2">
            {PROJECT_ICONS[p.project]
              ? React.cloneElement(PROJECT_ICONS[p.project], {
                  width: 24,
                  fontSize: 24,
                })
              : null}
            <span className="font-medium">{p.name}</span>
          </div>
          <span className="text-sm text-muted-foreground">{p.role}</span>
          <span className="text-sm">
            {formatPercentage(p.exposureShare)} exposure · Used in {p.usedIn}{' '}
            Strateg{p.usedIn === 1 ? 'y' : 'ies'}
          </span>
        </div>
      ))}
    </div>
  )
}

const CompositionMobile = ({ activeTab }: { activeTab: CompositionTab }) => {
  if (activeTab === 'strategies') return <MobileStrategies />
  if (activeTab === 'assets') return <MobileAssets />
  return <MobileProtocols />
}

export default CompositionMobile
