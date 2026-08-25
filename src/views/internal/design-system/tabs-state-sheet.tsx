import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/design-system-v1/tabs'
import { cn } from '@/lib/utils'

const TabsStateSheet = () => (
  <section
    data-testid="tabs-state-sheet"
    className="space-y-6"
    aria-labelledby="tabs-state-sheet-title"
  >
    <div>
      <p className="text-sm font-medium text-primary">
        Accepted current baseline
      </p>
      <h2 id="tabs-state-sheet-title" className="mt-1 text-xl font-medium">
        Contained Tabs
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        Compact and default sizes connect to real content panels and keyboard
        behavior. Intrinsic and full width are layout settings, not additional
        visual variants. Text-only navigation, counts, routes, deep linking, and
        any new overflow policy remain outside the contract.
      </p>
    </div>

    <div className="grid gap-6 xl:grid-cols-2">
      <TabSpecimen
        title="Contained · compact"
        detail="32px track · 12px item padding"
      >
        <ContainedTabs size="compact" />
      </TabSpecimen>
      <TabSpecimen
        title="Contained · default"
        detail="44px track · 20px item padding"
      >
        <ContainedTabs size="default" />
      </TabSpecimen>
      <TabSpecimen
        title="Contained · default"
        detail="Full-width layout behavior · 44px track"
        wide
      >
        <ContainedTabs size="default" width="full" />
      </TabSpecimen>
      <TabSpecimen
        title="State coverage"
        detail="Compact contained · keyboard focus remains inspectable"
        wide
      >
        <Tabs defaultValue="selected">
          <TabsList size="compact" aria-label="Tab state coverage">
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="selected">Selected</TabsTrigger>
            <TabsTrigger value="disabled" disabled>
              Disabled
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="available"
            className="mt-4 text-sm font-light text-muted-foreground"
          >
            Available panel
          </TabsContent>
          <TabsContent
            value="selected"
            className="mt-4 text-sm font-light text-muted-foreground"
          >
            Selected panel
          </TabsContent>
        </Tabs>
      </TabSpecimen>
    </div>
  </section>
)

export const TabsOverviewSpecimen = () => (
  <div data-testid="tabs-overview-specimen" className="w-full space-y-5">
    <div className="flex flex-col items-start gap-2">
      <span className="text-xs font-light text-muted-foreground">
        Contained · compact
      </span>
      <ContainedTabs size="compact" />
    </div>
    <div className="flex flex-col items-start gap-2">
      <span className="text-xs font-light text-muted-foreground">
        Contained · default
      </span>
      <ContainedTabs size="default" />
    </div>
  </div>
)

const ContainedTabs = ({
  size,
  width = 'intrinsic',
}: {
  size: 'compact' | 'default'
  width?: 'intrinsic' | 'full'
}) => {
  const panels = [
    { value: 'exposure', label: 'Exposure', content: 'Basket exposure panel' },
    {
      value: 'collateral',
      label: 'Collateral',
      content: 'Collateral backing panel',
    },
    {
      value: 'transactions',
      label: 'Transactions',
      content: 'Recent transactions panel',
    },
  ]

  return (
    <Tabs defaultValue="exposure">
      <TabsList
        size={size}
        width={width}
        data-contained-tabs-layout={width}
        aria-label={`${size} ${width} basket view`}
      >
        {panels.map((panel) => (
          <TabsTrigger key={panel.value} value={panel.value}>
            {panel.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {panels.map((panel) => (
        <TabsContent
          key={panel.value}
          value={panel.value}
          className="mt-4 text-sm font-light text-muted-foreground"
        >
          {panel.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}

const TabSpecimen = ({
  title,
  detail,
  children,
  wide = false,
}: {
  title: string
  detail: string
  children: React.ReactNode
  wide?: boolean
}) => (
  <div
    className={cn('border border-border bg-card p-6', wide && 'xl:col-span-2')}
  >
    <div className="mb-6 flex items-baseline justify-between gap-4">
      <h3 className="text-sm font-medium">{title}</h3>
      <span className="text-xs font-light text-muted-foreground">{detail}</span>
    </div>
    <div className="overflow-x-auto">{children}</div>
  </div>
)

export default TabsStateSheet
