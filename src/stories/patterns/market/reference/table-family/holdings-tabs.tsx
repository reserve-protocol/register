import {
  TabsList,
  TabsTrigger,
  type TabsSize,
  type TabsWidth,
} from '@/components/design-system-v1/tabs'

export function HoldingsTabs({
  panelId,
  projection,
  size = 'compact',
  width = 'intrinsic',
}: {
  panelId: string
  projection: 'mobile' | 'desktop'
  size?: TabsSize
  width?: TabsWidth
}) {
  const id = `${panelId}-${projection}`
  return (
    <TabsList size={size} width={width} aria-label="Holdings type">
      <TabsTrigger
        id={`${id}-exposure`}
        value="exposure"
        aria-controls={panelId}
        data-table-focus="holdings-tab-exposure"
      >
        Exposure
      </TabsTrigger>
      <TabsTrigger
        id={`${id}-collateral`}
        value="collateral"
        aria-controls={panelId}
        data-table-focus="holdings-tab-collateral"
      >
        Collateral
      </TabsTrigger>
    </TabsList>
  )
}
