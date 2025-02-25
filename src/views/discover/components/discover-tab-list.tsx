import { TabsTrigger, TabsList } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export type Tab = {
  value: 'index' | 'yield' | 'stablecoins'
  icon: React.ReactNode
  title: string
  subtitle: string
}

type DiscoverTabTriggerProps = Tab & React.ComponentProps<typeof TabsTrigger>

const DiscoverTabTrigger = ({
  icon,
  title,
  subtitle,
  className,
  ...props
}: DiscoverTabTriggerProps) => {
  return (
    <TabsTrigger
      className={cn(
        'flex items-center justify-center lg:justify-start w-full h-full p-3 lg:p-6 rounded-[10px] sm:rounded-[20px] hover:bg-foreground/5',
        'data-[state=active]:text-primary data-[state=inactive]:text-legend data-[state=inactive]:grayscale',
        className
      )}
      {...props}
    >
      <div className="hidden sm:block">{icon}</div>
      <div className="text-left ml-1 sm:ml-3">
        <h4 className="text-base lg:font-bold">{title}</h4>
        <div className="hidden lg:block text-sm font-light text-wrap">
          {subtitle}
        </div>
      </div>
    </TabsTrigger>
  )
}

const DiscoverTabList = ({
  tabs,
  className,
}: {
  tabs: Tab[]
  className?: string
}) => {
  return (
    <TabsList
      className={cn(
        'w-full h-12 gap-1 lg:h-[100px] rounded-xl lg:rounded-4xl bg-[#f2f2f2]',
        className
      )}
    >
      {tabs.map(({ value, ...t }) => (
        <DiscoverTabTrigger key={value} value={value} {...t} />
      ))}
    </TabsList>
  )
}

export default DiscoverTabList
