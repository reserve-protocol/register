import { cn } from '@/lib/utils'
import { msg } from '@lingui/core/macro'
import type { MessageDescriptor } from '@lingui/core'
import { Trans } from '@lingui/react/macro'
import type { ReactNode } from 'react'

export type CompositionTab = 'strategies' | 'assets' | 'protocols'

export const COLUMN_HEADERS: Record<
  CompositionTab,
  [MessageDescriptor, MessageDescriptor, MessageDescriptor]
> = {
  strategies: [msg`Weight`, msg`Protocol(s)`, msg`Est. APY`],
  assets: [msg`Exposure Share`, msg`Type`, msg`Provider`],
  protocols: [msg`Exposure Share`, msg`Role`, msg`Used in`],
}

const TabButton = ({
  label,
  active,
  onClick,
}: {
  label: ReactNode
  active: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={cn(
      'px-2.5 py-1 text-sm rounded-xl transition-all',
      active
        ? 'bg-card text-primary shadow-sm font-medium'
        : 'text-muted-foreground hover:text-foreground'
    )}
  >
    {label}
  </button>
)

const TabSelector = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: CompositionTab
  setActiveTab: (tab: CompositionTab) => void
}) => (
  <div className="inline-flex items-center rounded-2xl bg-muted p-0.5 gap-0.5">
    <TabButton
      label={<Trans>Strategies</Trans>}
      active={activeTab === 'strategies'}
      onClick={() => setActiveTab('strategies')}
    />
    <TabButton
      label={<Trans>Assets</Trans>}
      active={activeTab === 'assets'}
      onClick={() => setActiveTab('assets')}
    />
    <TabButton
      label={<Trans>Protocols</Trans>}
      active={activeTab === 'protocols'}
      onClick={() => setActiveTab('protocols')}
    />
  </div>
)

export default TabSelector
