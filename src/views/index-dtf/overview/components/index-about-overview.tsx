import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  indexDTFAtom,
  indexDTFBrandAtom,
  isBrandManagerAtom,
} from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { useAtomValue } from 'jotai'
import { BrickWall, FileChartColumn, ImagePlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTrackIndexDTFClick } from '../../hooks/useTrackIndexDTFPage'
import IndexFactsheetOverview from './index-factsheet-overview'
import IndexMetricsOverview from './index-metrics-overview'
import IndexSocialsOverview from './index-socials-overview'

const BrandManagerEditButton = () => {
  const isBrandManager = useAtomValue(isBrandManagerAtom)

  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')

  if (!isBrandManager) {
    return null
  }

  return (
    <Link
      to={`../${ROUTES.MANAGE}`}
      onClick={() => trackClick('brand_manager')}
    >
      <Button variant="outline" size="sm" className="gap-1 rounded-full">
        <ImagePlus size={14} />
        Edit page
      </Button>
    </Link>
  )
}

const FactsheetButton = () => {
  return (
    <Link to={`../${ROUTES.FACTSHEET}`}>
      <Button variant="outline" size="sm" className="gap-1 rounded-full">
        <FileChartColumn size={14} />
        Performance
      </Button>
    </Link>
  )
}

const Header = () => {
  const data = useAtomValue(indexDTFAtom)

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="rounded-full border border-foreground p-2 mr-auto">
        <BrickWall size={14} strokeWidth={1.5} />
      </div>

      {!data ? (
        <Skeleton className="w-60 h-6" />
      ) : (
        <div className="flex gap-1 items-center">
          <BrandManagerEditButton />
          <FactsheetButton />
          <IndexSocialsOverview />
        </div>
      )}
    </div>
  )
}

const Mandate = () => {
  const data = useAtomValue(indexDTFAtom)
  const brandData = useAtomValue(indexDTFBrandAtom)

  if (!data || !brandData) {
    return <Skeleton className="w-full h-20" />
  }

  return (
    <div>
      <h2 className="text-2xl font-light mb-1">About this DTF</h2>
      {!data ? (
        <div>
          <Skeleton className="w-full h-20" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-legend">
            {brandData.dtf?.description || data.mandate}
          </p>
        </div>
      )}
    </div>
  )
}

const IndexAboutOverview = () => (
  <Card>
    <div className="p-4 sm:p-6">
      <Header />
      <Mandate />
      <div className="w-fit">
        <IndexFactsheetOverview />
      </div>
    </div>
    <IndexMetricsOverview />
  </Card>
)

export default IndexAboutOverview
