import { Tabs, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import DiscoverTabList, { Tab } from './discover-tab-list'
import DiscoverIndexDTF from './index/discover-index-dtf'
import DiscoverYieldDTF from './yield/discover-yield-dtf'

import { Flower, Globe, Scale } from 'lucide-react'
import TitleContainer from './title-container'

const tabs: Tab[] = [
  {
    value: 'index',
    icon: <Globe />,
    title: 'Index DTFs',
    subtitle: 'Get easy exposure to narratives, indexes, and ecosystems',
  },
  {
    value: 'yield',
    icon: <Flower />,
    title: 'Yield DTFs',
    subtitle: 'Earn yield safely with diversified DeFi positions',
  },
  {
    value: 'stablecoins',
    icon: <Scale />,
    title: 'Stablecoins',
    subtitle: 'Overcollateralized tokens pegged to the US dollar',
  },
]

const DiscoverTabs = ({ className }: { className: string }) => {
  return (
    <div className={cn('container pb-6 px-2 md:px-4', className)}>
      <TitleContainer title="Select a DTF Category" />
      <Tabs defaultValue="index">
        <DiscoverTabList tabs={tabs} className="mb-4" />

        <TabsContent className="mt-0" value="index">
          <DiscoverIndexDTF />
        </TabsContent>

        <TabsContent className="mt-0" value="yield">
          <DiscoverYieldDTF />
        </TabsContent>

        <TabsContent className="mt-0" value="stablecoins">
          <DiscoverYieldDTF stablecoins />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DiscoverTabs
