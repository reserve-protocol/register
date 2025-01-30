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
    <div className="flex justify-between items-center gap-2 sm:gap-16 px-4 sm:px-8 mb-5 sm:mb-10">
      <YieldIconAlt className="min-w-4 min-h-4 hidden sm:block sm:opacity-20" />
      <YieldIconAlt className="min-w-4 min-h-4 text-primary sm:text-inherit sm:opacity-40" />
      <YieldIconAlt className="min-w-4 min-h-4 text-primary sm:text-inherit sm:opacity-60" />
      <h2 className="text-primary text-xl sm:text-2xl font-bold whitespace-nowrap">
        Select a DTF Category
      </h2>
      <YieldIconAlt className="min-w-4 min-h-4 text-primary sm:text-inherit scale-x-[-1] sm:opcaity-60" />
      <YieldIconAlt className="min-w-4 min-h-4 text-primary sm:text-inherit scale-x-[-1] sm:opacity-40" />
      <YieldIconAlt className="min-w-4 min-h-4 hidden sm:block scale-x-[-1] sm:opacity-20" />
    </div>
  )
}

const DiscoverTabs = ({ className }: { className: string }) => {
  return (
    <div className={cn('container pb-6 px-2 md:px-4', className)}>
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
