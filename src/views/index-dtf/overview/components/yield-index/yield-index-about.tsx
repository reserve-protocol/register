import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import SectionAnchor from '@/components/section-anchor'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'
import ReadMoreText from '../read-more-text'

const YieldIndexAbout = () => {
  const data = useAtomValue(indexDTFAtom)
  const brandData = useAtomValue(indexDTFBrandAtom)

  if (!data || !brandData) {
    return (
      <div className="p-4 sm:p-6">
        <Skeleton className="w-full h-20" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-1">
        <h2 className="text-2xl font-light mb-1">
          About {data.token.symbol}
        </h2>
        <SectionAnchor id="about" />
      </div>
      <ReadMoreText
        text={brandData.dtf?.description || data.mandate}
        className="text-legend mb-4"
      />
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
