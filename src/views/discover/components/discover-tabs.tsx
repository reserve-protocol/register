import { Tabs, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import DiscoverTabList, { Tab } from './discover-tab-list'
import DiscoverIndexDTF from './index/discover-index-dtf'
import DiscoverYieldDTF from './yield/discover-yield-dtf'

import { Flower, Globe, Scale } from 'lucide-react'
import TitleContainer from './title-container'
import { trackClick } from '@/hooks/useTrackPage'
import useScrollTo from '@/hooks/useScrollTo'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

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

const VALID_TABS = ['index', 'yield', 'stablecoins']

const DiscoverTabs = ({ className }: { className: string }) => {
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const defaultTab =
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'index'
  const scrollTo = useScrollTo('dtf-table')

  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setTimeout(() => scrollTo(), 300)
    }
  }, [tabParam, scrollTo])

  return (
    <>
      <div
        id="dtf-table"
        className={cn('container pb-6 px-0 md:px-4', className)}
      >
        <TitleContainer title="Select a DTF Category" className="mt-10" />

        <Tabs
          defaultValue={defaultTab}
          onValueChange={(value) => {
            trackClick('discover', value)
          }}
        >
          <div className="px-1 sm:px-0">
            <DiscoverTabList tabs={tabs} className="mb-2 lg:mb-4" />
          </div>

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
    </>
  )
}

export default DiscoverTabs
