import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { trackClick } from '@/hooks/useTrackPage'
import { cn } from '@/lib/utils'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { useAtom } from 'jotai'
import { Flower, Globe } from 'lucide-react'
import { dtfTypeFilterAtom } from '../atoms'

type DTFType = 'index' | 'yield'

type Tab = {
  value: DTFType
  icon: React.ReactNode
  title: MessageDescriptor
  subtitle: MessageDescriptor
}

const tabs: Tab[] = [
  {
    value: 'index',
    icon: <Globe className="h-4 lg:h-6" />,
    title: msg`Index DTFs`,
    subtitle: msg`Get easy exposure to narratives, indexes, and ecosystems`,
  },
  {
    value: 'yield',
    icon: <Flower className="h-4 lg:h-6" />,
    title: msg`Yield DTFs`,
    subtitle: msg`Earn yield safely with over-collateralized and diversified DeFi positions`,
  },
]

const DtfTabTrigger = ({ value, icon, title, subtitle }: Tab) => {
  const { t } = useLingui()
  return (
  <TabsTrigger
    value={value}
    className={cn(
      'flex items-center justify-center lg:justify-start w-full h-full p-3 lg:py-6 lg:px-8 rounded-full hover:bg-foreground/5',
      'data-[state=active]:text-primary dark:data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground/ data-[state=inactive]:grayscale'
    )}
  >
    <div>{icon}</div>
    <div className="text-left lg:ml-4">
      <h4 className="text-base lg:font-bold">{t(title)}</h4>
      <div className="hidden lg:block font-light text-wrap">
        {t(subtitle)}
      </div>
    </div>
  </TabsTrigger>
  )
}

const DtfTabs = () => {
  const [type, setType] = useAtom(dtfTypeFilterAtom)

  const handleValueChange = (value: string) => {
    if (value !== 'index' && value !== 'yield') return
    setType(value)
    trackClick('discover', value)
  }

  return (
    <Tabs
      value={type}
      onValueChange={handleValueChange}
      className="px-2 lg:flex lg:justify-center 2xl:px-0"
    >
      <TabsList className="mb-3 h-12 w-full gap-1 rounded-full lg:mb-8 lg:h-[100px] lg:max-w-[760px]">
        {tabs.map((tab) => (
          <DtfTabTrigger key={tab.value} {...tab} />
        ))}
      </TabsList>
    </Tabs>
  )
}

export default DtfTabs
