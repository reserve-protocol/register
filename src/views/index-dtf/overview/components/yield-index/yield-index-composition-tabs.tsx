import { cn } from '@/lib/utils'

export type CompositionTab = 'strategies' | 'assets' | 'protocols'

export const COLUMN_HEADERS: Record<CompositionTab, [string, string, string]> =
  {
    strategies: ['Weight', 'Protocol(s)', 'Est. APY'],
    assets: ['Exposure Share', 'Type', 'Provider'],
    protocols: ['Exposure Share', 'Role', 'Used in'],
  }

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

export default TabSelector
