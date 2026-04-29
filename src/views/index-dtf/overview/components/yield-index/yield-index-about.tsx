import { Skeleton } from '@/components/ui/skeleton'
import {
  indexDTFAtom,
  indexDTFBrandAtom,
  isBrandManagerAtom,
} from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import SectionAnchor from '@/components/section-anchor'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'
import { Button } from '@/components/ui/button'
import { ImagePlus } from 'lucide-react'
import { useTrackIndexDTFClick } from '../../../hooks/useTrackIndexDTFPage'

const YieldIndexAbout = () => {
  const data = useAtomValue(indexDTFAtom)
  const brandData = useAtomValue(indexDTFBrandAtom)
  const isBrandManager = useAtomValue(isBrandManagerAtom)
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')

  if (!data || !brandData) {
    return (
      <div className="p-4 sm:p-6">
        <Skeleton className="w-full h-20" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-2xl font-light mb-1">
          About {data.token.symbol}
        </h2>
        <SectionAnchor id="about" />
        {isBrandManager && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="ml-auto gap-1 rounded-full"
          >
            <Link
              to={`../${ROUTES.MANAGE}`}
              onClick={() => trackClick('brand_manager')}
            >
              <ImagePlus size={14} />
              Edit page
            </Link>
          </Button>
        )}
      </div>
      <p className="text-legend mb-4">
        {brandData.dtf?.description || data.mandate}
      </p>
      <div className="flex items-center gap-4 text-sm">
        {brandData.socials?.website && (
          <Link
            to={brandData.socials.website}
            target="_blank"
            className="underline text-muted-foreground hover:text-foreground"
          >
            Website
          </Link>
        )}
        <Link
          to={`../${ROUTES.FACTSHEET}`}
          className="underline text-muted-foreground hover:text-foreground"
        >
          Performance Sheet
        </Link>
        {brandData.socials?.twitter && (
          <Link
            to={brandData.socials.twitter}
            target="_blank"
            className="underline text-muted-foreground hover:text-foreground"
          >
            X Account
          </Link>
        )}
      </div>
    </div>
  )
}

export default YieldIndexAbout
