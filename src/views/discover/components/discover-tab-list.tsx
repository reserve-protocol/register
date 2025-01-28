import { TabsTrigger, TabsList } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export type Tab = {
  value: 'index' | 'yield'
  icon: string
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
        'flex items-center justify-center lg:justify-start w-full h-full p-3 sm:p-6 rounded-[10px] sm:rounded-[20px] shadow-sm',
        'data-[state=active]:text-primary data-[state=inactive]:text-legend data-[state=inactive]:grayscale',
        className
      )}
      {...props}
    >
      <img src={icon} className="rounded-full h-4 w-4 sm:h-8 sm:w-8" />
      <div className="text-left ml-1 sm:ml-3">
        <div className="text-sm sm:text-xl font-bold">{title}</div>
        <div className="hidden lg:block text-base font-light">{subtitle}</div>
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
      className={cn('w-full h-12 sm:h-[100px] rounded-[10px] sm:rounded-[20px] bg-[#f2f2f2]', className)}
    >
      {tabs.map(({ value, ...t }) => (
        <DiscoverTabTrigger key={value} value={value} {...t} />
      ))}
    </TabsList>
  )
}

export default DiscoverTabList
