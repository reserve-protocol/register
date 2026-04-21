import SectionAnchor from '@/components/section-anchor'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFStrategiesAtom } from '@/state/dtf/yield-index-atoms'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import CompositionDesktop from './yield-index-composition-desktop'
import CompositionMobile from './yield-index-composition-mobile'
import TabSelector, {
  CompositionTab,
} from './yield-index-composition-tabs'

const CompositionBody = () => {
  const [activeTab, setActiveTab] = useState<CompositionTab>('strategies')

  return (
    <>
      <div className="sm:hidden">
        <div className="mb-6">
          <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <CompositionMobile activeTab={activeTab} />
      </div>
      <div className="hidden sm:block">
        <div className="flex items-center mb-2">
          <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <CompositionDesktop activeTab={activeTab} />
      </div>
    </>
  )
}

const YieldIndexComposition = () => {
  const strategies = useAtomValue(indexDTFStrategiesAtom)

  return (
    <Card className="group/section" id="composition">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-1 mb-4">
          <h2 className="text-2xl font-light">Composition</h2>
          <SectionAnchor id="composition" />
        </div>
        {strategies ? (
          <CompositionBody />
        ) : (
          <Skeleton className="w-full h-40" />
        )}
      </div>
    </Card>
  )
}

export default YieldIndexComposition
