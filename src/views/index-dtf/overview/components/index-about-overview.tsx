import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  indexDTFAtom,
  indexDTFBrandAtom,
  isBrandManagerAtom,
} from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { useAtomValue } from 'jotai'
import { BrickWall, ImagePlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTrackIndexDTFClick } from '../../hooks/useTrackIndexDTFPage'
import SectionAnchor from '@/components/section-anchor'
import ReadMoreText from './read-more-text'

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
        <BrandManagerEditButton />
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
      <div className="flex items-center gap-1">
        <h2 className="text-2xl font-light mb-1">About this DTF</h2>
        <SectionAnchor id="about" />
      </div>
      <ReadMoreText
        text={brandData.dtf?.description || data.mandate}
        className="text-legend"
      />
    </div>
  )
}

const AboutLinks = () => {
  const brandData = useAtomValue(indexDTFBrandAtom)

  return (
    <div className="flex items-center gap-4 text-sm mt-4">
      {brandData?.socials?.website && (
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
      {brandData?.socials?.twitter && (
        <Link
          to={brandData.socials.twitter}
          target="_blank"
          className="underline text-muted-foreground hover:text-foreground"
        >
          X Account
        </Link>
      )}
    </div>
  )
}

const IndexAboutOverview = () => (
  <div id="about" className="group/section">
    <div className="p-4 sm:p-6">
      <Header />
      <Mandate />
      <AboutLinks />
    </div>
  </div>
)

export default IndexAboutOverview
