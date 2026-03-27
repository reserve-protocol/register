import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { indexDTFCompositionAtom } from '@/state/dtf/atoms'
import { chainIdAtom } from '@/state/atoms'
import { formatPercentage } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRight } from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import SectionAnchor from '@/components/section-anchor'
import { PROJECT_ICONS } from '@/views/earn/hooks/useEarnTableColumns'

type CompositionTab = 'strategies' | 'assets' | 'protocols'

const TabButton = ({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={`px-2.5 py-1 text-sm rounded-xl transition-all ${
      active
        ? 'bg-card text-primary shadow-sm font-medium'
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    {label}
  </button>
)

const COLUMN_HEADERS: Record<CompositionTab, [string, string, string]> = {
  strategies: ['Weight', 'Protocol(s)', 'Est. APY'],
  assets: ['Exposure Share', 'Type', 'Provider'],
  protocols: ['Exposure Share', 'Role', 'Used in'],
}

const TabSelector = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: CompositionTab
  setActiveTab: (tab: CompositionTab) => void
}) => (
  <div className="inline-flex items-center rounded-2xl bg-muted p-0.5 gap-0.5">
    <TabButton
      label="Strategies"
      active={activeTab === 'strategies'}
      onClick={() => setActiveTab('strategies')}
    />
    <TabButton
      label="Assets"
      active={activeTab === 'assets'}
      onClick={() => setActiveTab('assets')}
    />
    <TabButton
      label="Protocols"
      active={activeTab === 'protocols'}
      onClick={() => setActiveTab('protocols')}
    />
  </div>
)

const MobileStrategies = ({ chainId }: { chainId: number }) => {
  const data = useAtomValue(indexDTFCompositionAtom)
  if (!data) return null

  return (
    <div className="flex flex-col divide-y divide-secondary">
      {data.strategies.map((s) => (
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

const MobileAssets = ({ chainId }: { chainId: number }) => {
  const data = useAtomValue(indexDTFCompositionAtom)
  if (!data) return null

  return (
    <div className="flex flex-col divide-y divide-secondary">
      {data.assets.map((a) => (
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
  const data = useAtomValue(indexDTFCompositionAtom)
  if (!data) return null

  return (
    <div className="flex flex-col divide-y divide-secondary">
      {data.protocols.map((p) => (
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

const DesktopTable = ({
  activeTab,
  chainId,
}: {
  activeTab: CompositionTab
  chainId: number
}) => {
  const data = useAtomValue(indexDTFCompositionAtom)
  if (!data) return null

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
            className={`font-normal pb-3 w-[15%] ${activeTab === 'strategies' ? 'text-right' : 'text-left'}`}
          >
            {headers[2]}
          </th>
        </tr>
      </thead>
      <tbody className="text-base">
        {activeTab === 'strategies' &&
          data.strategies.map((s) => (
            <tr key={s.collateralAddress} className="h-14">
              <td className="py-4">
                <div className="flex items-center gap-3 whitespace-nowrap">
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
                  <span className="font-medium">{s.name}</span>
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
              </td>
              <td className="text-right py-4 px-2">
                {formatPercentage(s.weight)}
              </td>
              <td className="text-left py-4 pl-6">{s.protocols}</td>
              <td className="text-right text-primary py-4">
                {formatPercentage(s.estApy)}
              </td>
            </tr>
          ))}
        {activeTab === 'assets' &&
          data.assets.map((a) => (
            <tr key={a.address} className="h-14">
              <td className="py-0">
                <div className="flex items-center gap-3">
                  <TokenLogo
                    symbol={a.symbol}
                    address={a.address}
                    chain={chainId}
                    size="lg"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{a.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {a.symbol}
                    </span>
                  </div>
                </div>
              </td>
              <td className="text-right text-primary py-4 px-2">
                {formatPercentage(a.weight)}
              </td>
              <td className="text-left py-4 pl-6">{a.type}</td>
              <td className="text-left py-4">{a.provider}</td>
            </tr>
          ))}
        {activeTab === 'protocols' &&
          data.protocols.map((p) => (
            <tr key={p.name} className="h-14">
              <td className="py-4">
                <div className="flex items-center gap-3">
                  {PROJECT_ICONS[p.project]
                    ? React.cloneElement(PROJECT_ICONS[p.project], {
                        width: 18,
                        fontSize: 18,
                      })
                    : null}
                  <span className="font-medium">{p.name}</span>
                </div>
              </td>
              <td className="text-right text-primary py-4 px-2">
                {formatPercentage(p.exposureShare)}
              </td>
              <td className="text-left py-4 pl-6">{p.role}</td>
              <td className="text-left py-4">
                {p.usedIn} Strateg{p.usedIn === 1 ? 'y' : 'ies'}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  )
}

const YieldIndexComposition = () => {
  const [activeTab, setActiveTab] = useState<CompositionTab>('strategies')
  const data = useAtomValue(indexDTFCompositionAtom)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <Card className="group/section" id="composition">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-1 mb-4">
          <h2 className="text-2xl font-light">Composition</h2>
          <SectionAnchor id="composition" />
        </div>
        {!data ? (
          <Skeleton className="w-full h-40" />
        ) : (
          <>
            {/* Mobile */}
            <div className="sm:hidden">
              <div className="mb-6">
                <TabSelector
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>
              {activeTab === 'strategies' && (
                <MobileStrategies chainId={chainId} />
              )}
              {activeTab === 'assets' && <MobileAssets chainId={chainId} />}
              {activeTab === 'protocols' && <MobileProtocols />}
            </div>

            {/* Desktop */}
            <div className="hidden sm:block">
              <div className="flex items-center mb-2">
                <TabSelector
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>
              <DesktopTable activeTab={activeTab} chainId={chainId} />
            </div>
          </>
        )}
      </div>
    </Card>
  )
}

export default YieldIndexComposition
