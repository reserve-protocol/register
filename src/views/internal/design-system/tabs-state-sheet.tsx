import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { tabPresentationRecipe } from '@/components/design-system-v1/tab-presentation'
import { cn } from '@/lib/utils'

const TabsStateSheet = () => (
  <section
    data-testid="tabs-state-sheet"
    className="space-y-6"
    aria-labelledby="tabs-state-sheet-title"
  >
    <div>
      <p className="text-sm font-medium text-primary">
        Accepted visual baseline
      </p>
      <h2 id="tabs-state-sheet-title" className="mt-1 text-xl font-medium">
        Text-only and contained Tabs
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
        These presentations preserve the reviewed visual work. Panel semantics,
        overflow, deep linking, counts, and the final reusable Tabs API remain
        unresolved and are not being approved by this specimen.
      </p>
    </div>

    <div className="grid gap-6 xl:grid-cols-2">
      <TabSpecimen title="Text only · compact" detail="14px · 32px row">
        <TextOnlyTabs size="compact" />
      </TabSpecimen>
      <TabSpecimen title="Text only · default" detail="16px · 44px row">
        <TextOnlyTabs size="default" />
      </TabSpecimen>
      <TabSpecimen
        title="Text only · full width"
        detail="44px row · equal-width items"
        wide
      >
        <TextOnlyTabs size="default" width="full" />
      </TabSpecimen>
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
        title="Contained · full width"
        detail="44px track · equal-width items"
        wide
      >
        <ContainedTabs size="default" width="full" />
      </TabSpecimen>
    </div>
  </section>
)

export const TabsOverviewSpecimen = () => (
  <div data-testid="tabs-overview-specimen" className="w-full space-y-5">
    <div className="flex flex-col items-start gap-2">
      <span className="text-xs font-light text-muted-foreground">
        Text only · compact
      </span>
      <TextOnlyTabs size="compact" />
    </div>
    <div className="flex flex-col items-start gap-2">
      <span className="text-xs font-light text-muted-foreground">
        Text only · default
      </span>
      <TextOnlyTabs size="default" />
    </div>
    <div className="flex flex-col items-start gap-2">
      <span className="text-xs font-light text-muted-foreground">
        Contained · compact
      </span>
      <ContainedTabs size="compact" />
    </div>
  </div>
)

const TextOnlyTabs = ({
  size,
  width = 'content',
}: {
  size: 'compact' | 'default'
  width?: 'content' | 'full'
}) => {
  const recipe = tabPresentationRecipe.textOnly[size]
  const layout = tabPresentationRecipe.textOnly.layout[width]

  return (
    <Tabs defaultValue="30d">
      <TabsList
        className={cn(recipe.list, layout.track)}
        data-text-tabs-layout={width}
        aria-label={`${size} time range`}
      >
        {['1d', '7d', '30d', '90d', 'YTD'].map((label) => (
          <TabsTrigger
            key={label}
            value={label}
            className={cn(
              recipe.item,
              layout.item,
              tabPresentationRecipe.textOnly.state
            )}
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

const ContainedTabs = ({
  size,
  width = 'content',
}: {
  size: 'compact' | 'default'
  width?: 'content' | 'full'
}) => {
  const recipe = tabPresentationRecipe.contained[size]
  const layout = tabPresentationRecipe.contained.layout[width]

  return (
    <Tabs defaultValue="exposure">
      <TabsList
        className={cn(recipe.list, layout.track)}
        data-contained-tabs-layout={width}
        aria-label={`${size} basket view`}
      >
        <TabsTrigger
          value="exposure"
          className={cn(
            recipe.item,
            layout.item,
            tabPresentationRecipe.contained.state
          )}
        >
          Exposure
        </TabsTrigger>
        <TabsTrigger
          value="collateral"
          className={cn(
            recipe.item,
            layout.item,
            tabPresentationRecipe.contained.state
          )}
        >
          Collateral
        </TabsTrigger>
        <TabsTrigger
          value="disabled"
          disabled
          className={cn(
            recipe.item,
            layout.item,
            tabPresentationRecipe.contained.state
          )}
        >
          Disabled
        </TabsTrigger>
      </TabsList>
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
