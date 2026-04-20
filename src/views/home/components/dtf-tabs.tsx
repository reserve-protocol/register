import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { trackClick } from '@/hooks/useTrackPage'
import { cn } from '@/lib/utils'
import { useAtom } from 'jotai'
import { Flower, Globe } from 'lucide-react'
import { dtfTypeFilterAtom } from '../atoms'

type DTFType = 'index' | 'yield'

type Tab = {
  value: DTFType
  icon: React.ReactNode
  title: string
  subtitle: string
}

const tabs: Tab[] = [
  {
    value: 'index',
    icon: <Globe className='h-4 lg:h-6' />,
    title: 'Index DTFs',
    subtitle: 'Get easy exposure to narratives, indexes, and ecosystems',
  },
  {
    value: 'yield',
    icon: <Flower className='h-4 lg:h-6' />,
    title: 'Yield DTFs',
    subtitle: 'Earn yield safely with over-collateralized and diversified DeFi positions',
  },
]

const DtfTabTrigger = ({ value, icon, title, subtitle }: Tab) => (
  <TabsTrigger
    value={value}
    className={cn(
      'flex items-center justify-center lg:justify-start w-full h-full p-3 lg:p-6 rounded-full lg:rounded-3xl hover:bg-foreground/5',
      'data-[state=active]:text-primary dark:data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground/ data-[state=inactive]:grayscale'
    )}
  >
    <div>{icon}</div>
    <div className="text-left lg:ml-3">
      <h4 className="text-base lg:font-bold">{title}</h4>
      <div className="hidden lg:block font-light text-wrap">
        {subtitle}
      </div>
    </div>
  </TabsTrigger>
)

const DtfTabs = () => {
  const [type, setType] = useAtom(dtfTypeFilterAtom)

  const handleValueChange = (value: string) => {
    if (value !== 'index' && value !== 'yield') return
    setType(value)
    trackClick('discover', value)
  }

  return (
    <Tabs value={type} onValueChange={handleValueChange} className='px-2 2xl:px-0'>
      <TabsList className="w-full h-12 gap-1 lg:h-[100px] rounded-full lg:rounded-4xl mb-3 lg:mb-6">
        {tabs.map((tab) => (
          <DtfTabTrigger key={tab.value} {...tab} />
        ))}
      </TabsList>
    </Tabs>
  )
}

export default DtfTabs
