import { Tabs, TabsContent } from '@/components/ui/tabs'
import DiscoverIndexDTF from './index/discover-index-dtf'
import DiscoverYieldDTF from './yield/discover-yield-dtf'
import DiscoverTabList, { Tab } from './discover-tab-list'
import YieldIconAlt from '@/components/icons/YieldIconAlt'
import { cn } from '@/lib/utils'

import tabIndex from '../assets/tab_index.jpg'
import tabYield from '../assets/tab_yield.jpg'

const tabs: Tab[] = [
  {
    value: 'index',
    icon: tabIndex,
    title: 'Index DTFs',
    subtitle: 'Get easy exposure to narratives, indexes, and ecosystems',
  },
  {
    value: 'yield',
    icon: tabYield,
    title: 'Yield DTFs',
    subtitle:
      'Earn yield safely with over-collateralized and diversified DeFi positions',
  },
]

const Title = () => {
  return (
    <div className="flex justify-center md:justify-between items-center gap-16 px-8 mb-10">
      <YieldIconAlt className="hidden md:block opacity-20" />
      <YieldIconAlt className="hidden md:block opacity-40" />
      <YieldIconAlt className="hidden md:block opacity-60" />
      <h2 className="text-primary text-2xl font-bold whitespace-nowrap">
        Select a DTF Category
      </h2>
      <YieldIconAlt className="hidden md:block scale-x-[-1] opcaity-60" />
      <YieldIconAlt className="hidden md:block scale-x-[-1] opacity-40" />
      <YieldIconAlt className="hidden md:block scale-x-[-1] opacity-20" />
    </div>
  )
}

const DiscoverTabs = ({ className }: { className: string }) => {
  return (
    <div className={cn('container pb-6 px-4', className)}>
      <Title />
      <Tabs defaultValue="index">
        <DiscoverTabList tabs={tabs} className="mb-4" />

        <TabsContent className="mt-0" value="index">
          <DiscoverIndexDTF />
        </TabsContent>

        <TabsContent className="mt-0" value="yield">
          <DiscoverYieldDTF />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DiscoverTabs
